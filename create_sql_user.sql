-- ========================================
-- СОЗДАНИЕ ПОЛЬЗОВАТЕЛЯ ДЛЯ ОБЛАЧНЫХ ФУНКЦИЙ
-- ========================================

-- 1. Переключиться на master базу
USE master;
GO

-- 2. Создать логин с SQL Server аутентификацией
CREATE LOGIN cloud_user WITH PASSWORD = 'YourStrongPassword123!';
GO

-- 3. Дать права на базу master
USE master;
GO
CREATE USER cloud_user FOR LOGIN cloud_user;
GO
ALTER ROLE db_datareader ADD MEMBER cloud_user;
ALTER ROLE db_datawriter ADD MEMBER cloud_user;
GO

-- 4. Если нужны права на другие базы (например model, msdb, tempdb)
-- Раскомментируйте нужные блоки:

/*
USE model;
GO
CREATE USER cloud_user FOR LOGIN cloud_user;
GO
ALTER ROLE db_datareader ADD MEMBER cloud_user;
ALTER ROLE db_datawriter ADD MEMBER cloud_user;
GO

USE msdb;
GO
CREATE USER cloud_user FOR LOGIN cloud_user;
GO
ALTER ROLE db_datareader ADD MEMBER cloud_user;
ALTER ROLE db_datawriter ADD MEMBER cloud_user;
GO
*/

-- 5. Проверка созданного пользователя
SELECT 
    'Логин создан' AS [Статус],
    name AS [Имя],
    type_desc AS [Тип],
    create_date AS [Дата создания]
FROM sys.server_principals
WHERE name = 'cloud_user';
GO

PRINT '===========================================';
PRINT 'ПОЛЬЗОВАТЕЛЬ УСПЕШНО СОЗДАН!';
PRINT '===========================================';
PRINT '';
PRINT 'Логин: cloud_user';
PRINT 'Пароль: YourStrongPassword123!';
PRINT '';
PRINT 'СТРОКА ПОДКЛЮЧЕНИЯ:';
PRINT 'Server=DESKTOP-F77CN24\SQLEXPRESS,1433;Database=master;User Id=cloud_user;Password=YourStrongPassword123!;Encrypt=false;TrustServerCertificate=true;';
PRINT '';
PRINT 'ВНИМАНИЕ:';
PRINT '1. Измените пароль на более сложный';
PRINT '2. Если SQL Server на локальном компьютере - используйте ngrok для доступа из интернета';
PRINT '3. Проверьте, что SQL Server Authentication включена в настройках сервера';
PRINT '===========================================';
