const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Complaint = require('../../src/models/Complaint');
require('../setup');

describe('Complaints & Audit Trail Integration Tests', () => {
  let studentTokenA;
  let studentTokenB;
  let adminToken;
  let staffId;
  let staffToken;

  beforeEach(async () => {
    // 1. Create Student A
    const resA = await request(app).post('/api/v1/auth/register').send({
      name: 'Student Alpha',
      email: 'alpha@hostel.edu',
      password: 'Password123!',
      role: 'student',
      roomNumber: 'A-101',
    });
    studentTokenA = resA.body.data.accessToken;

    // 2. Create Student B
    const resB = await request(app).post('/api/v1/auth/register').send({
      name: 'Student Beta',
      email: 'beta@hostel.edu',
      password: 'Password123!',
      role: 'student',
      roomNumber: 'B-202',
    });
    studentTokenB = resB.body.data.accessToken;

    // 3. Create Admin
    const resAdmin = await request(app).post('/api/v1/auth/register').send({
      name: 'Warden Admin',
      email: 'warden@hostel.edu',
      password: 'AdminPassword123!',
      role: 'admin',
    });
    adminToken = resAdmin.body.data.accessToken;

    // 4. Create Staff
    const resStaff = await request(app).post('/api/v1/auth/register').send({
      name: 'Plumber John',
      email: 'john@hostel.edu',
      password: 'StaffPassword123!',
      role: 'staff',
    });
    staffId = resStaff.body.data.user._id;
    staffToken = resStaff.body.data.accessToken;
  });

  describe('POST /api/v1/complaints (Create Complaint)', () => {
    it('should create a complaint with Open status and initial audit trail', async () => {
      const res = await request(app)
        .post('/api/v1/complaints')
        .set('Authorization', `Bearer ${studentTokenA}`)
        .send({
          title: 'Bathroom tap leaking severely',
          description: 'Water is dripping constantly and flooding the bathroom floor.',
          category: 'water',
          priority: 'high',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Bathroom tap leaking severely');
      expect(res.body.data.category).toBe('water');
      expect(res.body.data.priority).toBe('high');
      expect(res.body.data.status).toBe('Open');
      expect(res.body.data.roomNumber).toBe('A-101'); // Auto-populated from student profile

      // Verify audit history trail
      expect(res.body.data.statusHistory.length).toBe(1);
      expect(res.body.data.statusHistory[0].status).toBe('Open');
      expect(res.body.data.statusHistory[0].note).toMatch(/registered/i);
    });

    it('should fail with 400 when title or description is too short', async () => {
      const res = await request(app)
        .post('/api/v1/complaints')
        .set('Authorization', `Bearer ${studentTokenA}`)
        .send({
          title: 'Leak',
          description: 'Bad',
          category: 'water',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.length).toBeGreaterThanOrEqual(2);
    });

    it('should fail with 400 when category is invalid', async () => {
      const res = await request(app)
        .post('/api/v1/complaints')
        .set('Authorization', `Bearer ${studentTokenA}`)
        .send({
          title: 'AC temperature issue',
          description: 'The air conditioner is not cooling properly.',
          category: 'invalid_category',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].message).toMatch(/invalid category/i);
    });
  });

  describe('GET /api/v1/complaints (List, Filters & Pagination)', () => {
    beforeEach(async () => {
      // Create 3 complaints under Student A
      await request(app)
        .post('/api/v1/complaints')
        .set('Authorization', `Bearer ${studentTokenA}`)
        .send({
          title: 'Wi-Fi disconnects frequently',
          description: 'Signal keeps dropping in room A-101 every 10 minutes.',
          category: 'wifi',
          priority: 'medium',
        });

      await request(app)
        .post('/api/v1/complaints')
        .set('Authorization', `Bearer ${studentTokenA}`)
        .send({
          title: 'Ceiling fan making squeaking noise',
          description: 'Speed regulator works but fan squeaks loudly when turned on.',
          category: 'electricity',
          priority: 'low',
        });

      // Create 1 complaint under Student B
      await request(app)
        .post('/api/v1/complaints')
        .set('Authorization', `Bearer ${studentTokenB}`)
        .send({
          title: 'Door lock jammed from outside',
          description: 'The key gets stuck in the lock cylinder of room B-202.',
          category: 'furniture',
          priority: 'urgent',
        });
    });

    it('should scope listing to student own complaints only (Student A sees 2, not 3)', async () => {
      const res = await request(app)
        .get('/api/v1/complaints')
        .set('Authorization', `Bearer ${studentTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination.total).toBe(2);
    });

    it('should allow Admin to view all complaints across students with pagination', async () => {
      const res = await request(app)
        .get('/api/v1/complaints?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination.total).toBe(3);
      expect(res.body.pagination.totalPages).toBe(2);
    });

    it('should filter complaints by category and priority', async () => {
      const res = await request(app)
        .get('/api/v1/complaints?category=wifi&priority=medium')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].category).toBe('wifi');
      expect(res.body.data[0].priority).toBe('medium');
    });
  });

  describe('User Isolation Guard (Cross-Student Access)', () => {
    let complaintAId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/complaints')
        .set('Authorization', `Bearer ${studentTokenA}`)
        .send({
          title: 'Window glass cracked in storm',
          description: 'High winds broke the corner glass pane of the window.',
          category: 'furniture',
          priority: 'medium',
        });
      complaintAId = res.body.data._id;
    });

    it('should block Student B from accessing Student A complaint with 403 Forbidden', async () => {
      const res = await request(app)
        .get(`/api/v1/complaints/${complaintAId}`)
        .set('Authorization', `Bearer ${studentTokenB}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/permission/i);
    });

    it('should allow Admin to view any student complaint', async () => {
      const res = await request(app)
        .get(`/api/v1/complaints/${complaintAId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.title).toMatch(/window glass cracked/i);
    });

    it('should return 400 for malformed MongoDB ObjectId', async () => {
      const res = await request(app)
        .get('/api/v1/complaints/123-not-an-id')
        .set('Authorization', `Bearer ${studentTokenA}`);

      expect(res.status).toBe(400);
      expect(res.body.errors[0].message).toMatch(/invalid complaint id/i);
    });
  });

  describe('PATCH /api/v1/complaints/:id/status (Lifecycle & Audit Trail)', () => {
    let complaintId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/complaints')
        .set('Authorization', `Bearer ${studentTokenA}`)
        .send({
          title: 'Power socket sparked when plugged',
          description: 'Study table socket sparked and tripped the circuit breaker.',
          category: 'electricity',
          priority: 'urgent',
        });
      complaintId = res.body.data._id;
    });

    it('should allow staff to update status to In Progress and append audit history', async () => {
      const res = await request(app)
        .patch(`/api/v1/complaints/${complaintId}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          status: 'In Progress',
          note: 'Inspecting circuit wiring in room A-101',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('In Progress');

      // Audit trail check
      expect(res.body.data.statusHistory.length).toBe(2);
      expect(res.body.data.statusHistory[1].status).toBe('In Progress');
      expect(res.body.data.statusHistory[1].note).toMatch(/inspecting circuit wiring/i);
    });

    it('should record resolvedAt timestamp when transitioned to Resolved', async () => {
      const res = await request(app)
        .patch(`/api/v1/complaints/${complaintId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'Resolved',
          note: 'Replaced faulty socket and tested breaker',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Resolved');
      expect(res.body.data.resolvedAt).toBeDefined();
    });

    it('should allow student to reopen a Resolved complaint if issue is not fixed', async () => {
      // First resolve by admin
      await request(app)
        .patch(`/api/v1/complaints/${complaintId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Resolved' });

      // Student reopens complaint
      const reopenRes = await request(app)
        .patch(`/api/v1/complaints/${complaintId}/status`)
        .set('Authorization', `Bearer ${studentTokenA}`)
        .send({
          status: 'In Progress',
          note: 'Socket is still sparking when plugging laptop charger',
        });

      expect(reopenRes.status).toBe(200);
      expect(reopenRes.body.data.status).toBe('In Progress');
      expect(reopenRes.body.data.reopenedCount).toBe(1);
      expect(reopenRes.body.data.resolvedAt).toBeNull();
    });

    it('should reject student attempt to directly close an Open complaint', async () => {
      const res = await request(app)
        .patch(`/api/v1/complaints/${complaintId}/status`)
        .set('Authorization', `Bearer ${studentTokenA}`)
        .send({ status: 'Closed' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/students can only reopen/i);
    });
  });

  describe('PATCH /api/v1/complaints/:id/assign (Staff Assignment)', () => {
    let complaintId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/complaints')
        .set('Authorization', `Bearer ${studentTokenA}`)
        .send({
          title: 'Washbasin pipe clogged with sand',
          description: 'Water does not drain from the washbasin at all.',
          category: 'water',
          priority: 'medium',
        });
      complaintId = res.body.data._id;
    });

    it('should allow admin to assign staff member to a complaint', async () => {
      const res = await request(app)
        .patch(`/api/v1/complaints/${complaintId}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ staffId });

      expect(res.status).toBe(200);
      expect(res.body.data.assignedTo.toString()).toBe(staffId.toString());
      expect(res.body.data.status).toBe('In Progress'); // Automatically moves to In Progress
      expect(res.body.data.statusHistory.length).toBe(2);
      expect(res.body.data.statusHistory[1].note).toMatch(/assigned/i);
    });

    it('should block non-admin student from assigning staff with 403 Forbidden', async () => {
      const res = await request(app)
        .patch(`/api/v1/complaints/${complaintId}/assign`)
        .set('Authorization', `Bearer ${studentTokenA}`)
        .send({ staffId });

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/v1/complaints/:id/comments & Internal Notes Filtering', () => {
    let complaintId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/complaints')
        .set('Authorization', `Bearer ${studentTokenA}`)
        .send({
          title: 'Curtain rod fell off wall',
          description: 'Screws came loose from plaster wall.',
          category: 'furniture',
          priority: 'low',
        });
      complaintId = res.body.data._id;
    });

    it('should allow student to add a public comment', async () => {
      const res = await request(app)
        .post(`/api/v1/complaints/${complaintId}/comments`)
        .set('Authorization', `Bearer ${studentTokenA}`)
        .send({ text: 'Please send carpenter after 4 PM when I am back from class.' });

      expect(res.status).toBe(200);
      expect(res.body.data.comments.length).toBe(1);
      expect(res.body.data.comments[0].text).toMatch(/after 4 PM/i);
      expect(res.body.data.comments[0].isInternal).toBe(false);
    });

    it('should allow admin to add internal note and hide it from student view', async () => {
      // 1. Admin adds internal note
      await request(app)
        .post(`/api/v1/complaints/${complaintId}/comments`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          text: 'Internal Note: Waiting for wall anchor stock delivery from warehouse',
          isInternal: true,
        });

      // 2. Student views complaint -> Internal note MUST be filtered out
      const studentView = await request(app)
        .get(`/api/v1/complaints/${complaintId}`)
        .set('Authorization', `Bearer ${studentTokenA}`);

      expect(studentView.status).toBe(200);
      expect(studentView.body.data.comments.length).toBe(0); // Internal note hidden

      // 3. Admin views complaint -> Internal note MUST be visible
      const adminView = await request(app)
        .get(`/api/v1/complaints/${complaintId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(adminView.status).toBe(200);
      expect(adminView.body.data.comments.length).toBe(1);
      expect(adminView.body.data.comments[0].isInternal).toBe(true);
    });
  });
});
