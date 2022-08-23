const { Pool } = require('pg');
const { db } = require('./config')

// Se toma Pool para realizar la conexion con postgreSQL
const pool = new Pool({
    connectionString: db.url,
    ssl: {
        rejectUnauthorized: false
    }
})

module.exports = pool;