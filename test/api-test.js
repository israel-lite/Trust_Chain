/**
 * API Testing Script for TrustChain V1
 * This script tests all endpoints without requiring a database
 */

const express = require('express');
const request = require('supertest');

// Mock the database connection
jest.mock('../models/database', () => ({
  query: jest.fn()
}));

// Mock environment variables
process.env.JWT_SECRET = 'test_jwt_secret_key';
process.env.NODE_ENV = 'test';

const app = require('../server');

describe('TrustChain API Tests', () => {
  
  test('GET /api/health - Health check', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('TrustChain API running');
  });

  test('GET / - Root endpoint', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Welcome to TrustChain API');
  });

  test('POST /api/auth/register - Missing fields', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({})
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Email, phone, and password are required');
  });

  test('POST /api/auth/register - Invalid email', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'invalid-email',
        phone: '+1234567890',
        password: 'password123'
      })
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid email format');
  });

  test('POST /api/auth/register - Invalid phone', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        phone: '123',
        password: 'password123'
      })
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid phone number format');
  });

  test('POST /api/auth/register - Short password', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        phone: '+1234567890',
        password: '123'
      })
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Password must be at least 8 characters long');
  });

  test('POST /api/auth/login - Missing fields', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({})
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Email and password are required');
  });

  test('POST /api/auth/verify-otp - Missing fields', async () => {
    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({})
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Email and OTP are required');
  });

  test('GET /api/user/me - No token', async () => {
    const response = await request(app)
      .get('/api/user/me')
      .expect(401);
    
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Access token required');
  });

  test('GET /api/wallet - No token', async () => {
    const response = await request(app)
      .get('/api/wallet')
      .expect(401);
    
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Access token required');
  });

  test('404 - Non-existent endpoint', async () => {
    const response = await request(app)
      .get('/api/nonexistent')
      .expect(404);
    
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Endpoint not found');
  });
});

console.log('🧪 API Tests Created Successfully!');
console.log('💡 To run tests: npm test (requires jest setup)');
