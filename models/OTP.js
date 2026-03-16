const database = require('./database');

class OTP {
  static async create(userId, email, otp, expiresAt) {
    const pool = database.getPool();
    
    const query = `
      INSERT INTO otps (user_id, email, otp, expires_at, is_used, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, user_id, email, otp, expires_at
    `;
    
    const values = [userId, email, otp, expiresAt, false];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const pool = database.getPool();
    
    const query = `
      SELECT id, user_id, email, otp, expires_at, is_used, created_at
      FROM otps
      WHERE user_id = $1 AND is_used = false AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  static async findByEmail(email) {
    const pool = database.getPool();
    
    const query = `
      SELECT id, user_id, email, otp, expires_at, is_used, created_at
      FROM otps
      WHERE email = $1 AND is_used = false AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  static async verify(email, otp) {
    const pool = database.getPool();
    
    const query = `
      SELECT id, user_id, email, otp, expires_at, is_used
      FROM otps
      WHERE email = $1 AND otp = $2 AND is_used = false AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    const result = await pool.query(query, [email, otp]);
    return result.rows[0] || null;
  }

  static async markAsUsed(otpId) {
    const pool = database.getPool();
    
    const query = `
      UPDATE otps
      SET is_used = true
      WHERE id = $1
      RETURNING id, is_used
    `;
    
    const result = await pool.query(query, [otpId]);
    return result.rows[0] || null;
  }

  static async markAllAsUsedForEmail(email) {
    const pool = database.getPool();
    
    const query = `
      UPDATE otps
      SET is_used = true
      WHERE email = $1 AND is_used = false
    `;
    
    await pool.query(query, [email]);
  }

  static async deleteByUserId(userId) {
    const pool = database.getPool();
    
    const query = `
      DELETE FROM otps
      WHERE user_id = $1
    `;
    
    await pool.query(query, [userId]);
  }

  static async cleanupExpired() {
    const pool = database.getPool();
    
    const query = `
      DELETE FROM otps
      WHERE expires_at < NOW() OR is_used = true
    `;
    
    const result = await pool.query(query);
    console.log(` Cleaned up ${result.rowCount} expired/used OTPs`);
    return result.rowCount;
  }
}

module.exports = OTP;
