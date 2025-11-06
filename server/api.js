/**
 * API Server для работы с базой данных TimeWeb Cloud PostgreSQL
 * Запускается на порту 3001, проксируется через nginx
 */

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Настройка CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept']
}));

app.use(express.json());

// Подключение к базе данных TimeWeb
const pool = new Pool({
  connectionString: 'postgresql://gen_user:Nikita230282@d83d798a97838911384dbba2.twc1.net:5432/default_db',
  ssl: {
    rejectUnauthorized: false
  }
});

// Проверка подключения
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Connected to TimeWeb PostgreSQL database');
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET /api?action=list&table=TABLE_NAME
app.get('/', async (req, res) => {
  const { action, table, schema = 'public', limit = 100, offset = 0 } = req.query;

  try {
    if (action === 'list') {
      if (!table) {
        return res.status(400).json({ error: 'Table name required' });
      }

      const dataQuery = `SELECT * FROM ${schema}.${table} LIMIT $1 OFFSET $2`;
      const countQuery = `SELECT COUNT(*) as count FROM ${schema}.${table}`;

      const [dataResult, countResult] = await Promise.all([
        pool.query(dataQuery, [limit, offset]),
        pool.query(countQuery)
      ]);

      res.json({
        rows: dataResult.rows,
        count: parseInt(countResult.rows[0].count)
      });
    } else if (action === 'stats') {
      const statsQuery = `
        SELECT 
          table_name,
          (SELECT COUNT(*) FROM information_schema.columns 
           WHERE table_schema = $1 AND table_name = t.table_name) as column_count
        FROM information_schema.tables t
        WHERE table_schema = $1
        ORDER BY table_name
      `;

      const result = await pool.query(statsQuery, [schema]);
      const tables = result.rows;

      let totalRecords = 0;
      for (const table of tables) {
        const countResult = await pool.query(
          `SELECT COUNT(*) as count FROM ${schema}.${table.table_name}`
        );
        table.record_count = parseInt(countResult.rows[0].count);
        totalRecords += table.record_count;
      }

      res.json({
        tables,
        totalTables: tables.length,
        totalRecords
      });
    } else {
      res.status(400).json({ error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api (для query запросов)
app.post('/', async (req, res) => {
  const { action, query, table, schema = 'public', limit = 100, offset = 0 } = req.body;

  try {
    if (action === 'query') {
      if (!query) {
        return res.status(400).json({ error: 'Query required' });
      }

      const result = await pool.query(query);

      if (query.trim().toUpperCase().startsWith('SELECT')) {
        res.json({ rows: result.rows });
      } else {
        res.json({ affected: result.rowCount });
      }
    } else if (action === 'list') {
      if (!table) {
        return res.status(400).json({ error: 'Table name required' });
      }

      const dataQuery = `SELECT * FROM ${schema}.${table} LIMIT $1 OFFSET $2`;
      const countQuery = `SELECT COUNT(*) as count FROM ${schema}.${table}`;

      const [dataResult, countResult] = await Promise.all([
        pool.query(dataQuery, [limit, offset]),
        pool.query(countQuery)
      ]);

      res.json({
        rows: dataResult.rows,
        count: parseInt(countResult.rows[0].count)
      });
    } else if (action === 'stats') {
      const statsQuery = `
        SELECT 
          table_name,
          (SELECT COUNT(*) FROM information_schema.columns 
           WHERE table_schema = $1 AND table_name = t.table_name) as column_count
        FROM information_schema.tables t
        WHERE table_schema = $1
        ORDER BY table_name
      `;

      const result = await pool.query(statsQuery, [schema]);
      const tables = result.rows;

      let totalRecords = 0;
      for (const table of tables) {
        const countResult = await pool.query(
          `SELECT COUNT(*) as count FROM ${schema}.${table.table_name}`
        );
        table.record_count = parseInt(countResult.rows[0].count);
        totalRecords += table.record_count;
      }

      res.json({
        tables,
        totalTables: tables.length,
        totalRecords
      });
    } else {
      res.status(400).json({ error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  pool.end();
  process.exit(0);
});
