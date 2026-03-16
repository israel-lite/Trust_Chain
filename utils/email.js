const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isInitialized = false;
  }

  async initializeTransporter() {
    try {
      if (this.isInitialized) {
        return this.transporter;
      }

      this.transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      this.isInitialized = true;
      console.log('✅ Email service initialized');
      return this.transporter;
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
      throw new Error('Email service initialization failed');
    }
  }

  async sendOTP(email, otp, purpose = 'verification') {
    try {
      const transporter = await this.initializeTransporter();
      
      const subject = purpose === 'reset' 
        ? 'TrustChain - Password Reset OTP'
        : 'TrustChain - Email Verification OTP';

      const html = this.generateOTPTemplate(otp, purpose);

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: subject,
        html: html,
      };

      const result = await transporter.sendMail(mailOptions);
      console.log(`📧 OTP sent to ${email}:`, result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send OTP:', error);
      throw new Error('Failed to send OTP email');
    }
  }

  generateOTPTemplate(otp, purpose) {
    const purposeText = purpose === 'reset' ? 'Password Reset' : 'Email Verification';
    const purposeDesc = purpose === 'reset' 
      ? 'to reset your password'
      : 'to verify your email address';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TrustChain - ${purposeText}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp { background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .security { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🔗 TrustChain</div>
            <div>${purposeText}</div>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>You requested ${purposeDesc} for your TrustChain account. Use the OTP code below:</p>
            
            <div class="otp">
              <div class="otp-code">${otp}</div>
            </div>
            
            <div class="security">
              <strong>🔒 Security Notice:</strong>
              <ul>
                <li>This OTP will expire in 5 minutes</li>
                <li>Never share this code with anyone</li>
                <li>TrustChain will never ask for your password</li>
              </ul>
            </div>
            
            <p>If you didn't request this, please ignore this email.</p>
            
            <div class="footer">
              <p>Best regards,<br>The TrustChain Team</p>
              <p>📧 noreply@trustchain.com | 🌐 www.trustchain.com</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async testConnection() {
    try {
      const transporter = await this.initializeTransporter();
      await transporter.verify();
      console.log('✅ Email service connection verified');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
