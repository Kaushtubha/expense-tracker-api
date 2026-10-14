const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
require('../setup');

describe('Authentication & RBAC Integration Tests', () => {
  const studentData = {
    name: 'Rahul Sharma',
    email: 'rahul@hostel.edu',
    password: 'Password123!',
    role: 'student',
    roomNumber: 'B-304',
    phone: '9876543210',
  };

  const adminData = {
    name: 'Chief Warden',
    email: 'warden@hostel.edu',
    password: 'AdminPassword123!',
    role: 'admin',
  };

  describe('POST /api/v1/auth/register', () => {
    it('should register a student successfully with roomNumber and issue dual tokens', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(studentData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.name).toBe('Rahul Sharma');
      expect(res.body.data.user.email).toBe('rahul@hostel.edu');
      expect(res.body.data.user.role).toBe('student');
      expect(res.body.data.user.roomNumber).toBe('B-304');

      // Verify passwords and tokens are never leaked
      expect(res.body.data.user.password).toBeUndefined();
      expect(res.body.data.user.refreshTokens).toBeUndefined();

      // Check DB password hashing
      const dbUser = await User.findOne({ email: 'rahul@hostel.edu' }).select('+password');
      expect(dbUser.password).not.toBe(studentData.password);
    });

    it('should register an admin successfully without requiring a room number', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(adminData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('admin');
    });

    it('should reject registration with 409 Conflict if email is already in use', async () => {
      await request(app).post('/api/v1/auth/register').send(studentData);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(studentData);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should fail with 400 when student does not provide a room number', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Incomplete Student',
          email: 'incomplete@hostel.edu',
          password: 'Password123!',
          role: 'student',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].message).toMatch(/room number is required/i);
    });

    it('should fail with 400 when password is under 6 characters or email is invalid', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Short Pass',
          email: 'invalid-email',
          password: '123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send(studentData);
    });

    it('should login successfully with valid credentials and return tokens', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: studentData.email,
        password: studentData.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.email).toBe(studentData.email);
    });

    it('should fail with 401 when password is incorrect', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: studentData.email,
        password: 'WrongPassword!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });

    it('should fail with 401 when email does not exist', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'ghost@hostel.edu',
        password: studentData.password,
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Token Refresh & Session Rotation', () => {
    let refreshToken;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(studentData);
      refreshToken = res.body.data.refreshToken;
    });

    it('should rotate refreshToken and issue a new accessToken', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.refreshToken).not.toBe(refreshToken); // Token rotated
    });

    it('should reject an already used / invalidated refresh token with 401', async () => {
      // First refresh consumes the token
      await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken });

      // Second attempt with old token must be rejected (reuse detection)
      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/me & Role-Based Access Control (RBAC)', () => {
    let studentToken;
    let adminToken;

    beforeEach(async () => {
      const sRes = await request(app).post('/api/v1/auth/register').send(studentData);
      studentToken = sRes.body.data.accessToken;

      const aRes = await request(app).post('/api/v1/auth/register').send(adminData);
      adminToken = aRes.body.data.accessToken;
    });

    it('should retrieve logged in user profile on GET /me', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(studentData.email);
      expect(res.body.data.role).toBe('student');
    });

    it('should reject unauthenticated request to /me with 401', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should block student from accessing admin-only endpoint with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/auth/admin-only')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/forbidden/i);
    });

    it('should allow admin to access admin-only endpoint with 200 OK', async () => {
      const res = await request(app)
        .get('/api/v1/auth/admin-only')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/welcome admin/i);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should successfully revoke refresh token upon logout', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/register')
        .send(studentData);

      const { accessToken, refreshToken } = loginRes.body.data;

      const logoutRes = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken });

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.success).toBe(true);

      // Attempting to refresh with the revoked token must fail with 401
      const refreshRes = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken });

      expect(refreshRes.status).toBe(401);
    });
  });
});
