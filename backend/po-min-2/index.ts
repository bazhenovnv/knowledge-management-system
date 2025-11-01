/**
 * Business: Proxy for external PO-MIN-2 API - forwards requests to the original service
 * Args: event with httpMethod, body, queryStringParameters; context with requestId
 * Returns: HTTP response with data from external API
 */

const EXTERNAL_API_URL = 'https://po-min-2.website.yandexcloud.net';

module.exports.handler = async function(event, context) {
    const { httpMethod, body, queryStringParameters } = event;
    
    if (httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            body: ''
        };
    }
    
    try {
        const url = new URL(EXTERNAL_API_URL);
        
        if (queryStringParameters) {
            Object.entries(queryStringParameters).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });
        }
        
        const response = await fetch(url.toString(), {
            method: httpMethod,
            headers: {
                'Content-Type': 'application/json'
            },
            body: httpMethod !== 'GET' && body ? body : undefined
        });
        
        const data = await response.text();
        
        return {
            statusCode: response.status,
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            isBase64Encoded: false,
            body: data
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            isBase64Encoded: false,
            body: JSON.stringify({ 
                error: 'Proxy error',
                message: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
};