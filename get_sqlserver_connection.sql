-- ========================================
-- СКРИПТ ДЛЯ ПОЛУЧЕНИЯ ПАРАМЕТРОВ ПОДКЛЮЧЕНИЯ К SQL SERVER
-- ========================================

-- 1. Узнать имя сервера и экземпляра
SELECT 
    'Имя сервера' AS [Параметр],
    @@SERVERNAME AS [Значение]
UNION ALL
SELECT 
    'Версия SQL Server',
    @@VERSION
UNION ALL
SELECT 
    'Текущая база данных',
    DB_NAME();

GO

-- 2. Узнать порт SQL Server (обычно 1433)
EXEC xp_readerrorlog 0, 1, N'Server is listening on', N'any', NULL, NULL, 'DESC';

GO

-- 3. Список всех баз данных
SELECT 
    name AS [Название базы данных],
    database_id AS [ID],
    create_date AS [Дата создания]
FROM sys.databases
ORDER BY name;

GO

-- 4. Текущий пользователь и его права
SELECT 
    'Текущий пользователь' AS [Параметр],
    SUSER_SNAME() AS [Значение]
UNION ALL
SELECT 
    'Имя входа',
    ORIGINAL_LOGIN();

GO

-- 5. Проверить, включен ли TCP/IP протокол
-- (Нужно выполнить в SQL Server Configuration Manager)
-- Или использовать этот запрос для проверки доступных протоколов:

SELECT 
    net_transport AS [Протокол],
    local_tcp_port AS [Порт],
    local_net_address AS [IP адрес]
FROM sys.dm_exec_connections
WHERE session_id = @@SPID;

GO

-- ========================================
-- ИТОГОВАЯ СТРОКА ПОДКЛЮЧЕНИЯ БУДЕТ ТАКОЙ:
-- ========================================
-- Server=ВАШ_SERVERNAME,ПОРТ;Database=НАЗВАНИЕ_БД;User Id=ВАШ_ЛОГИН;Password=ВАШ_ПАРОЛЬ;Encrypt=false;TrustServerCertificate=true;
--
-- ПРИМЕР:
-- Server=localhost,1433;Database=t_p47619579_knowledge_management;User Id=sa;Password=YourPassword123!;Encrypt=false;TrustServerCertificate=true;
--
-- Если SQL Server на другом компьютере - замените localhost на IP адрес
-- Если используете ngrok - укажите адрес из ngrok (например: 0.tcp.ngrok.io,12345)
-- ========================================

PRINT '===========================================';
PRINT 'ИНСТРУКЦИЯ ПО СОЗДАНИЮ СТРОКИ ПОДКЛЮЧЕНИЯ:';
PRINT '===========================================';
PRINT '';
PRINT '1. Возьмите имя сервера из первого запроса (@@SERVERNAME)';
PRINT '2. Порт обычно 1433 (если не изменён)';
PRINT '3. Укажите название базы данных (t_p47619579_knowledge_management)';
PRINT '4. Используйте свой логин и пароль SQL Server';
PRINT '';
PRINT 'Пример строки подключения:';
PRINT 'Server=МОЙ_СЕРВЕР,1433;Database=t_p47619579_knowledge_management;User Id=sa;Password=МОЙ_ПАРОЛЬ;Encrypt=false;TrustServerCertificate=true;';
PRINT '';
PRINT '===========================================';
