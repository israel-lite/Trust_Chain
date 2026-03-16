const { Pool } = require('pg');
require('dotenv').config();

class Database {
  constructor() {
    this.pool = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.pool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        max: 20, // Maximum number of connections
        idleTimeoutMillis: 30000, // Close idle connections after 30s
        connectionTimeoutMillis: 2000, // Return error after 2s
      });

      // Test the connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      this.isConnected = true;
      console.log('✅ Database connected successfully');
      return true;
    } catch (error) {
      this.isConnected = false;
      console.error('❌ Database connection failed:', error.message);
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  async disconnect() {
    try {
      if (this.pool) {
        await this.pool.end();
        this.isConnected = false;
        console.log('✅ Database disconnected successfully');
      }
    } catch (error) {
      console.error('❌ Error disconnecting from database:', error);
    }
  }

  async testConnection() {
    try {
      if (!this.pool) {
        return false;
      }
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      return true;
    } catch (error) {
      this.isConnected = false;
      return false;
    }
  }

  getPool() {
    if (!this.isConnected) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.pool;
  }

  async query(text, params) {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.log(`📊 Query executed in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`❌ Query failed after ${duration}ms:`, error.message);
      throw error;
    }
  }
}

// Create singleton instance
const database = new Database();

module.exports = database;
