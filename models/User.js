const bcrypt = require('bcrypt');
const database = require('./database');

class User {
  static async create(userData) {
    const { email, phone, password_hash } = userData;
    const pool = database.getPool();
    
    const query = `
      INSERT INTO users (email, phone, password_hash, is_verified, failed_login_attempts, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, email, phone, is_verified, created_at
    `;
    
    const values = [email, phone, password_hash, false, 0];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const pool = database.getPool();
    
    const query = `
      SELECT id, email, phone, password_hash, is_verified, failed_login_attempts, created_at
      FROM users
      WHERE email = $1
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  static async findById(id) {
    const pool = database.getPool();
    
    const query = `
      SELECT id, email, phone, is_verified, failed_login_attempts, created_at
      FROM users
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async updateFailedAttempts(email, attempts) {
    const pool = database.getPool();
    
    const query = `
      UPDATE users
      SET failed_login_attempts = $1
      WHERE email = $2
      RETURNING failed_login_attempts
    `;
    
    const result = await pool.query(query, [attempts, email]);
    return result.rows[0].failed_login_attempts;
  }

  static async resetFailedAttempts(email) {
    const pool = database.getPool();
    
    const query = `
      UPDATE users
      SET failed_login_attempts = 0
      WHERE email = $1
    `;
    
    await pool.query(query, [email]);
  }

  static async verifyEmail(email) {
    const pool = database.getPool();
    
    const query = `
      UPDATE users
      SET is_verified = true
      WHERE email = $1
      RETURNING id, email, is_verified
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  static async updatePassword(email, password_hash) {
    const pool = database.getPool();
    
    const query = `
      UPDATE users
      SET password_hash = $1, failed_login_attempts = 0
      WHERE email = $2
      RETURNING id, email, is_verified
    `;
    
    const result = await pool.query(query, [password_hash, email]);
    return result.rows[0] || null;
  }

  static async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  static async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }
}

module.exports = User;
