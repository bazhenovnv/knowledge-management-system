import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Backend для отправки email уведомлений
    Args: event с httpMethod, body
    Returns: JSON ответ со статусом отправки
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        
        to_email = body_data.get('to_email')
        subject = body_data.get('subject')
        message = body_data.get('message')
        notification_type = body_data.get('type', 'info')
        
        if not to_email or not subject or not message:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing required fields: to_email, subject, message'}),
                'isBase64Encoded': False
            }
        
        result = send_email(to_email, subject, message, notification_type)
        
        return {
            'statusCode': 200 if result['success'] else 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': False, 'error': str(e)}),
            'isBase64Encoded': False
        }


def send_email(to_email: str, subject: str, message: str, notification_type: str) -> Dict[str, Any]:
    """Отправить email через SMTP"""
    try:
        smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = int(os.environ.get('SMTP_PORT', '587'))
        smtp_username = os.environ.get('SMTP_USERNAME')
        smtp_password = os.environ.get('SMTP_PASSWORD')
        from_email = os.environ.get('FROM_EMAIL', smtp_username)
        
        if not smtp_username or not smtp_password:
            return {
                'success': False,
                'error': 'SMTP credentials not configured'
            }
        
        msg = MIMEMultipart('alternative')
        msg['From'] = from_email
        msg['To'] = to_email
        msg['Subject'] = subject
        
        html_body = generate_email_html(subject, message, notification_type)
        text_body = message
        
        part1 = MIMEText(text_body, 'plain', 'utf-8')
        part2 = MIMEText(html_body, 'html', 'utf-8')
        
        msg.attach(part1)
        msg.attach(part2)
        
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(msg)
        
        return {
            'success': True,
            'message': f'Email sent to {to_email}'
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': f'Failed to send email: {str(e)}'
        }


def generate_email_html(subject: str, message: str, notification_type: str) -> str:
    """Сгенерировать HTML для email"""
    
    type_colors = {
        'info': '#3b82f6',
        'success': '#10b981',
        'warning': '#f59e0b',
        'error': '#ef4444',
        'assignment': '#8b5cf6',
    }
    
    type_icons = {
        'info': 'ℹ️',
        'success': '✅',
        'warning': '⚠️',
        'error': '❌',
        'assignment': '📋',
    }
    
    color = type_colors.get(notification_type, '#3b82f6')
    icon = type_icons.get(notification_type, '🔔')
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="background-color: {color}; padding: 20px; text-align: center;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 24px;">
                                    {icon} Центр развития и тестирования
                                </h1>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 30px;">
                                <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px;">
                                    {subject}
                                </h2>
                                <div style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                                    {message.replace(chr(10), '<br>')}
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Action Button -->
                        <tr>
                            <td style="padding: 0 30px 30px 30px; text-align: center;">
                                <a href="https://your-domain.com" 
                                   style="display: inline-block; padding: 12px 30px; background-color: {color}; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                    Перейти в систему
                                </a>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                                    Это автоматическое уведомление. Не отвечайте на это письмо.
                                </p>
                                <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
                                    © 2025 Центр развития и тестирования. Все права защищены.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    
    return html
