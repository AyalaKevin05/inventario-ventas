const { Pool } = require('pg');
const pool = new Pool({
  host: 'switchyard.proxy.rlwy.net',
  port: 12377,
  database: 'railway',
  user: 'postgres',
  password: 'GwTfotwqaRDpaoFkZuuhxdUpCpeLccdq'
});
pool.query('UPDATE usuarios SET contrasena = $1', ['$2a$10$881AX0x/H2AQvCBm8W43XeWTO.c1GWl/2HM955zS5seSwB9Xo8q3S'])
  .then(() => { console.log('ok'); process.exit(0); })
  .catch(e => { console.error(e.message); process.exit(1); });
