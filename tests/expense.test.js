const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Expense = require('../src/models/Expense');
require('./setup');

describe('Expense API Endpoints', () => {
  let userTokenA;
  let userTokenB;
  let userIdA;

  beforeEach(async () => {
    // Create User A
    const resA = await request(app).post('/api/auth/signup').send({
      name: 'User Alpha',
      email: 'alpha@example.com',
      password: 'Password123!',
    });
    userTokenA = resA.body.data.token;
    userIdA = resA.body.data.user._id;

    // Create User B
    const resB = await request(app).post('/api/auth/signup').send({
      name: 'User Beta',
      email: 'beta@example.com',
      password: 'Password123!',
    });
    userTokenB = resB.body.data.token;
  });

  describe('Route Protection & Authentication Guards', () => {
    it('should return 401 when accessing expenses without an Authorization header', async () => {
      const res = await request(app).get('/api/expenses');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/not logged in/i);
    });

    it('should return 401 when accessing with an invalid or malformed JWT token', async () => {
      const res = await request(app)
        .get('/api/expenses')
        .set('Authorization', 'Bearer invalid.malformed.token');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid token/i);
    });
  });

  describe('POST /api/expenses (Create Expense)', () => {
    it('should create an expense tied to the authenticated user', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({
          amount: 45.5,
          category: 'Food',
          description: 'Team lunch',
          date: '2026-10-14T12:00:00.000Z',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.amount).toBe(45.5);
      expect(res.body.data.category).toBe('Food');
      expect(res.body.data.user.toString()).toBe(userIdA.toString());
    });

    it('should fail with 400 when amount is missing or negative', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({
          amount: -10,
          category: 'Shopping',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('should fail with 400 when category is missing', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({
          amount: 15.0,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('GET /api/expenses (List with Pagination & Filters)', () => {
    beforeEach(async () => {
      // Seed expenses for User A
      await Expense.create([
        {
          user: userIdA,
          amount: 20,
          category: 'Food',
          description: 'Groceries',
          date: new Date('2026-10-01'),
        },
        {
          user: userIdA,
          amount: 50,
          category: 'Transport',
          description: 'Fuel',
          date: new Date('2026-10-05'),
        },
        {
          user: userIdA,
          amount: 30,
          category: 'Food',
          description: 'Dinner',
          date: new Date('2026-10-10'),
        },
      ]);
    });

    it('should return paginated list of expenses for the user', async () => {
      const res = await request(app)
        .get('/api/expenses?page=1&limit=2')
        .set('Authorization', `Bearer ${userTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination.total).toBe(3);
      expect(res.body.pagination.totalPages).toBe(2);
    });

    it('should filter expenses by category', async () => {
      const res = await request(app)
        .get('/api/expenses?category=Food')
        .set('Authorization', `Bearer ${userTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      res.body.data.forEach((exp) => expect(exp.category).toBe('Food'));
    });

    it('should filter expenses by date range', async () => {
      const res = await request(app)
        .get('/api/expenses?startDate=2026-10-02&endDate=2026-10-08')
        .set('Authorization', `Bearer ${userTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].description).toBe('Fuel');
    });
  });

  describe('User Data Isolation (Cross-User Security)', () => {
    let expenseAId;

    beforeEach(async () => {
      const exp = await Expense.create({
        user: userIdA,
        amount: 100,
        category: 'Utilities',
        description: 'Electricity bill',
        date: new Date('2026-10-01'),
      });
      expenseAId = exp._id.toString();
    });

    it('should not allow User B to retrieve User A expense (returns 403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/expenses/${expenseAId}`)
        .set('Authorization', `Bearer ${userTokenB}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/permission/i);
    });

    it('should not allow User B to update User A expense (returns 403 Forbidden)', async () => {
      const res = await request(app)
        .put(`/api/expenses/${expenseAId}`)
        .set('Authorization', `Bearer ${userTokenB}`)
        .send({ amount: 999 });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should not allow User B to delete User A expense (returns 403 Forbidden)', async () => {
      const res = await request(app)
        .delete(`/api/expenses/${expenseAId}`)
        .set('Authorization', `Bearer ${userTokenB}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should not show User A expenses when User B lists their expenses', async () => {
      const res = await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${userTokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(0);
      expect(res.body.pagination.total).toBe(0);
    });
  });

  describe('GET /api/expenses/:id', () => {
    it('should return 400 when an invalid ObjectId format is provided', async () => {
      const res = await request(app)
        .get('/api/expenses/123-not-a-valid-id')
        .set('Authorization', `Bearer ${userTokenA}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].message).toMatch(/invalid expense id format/i);
    });

    it('should return 404 when expense does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/expenses/${fakeId}`)
        .set('Authorization', `Bearer ${userTokenA}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/expenses/:id (Update Expense)', () => {
    it('should update an existing expense for the owner', async () => {
      const exp = await Expense.create({
        user: userIdA,
        amount: 25,
        category: 'Food',
        description: 'Snacks',
      });

      const res = await request(app)
        .put(`/api/expenses/${exp._id}`)
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({
          amount: 35,
          description: 'Snacks and drinks',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.amount).toBe(35);
      expect(res.body.data.description).toBe('Snacks and drinks');
    });
  });

  describe('DELETE /api/expenses/:id (Delete Expense)', () => {
    it('should delete an expense for the owner', async () => {
      const exp = await Expense.create({
        user: userIdA,
        amount: 75,
        category: 'Health',
        description: 'Medicine',
      });

      const res = await request(app)
        .delete(`/api/expenses/${exp._id}`)
        .set('Authorization', `Bearer ${userTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify deletion from database
      const found = await Expense.findById(exp._id);
      expect(found).toBeNull();
    });
  });

  describe('GET /api/expenses/summary (MongoDB Aggregation)', () => {
    beforeEach(async () => {
      // October 2026 expenses for User A
      await Expense.create([
        {
          user: userIdA,
          amount: 120.5,
          category: 'Food',
          date: new Date('2026-10-02T10:00:00.000Z'),
        },
        {
          user: userIdA,
          amount: 80.0,
          category: 'Food',
          date: new Date('2026-10-15T10:00:00.000Z'),
        },
        {
          user: userIdA,
          amount: 50.0,
          category: 'Transport',
          date: new Date('2026-10-20T10:00:00.000Z'),
        },
        // November 2026 expense for User A (should be ignored)
        {
          user: userIdA,
          amount: 300.0,
          category: 'Rent',
          date: new Date('2026-11-01T10:00:00.000Z'),
        },
      ]);
    });

    it('should aggregate total spent per category for the specified month', async () => {
      const res = await request(app)
        .get('/api/expenses/summary?month=2026-10')
        .set('Authorization', `Bearer ${userTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.month).toBe('2026-10');
      expect(res.body.data.totalSpent).toBe(250.5); // 120.5 + 80.0 + 50.0

      const foodCategory = res.body.data.breakdown.find(
        (item) => item.category === 'Food'
      );
      expect(foodCategory).toBeDefined();
      expect(foodCategory.totalAmount).toBe(200.5);
      expect(foodCategory.count).toBe(2);

      const transportCategory = res.body.data.breakdown.find(
        (item) => item.category === 'Transport'
      );
      expect(transportCategory).toBeDefined();
      expect(transportCategory.totalAmount).toBe(50.0);
      expect(transportCategory.count).toBe(1);
    });

    it('should fail with 400 when month query parameter is missing or has invalid format', async () => {
      const res = await request(app)
        .get('/api/expenses/summary?month=invalid-date')
        .set('Authorization', `Bearer ${userTokenA}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });
  });
});
