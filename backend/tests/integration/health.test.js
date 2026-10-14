const request = require('supertest');
const app = require('../../src/app');
require('../setup');

describe('Base Health & Error Handling Sanity Tests', () => {
  it('should return 200 OK on GET /health with requestId and uptime', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/healthy/i);
    expect(res.body.requestId).toBeDefined();
    expect(res.headers['x-request-id']).toBeDefined();
  });

  it('should return 200 OK on GET /api/v1/health', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.requestId).toBeDefined();
  });

  it('should return 404 for non-existent routes with consistent error JSON', async () => {
    const res = await request(app).get('/api/v1/undefined-endpoint');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.status).toBe('fail');
    expect(res.body.message).toMatch(/not found/i);
    expect(res.body.requestId).toBeDefined();
  });
});
