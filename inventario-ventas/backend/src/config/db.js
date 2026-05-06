const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:     process.env.DB_HOST     || process.env.PGHOST     || 'localhost',
  port:     process.env.DB_PORT     || process.env.PGPORT     || 5432,
  database: process.env.DB_NAME     || process.env.PGDATABASE || 'railway',
  user:     process.env.DB_USER     || process.env.PGUSER     || 'postgres',
  password: process.env.DB_PASSWORD || process.env.PGPASSWORD || '',
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => console.log('✅ Conectado a PostgreSQL'));
pool.on('error',   (err) => { console.error('❌ Error PostgreSQL:', err.message); process.exit(-1); });

module.exports = pool;
