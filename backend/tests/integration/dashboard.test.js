const request = require('supertest');
const app = require('../../src/app');
const Complaint = require('../../src/models/Complaint');
require('../setup');

describe('Dashboard Metrics & Aggregation Integration Tests', () => {
  let adminToken;
  let staffToken;
  let studentToken;
  let studentId;

  beforeEach(async () => {
    // 1. Create Admin
    const aRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Warden Admin',
      email: 'admin.dashboard@hostel.edu',
      password: 'Password123!',
      role: 'admin',
    });
    adminToken = aRes.body.data.accessToken;

    // 2. Create Staff
    const sRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Staff Electrician',
      email: 'staff.dashboard@hostel.edu',
      password: 'Password123!',
      role: 'staff',
    });
    staffToken = sRes.body.data.accessToken;

    // 3. Create Student
    const stRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Student User',
      email: 'student.dashboard@hostel.edu',
      password: 'Password123!',
      role: 'student',
      roomNumber: 'A-201',
    });
    studentToken = stRes.body.data.accessToken;
    studentId = stRes.body.data.user._id;

    // 4. Seed test complaints with known statuses and resolution times
    const now = Date.now();
    await Complaint.create([
      // Open complaint - urgent
      {
        title: 'Water pipe burst flooding corridor',
        description: 'Major leak on 1st floor corridor requiring immediate shutoff.',
        category: 'water',
        priority: 'urgent',
        status: 'Open',
        student: studentId,
        roomNumber: 'A-201',
        createdAt: new Date(now - 3 * 3600 * 1000),
      },
      // In Progress complaint - electricity
      {
        title: 'Circuit breaker tripping repeatedly',
        description: 'Power cuts off every time AC turns on.',
        category: 'electricity',
        priority: 'high',
        status: 'In Progress',
        student: studentId,
        roomNumber: 'A-201',
        createdAt: new Date(now - 10 * 3600 * 1000),
      },
      // Resolved complaint - 4 hours to resolve
      {
        title: 'Wi-Fi router power cord cut',
        description: 'Cord damaged by chair leg.',
        category: 'wifi',
        priority: 'medium',
        status: 'Resolved',
        student: studentId,
        roomNumber: 'A-201',
        createdAt: new Date(now - 8 * 3600 * 1000),
        resolvedAt: new Date(now - 4 * 3600 * 1000), // Exactly 4.0 hours duration
      },
      // Closed complaint - 6 hours to resolve
      {
        title: 'Study chair leg broken',
        description: 'Wooden leg cracked.',
        category: 'furniture',
        priority: 'low',
        status: 'Closed',
        student: studentId,
        roomNumber: 'A-201',
        createdAt: new Date(now - 12 * 3600 * 1000),
        resolvedAt: new Date(now - 6 * 3600 * 1000), // Exactly 6.0 hours duration
        closedAt: new Date(now - 5 * 3600 * 1000),
      },
    ]);
  });

  describe('RBAC Guards on /api/v1/dashboard/summary', () => {
    it('should block student from accessing dashboard summary with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/summary')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/forbidden/i);
    });

    it('should reject unauthenticated request with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/dashboard/summary');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should allow staff members to view dashboard summary', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/summary')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Aggregation Pipeline Metric Accuracy', () => {
    it('should correctly calculate total complaints, dimensional counts, and average resolution time', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const { data } = res.body;

      // 1. Total Complaints count
      expect(data.totalComplaints).toBe(4);

      // 2. Status Breakdown Map
      expect(data.statusBreakdown.Open).toBe(1);
      expect(data.statusBreakdown['In Progress']).toBe(1);
      expect(data.statusBreakdown.Resolved).toBe(1);
      expect(data.statusBreakdown.Closed).toBe(1);

      // 3. Priority Breakdown Map
      expect(data.priorityBreakdown.urgent).toBe(1);
      expect(data.priorityBreakdown.high).toBe(1);
      expect(data.priorityBreakdown.medium).toBe(1);
      expect(data.priorityBreakdown.low).toBe(1);

      // 4. Unresolved Urgent / High Count (Open or In Progress with urgent/high)
      expect(data.unresolvedUrgentCount).toBe(2);

      // 5. Category Breakdown with Percentage Share
      expect(data.categoryBreakdown.length).toBe(4);
      data.categoryBreakdown.forEach((cat) => {
        expect(cat.count).toBe(1);
        expect(cat.percentage).toBe(25); // 1 out of 4 = 25%
      });

      // 6. Average Resolution Time: (4 hours + 6 hours) / 2 = 5.0 hours
      expect(data.totalResolvedCount).toBe(2);
      expect(data.averageResolutionTimeHours).toBe(5);
    });
  });
});
