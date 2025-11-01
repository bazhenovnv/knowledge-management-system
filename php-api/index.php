<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Настройки подключения к PostgreSQL
$dbHost = 'localhost';
$dbPort = '5432';
$dbName = 'ваша_база';
$dbUser = 'ваш_юзер';
$dbPass = 'ваш_пароль';

try {
    $dsn = "pgsql:host=$dbHost;port=$dbPort;dbname=$dbName;sslmode=require";
    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';

try {
    switch ($action) {
        case 'query':
            $query = $input['query'] ?? '';
            $params = $input['params'] ?? [];
            
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            
            if (stripos($query, 'SELECT') === 0) {
                $rows = $stmt->fetchAll();
                echo json_encode(['rows' => $rows]);
            } else {
                echo json_encode(['affected' => $stmt->rowCount()]);
            }
            break;
            
        case 'list':
            $table = $input['table'] ?? '';
            $schema = $input['schema'] ?? 'public';
            $limit = $input['limit'] ?? 100;
            $offset = $input['offset'] ?? 0;
            
            if (empty($table)) {
                throw new Exception('Table name required');
            }
            
            $query = "SELECT * FROM $schema.$table LIMIT :limit OFFSET :offset";
            $stmt = $pdo->prepare($query);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $rows = $stmt->fetchAll();
            
            $countQuery = "SELECT COUNT(*) as count FROM $schema.$table";
            $countStmt = $pdo->query($countQuery);
            $count = $countStmt->fetch()['count'];
            
            echo json_encode(['rows' => $rows, 'count' => (int)$count]);
            break;
            
        case 'stats':
            $schema = $input['schema'] ?? 'public';
            
            $tablesQuery = "
                SELECT 
                    table_name,
                    (SELECT COUNT(*) FROM information_schema.columns 
                     WHERE table_schema = :schema1 AND table_name = t.table_name) as column_count
                FROM information_schema.tables t
                WHERE table_schema = :schema2
                ORDER BY table_name
            ";
            
            $stmt = $pdo->prepare($tablesQuery);
            $stmt->execute([':schema1' => $schema, ':schema2' => $schema]);
            $tables = $stmt->fetchAll();
            
            $totalRecords = 0;
            foreach ($tables as &$table) {
                $countQuery = "SELECT COUNT(*) as count FROM $schema.{$table['table_name']}";
                $countStmt = $pdo->query($countQuery);
                $table['record_count'] = (int)$countStmt->fetch()['count'];
                $totalRecords += $table['record_count'];
            }
            
            echo json_encode([
                'tables' => $tables,
                'totalTables' => count($tables),
                'totalRecords' => $totalRecords
            ]);
            break;
            
        default:
            throw new Exception('Unknown action: ' . $action);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
