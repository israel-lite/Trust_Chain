const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TrustChain API',
      version: '1.0.0',
      description: 'Fintech escrow platform API documentation',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT authentication token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            phone: {
              type: 'string',
              description: 'User phone number',
            },
            isVerified: {
              type: 'boolean',
              description: 'Whether user email is verified',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp',
            },
          },
        },
        Wallet: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Wallet ID',
            },
            userId: {
              type: 'integer',
              description: 'User ID',
            },
            balance: {
              type: 'number',
              format: 'decimal',
              description: 'Wallet balance',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Wallet creation timestamp',
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'phone', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'user@example.com',
            },
            phone: {
              type: 'string',
              description: 'User phone number (10+ digits)',
              example: '+1234567890',
            },
            password: {
              type: 'string',
              minLength: 8,
              description: 'User password (minimum 8 characters)',
              example: 'password123',
            },
          },
        },
        OTPRequest: {
          type: 'object',
          required: ['email', 'otp'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'user@example.com',
            },
            otp: {
              type: 'string',
              pattern: '^[0-9]{6}$',
              description: '6-digit OTP code',
              example: '123456',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'user@example.com',
            },
            password: {
              type: 'string',
              description: 'User password',
              example: 'password123',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Request success status',
            },
            message: {
              type: 'string',
              description: 'Response message',
            },
            data: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                  description: 'JWT authentication token',
                },
                user: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          },
        },
        RegisterResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Request success status',
            },
            message: {
              type: 'string',
              description: 'Response message',
            },
            data: {
              type: 'object',
              properties: {
                userId: {
                  type: 'integer',
                  description: 'User ID',
                },
                email: {
                  type: 'string',
                  description: 'User email',
                },
                isVerified: {
                  type: 'boolean',
                  description: 'Verification status',
                },
                otp: {
                  type: 'string',
                  description: 'OTP code (development only)',
                },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
              description: 'Request success status',
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
        ForgotPasswordRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'user@example.com',
            },
          },
        },
        ResetPasswordRequest: {
          type: 'object',
          required: ['email', 'otp', 'newPassword'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'user@example.com',
            },
            otp: {
              type: 'string',
              pattern: '^[0-9]{6}$',
              description: '6-digit OTP code',
              example: '123456',
            },
            newPassword: {
              type: 'string',
              minLength: 8,
              description: 'New password (minimum 8 characters)',
              example: 'newPassword123!',
            },
          },
        },
        HealthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
              description: 'Health check status',
            },
            message: {
              type: 'string',
              example: 'TrustChain API running',
              description: 'Health message',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Current timestamp',
            },
          },
        },
      },
    },
  },
  apis: ['./controllers/*.js', './routes/*.js', './server.js'], // Path to API docs
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};
