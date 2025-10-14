import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta


def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise ValueError('DATABASE_URL not configured')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Backend для отправки email уведомлений и планировщик
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
    
    try:
        conn = get_db_connection()
        
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            action = params.get('action', 'process')
            
            if action == 'process':
                scheduled_result = process_scheduled_notifications(conn)
                deadline_result = process_deadline_reminders(conn)
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'scheduled': scheduled_result,
                        'deadlines': deadline_result
                    }),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'schedule':
                with conn.cursor() as cur:
                    cur.execute("""
                        INSERT INTO scheduled_notifications 
                        (employee_id, notification_type, title, message, 
                         related_entity_type, related_entity_id, 
                         scheduled_for, channels)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING id
                    """, (
                        body_data['employeeId'],
                        body_data.get('type', 'info'),
                        body_data['title'],
                        body_data['message'],
                        body_data.get('entityType'),
                        body_data.get('entityId'),
                        body_data['scheduledFor'],
                        body_data.get('channels', ['database'])
                    ))
                    notification_id = cur.fetchone()['id']
                    conn.commit()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'notificationId': notification_id
                    }),
                    'isBase64Encoded': False
                }
            
            elif action == 'set_deadline_reminder':
                with conn.cursor() as cur:
                    cur.execute("""
                        INSERT INTO deadline_reminders 
                        (entity_type, entity_id, deadline, reminder_intervals)
                        VALUES (%s, %s, %s, %s)
                        ON CONFLICT (entity_type, entity_id) 
                        DO UPDATE SET deadline = EXCLUDED.deadline,
                                      reminder_intervals = EXCLUDED.reminder_intervals,
                                      is_active = true
                        RETURNING id
                    """, (
                        body_data['entityType'],
                        body_data['entityId'],
                        body_data['deadline'],
                        body_data.get('intervals', [86400, 3600, 0])
                    ))
                    reminder_id = cur.fetchone()['id']
                    conn.commit()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'reminderId': reminder_id
                    }),
                    'isBase64Encoded': False
                }
            
            else:
                to_email = body_data.get('to_email')
                subject = body_data.get('subject')
                message = body_data.get('message')
                notification_type = body_data.get('type', 'info')
                
                if not to_email or not subject or not message:
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Missing required fields: to_email, subject, message'}),
                        'isBase64Encoded': False
                    }
                
                result = send_email(to_email, subject, message, notification_type)
                conn.close()
                
                return {
                    'statusCode': 200 if result['success'] else 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps(result),
                    'isBase64Encoded': False
                }
        
        conn.close()
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
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


def process_scheduled_notifications(conn) -> Dict[str, Any]:
    """Обработка отложенных уведомлений"""
    with conn.cursor() as cur:
        try:
            cur.execute("""
                SELECT sn.*, e.email, e.name 
                FROM scheduled_notifications sn
                JOIN employees e ON e.id = sn.employee_id
                WHERE sn.status = 'pending' 
                AND sn.scheduled_for <= NOW()
                ORDER BY sn.scheduled_for ASC
                LIMIT 100
            """)
        except:
            return {'processed': 0, 'failed': 0, 'total': 0}
        
        notifications = cur.fetchall()
        
        processed = 0
        failed = 0
        
        for notif in notifications:
            channels = notif.get('channels', ['database'])
            success = True
            
            if 'email' in channels:
                email_result = send_email(
                    notif['email'],
                    notif['title'],
                    notif['message'],
                    notif['notification_type']
                )
                success = success and email_result['success']
            
            if success:
                cur.execute("""
                    UPDATE scheduled_notifications 
                    SET status = 'sent', sent_at = NOW()
                    WHERE id = %s
                """, (notif['id'],))
                processed += 1
            else:
                retry_count = notif['retry_count'] + 1
                if retry_count >= 3:
                    cur.execute("""
                        UPDATE scheduled_notifications 
                        SET status = 'failed', retry_count = %s, 
                            error_message = 'Max retries exceeded'
                        WHERE id = %s
                    """, (retry_count, notif['id']))
                    failed += 1
                else:
                    cur.execute("""
                        UPDATE scheduled_notifications 
                        SET retry_count = %s, 
                            scheduled_for = NOW() + INTERVAL '5 minutes'
                        WHERE id = %s
                    """, (retry_count, notif['id']))
        
        conn.commit()
        return {'processed': processed, 'failed': failed, 'total': len(notifications)}


def process_deadline_reminders(conn) -> Dict[str, Any]:
    """Обработка напоминаний о дедлайнах"""
    with conn.cursor() as cur:
        try:
            cur.execute("""
                SELECT * FROM deadline_reminders 
                WHERE is_active = true 
                AND deadline > NOW()
                ORDER BY deadline ASC
            """)
        except:
            return {'reminders_checked': 0, 'notifications_created': 0}
        
        reminders = cur.fetchall()
        
        created = 0
        now = datetime.now()
        
        for reminder in reminders:
            entity_type = reminder['entity_type']
            entity_id = reminder['entity_id']
            deadline = reminder['deadline']
            intervals = reminder['reminder_intervals'] or [86400, 3600, 0]
            
            try:
                if entity_type == 'test':
                    cur.execute("""
                        SELECT t.title, t.description, a.employee_id, e.email, e.name
                        FROM tests t
                        JOIN test_assignments a ON a.test_id = t.id
                        JOIN employees e ON e.id = a.employee_id
                        WHERE t.id = %s AND a.status = 'assigned'
                    """, (entity_id,))
                elif entity_type == 'course':
                    cur.execute("""
                        SELECT c.title, c.description, e.employee_id, emp.email, emp.name
                        FROM courses c
                        JOIN course_enrollments e ON e.course_id = c.id
                        JOIN employees emp ON emp.id = e.employee_id
                        WHERE c.id = %s AND e.status IN ('enrolled', 'in_progress')
                    """, (entity_id,))
                elif entity_type == 'task':
                    cur.execute("""
                        SELECT title, description, assigned_to as employee_id, 
                               e.email, e.name
                        FROM tasks t
                        JOIN employees e ON e.id = t.assigned_to
                        WHERE t.id = %s AND status != 'completed'
                    """, (entity_id,))
                else:
                    continue
            except:
                continue
            
            assignments = cur.fetchall()
            
            for interval in intervals:
                reminder_time = deadline - timedelta(seconds=interval)
                
                if reminder_time <= now:
                    continue
                
                for assignment in assignments:
                    if interval == 0:
                        title = f"⏰ Дедлайн наступил: {assignment['title']}"
                        message = f"Срок выполнения истёк прямо сейчас!"
                    elif interval < 3600:
                        minutes = interval // 60
                        title = f"⏰ Дедлайн через {minutes} мин: {assignment['title']}"
                        message = f"Осталось {minutes} минут до завершения!"
                    elif interval < 86400:
                        hours = interval // 3600
                        title = f"⏰ Дедлайн через {hours} ч: {assignment['title']}"
                        message = f"Осталось {hours} {'час' if hours == 1 else 'часа' if hours < 5 else 'часов'} до завершения!"
                    else:
                        days = interval // 86400
                        title = f"⏰ Дедлайн через {days} дн: {assignment['title']}"
                        message = f"Осталось {days} {'день' if days == 1 else 'дня' if days < 5 else 'дней'} до завершения!"
                    
                    try:
                        cur.execute("""
                            INSERT INTO scheduled_notifications 
                            (employee_id, notification_type, title, message, 
                             related_entity_type, related_entity_id, 
                             scheduled_for, channels)
                            VALUES (%s, 'deadline', %s, %s, %s, %s, %s, 
                                    ARRAY['database', 'push', 'email'])
                        """, (
                            assignment['employee_id'],
                            title,
                            message,
                            entity_type,
                            entity_id,
                            reminder_time
                        ))
                        created += 1
                    except:
                        pass
        
        conn.commit()
        return {'reminders_checked': len(reminders), 'notifications_created': created}