const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
require('./setup');

describe('Auth API Endpoints', () => {
  describe('POST /api/auth/signup', () => {
    it('should register a new user and return a JWT token and user info without password', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        name: 'Kaustubh Test',
        email: 'kaustubh@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.name).toBe('Kaustubh Test');
      expect(res.body.data.user.email).toBe('kaustubh@example.com');
      expect(res.body.data.user.password).toBeUndefined();

      // Verify user is in MongoDB with hashed password
      const dbUser = await User.findOne({ email: 'kaustubh@example.com' }).select('+password');
      expect(dbUser).toBeDefined();
      expect(dbUser.password).not.toBe('Password123!');
    });

    it('should reject registration if email is already in use (duplicate email)', async () => {
      await request(app).post('/api/auth/signup').send({
        name: 'First User',
        email: 'duplicate@example.com',
        password: 'Password123!',
      });

      const res = await request(app).post('/api/auth/signup').send({
        name: 'Second User',
        email: 'duplicate@example.com',
        password: 'AnotherPassword456!',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should return 400 validation error when email is invalid or password is too short', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        name: 'A',
        email: 'invalid-email-format',
        password: '123',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/signup').send({
        name: 'Login User',
        email: 'login@example.com',
        password: 'SecretPassword123!',
      });
    });

    it('should log in successfully with correct credentials and return a token', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'SecretPassword123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('login@example.com');
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('should fail login with 401 when password is wrong', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'IncorrectPassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });

    it('should fail login with 401 when email does not exist', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'SecretPassword123!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });

    it('should return 400 when missing email or password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });
  });
});
