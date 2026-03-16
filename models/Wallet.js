const database = require('./database');

class Wallet {
  static async create(userId) {
    const pool = database.getPool();
    
    const query = `
      INSERT INTO wallets (user_id, balance, created_at)
      VALUES ($1, $2, NOW())
      RETURNING id, user_id, balance, created_at
    `;
    
    const values = [userId, 0.00];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const pool = database.getPool();
    
    const query = `
      SELECT id, user_id, balance, created_at
      FROM wallets
      WHERE user_id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  static async findById(id) {
    const pool = database.getPool();
    
    const query = `
      SELECT id, user_id, balance, created_at
      FROM wallets
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async updateBalance(userId, amount) {
    const pool = database.getPool();
    
    const query = `
      UPDATE wallets
      SET balance = balance + $1
      WHERE user_id = $2
      RETURNING id, user_id, balance
    `;
    
    const result = await pool.query(query, [amount, userId]);
    return result.rows[0] || null;
  }
}

module.exports = Wallet;
