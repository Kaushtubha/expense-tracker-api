/**
 * Autocannon Load Testing Benchmark Suite
 * Tests high-throughput endpoints with JWT authentication:
 *  1. GET /api/v1/complaints (Paginated multi-tenant list query)
 *  2. GET /api/v1/dashboard/summary (Complex MongoDB $facet aggregation + Redis cache layer)
 */

const autocannon = require('autocannon');

const BASE_URL = process.env.TARGET_URL || 'http://localhost:5001';
const DURATION = parseInt(process.env.BENCH_DURATION || '10', 10);
const CONNECTIONS = parseInt(process.env.BENCH_CONNECTIONS || '20', 10);

async function loginAdmin() {
  console.log(`[LoadTest] Authenticating against ${BASE_URL}/api/v1/auth/login ...`);
  const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'warden@hostel.edu',
      password: 'Password123!',
    }),
  });

  const body = await response.json();
  if (!response.ok || !body.data?.accessToken) {
    throw new Error(`Authentication failed (${response.status}): ${body.message || 'No access token'}`);
  }

  console.log(`[LoadTest] Logged in successfully as Admin (${body.data.user.email}). Token acquired.`);
  return body.data.accessToken;
}

function runBenchmark(title, url, headers) {
  return new Promise((resolve, reject) => {
    console.log(`\n============================================================`);
    console.log(`🚀 Benchmarking: ${title}`);
    console.log(`   URL:         ${url}`);
    console.log(`   Connections: ${CONNECTIONS} concurrent clients`);
    console.log(`   Duration:    ${DURATION} seconds`);
    console.log(`============================================================`);

    const instance = autocannon(
      {
        url,
        connections: CONNECTIONS,
        duration: DURATION,
        headers,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );

    autocannon.track(instance, { renderProgressBar: true });
  });
}

function printSummary(title, result) {
  console.log(`\n--- Benchmark Results: ${title} ---`);
  console.log(`Requests/sec (RPS): Avg ${result.requests.average.toFixed(2)} | Max ${result.requests.max}`);
  console.log(`Throughput:         ${(result.throughput.average / 1024 / 1024).toFixed(2)} MB/s`);
  console.log(`Latency (p50):      ${result.latency.p50} ms`);
  console.log(`Latency (p97.5):    ${result.latency['p97_5'] || result.latency.p97_5} ms`);
  console.log(`Latency (p99):      ${result.latency.p99} ms`);
  console.log(`Latency (Max):      ${result.latency.max} ms`);
  console.log(`Total 2xx:          ${result['2xx']}`);
  console.log(`Non-2xx:            ${result.non2xx}`);
  console.log(`Errors/Timeouts:    ${result.errors + result.timeouts}`);
}

async function start() {
  try {
    const token = await loginAdmin();
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // 1. Benchmark GET /api/v1/complaints
    const complaintsResult = await runBenchmark(
      'GET /api/v1/complaints (Paginated Query)',
      `${BASE_URL}/api/v1/complaints?page=1&limit=10`,
      headers
    );
    printSummary('GET /api/v1/complaints', complaintsResult);

    // 2. Benchmark GET /api/v1/dashboard/summary
    const dashboardResult = await runBenchmark(
      'GET /api/v1/dashboard/summary (MongoDB $facet + Redis)',
      `${BASE_URL}/api/v1/dashboard/summary`,
      headers
    );
    printSummary('GET /api/v1/dashboard/summary', dashboardResult);

    console.log('\n============================================================');
    console.log('✅ ALL LOAD BENCHMARKS COMPLETED SUCCESSFULLY');
    console.log('============================================================\n');
  } catch (err) {
    console.error(`\n❌ Load test failed:`, err.message);
    process.exit(1);
  }
}

start();
