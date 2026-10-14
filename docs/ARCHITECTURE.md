# System Architecture — Hostel Complaint & Maintenance Tracker

This document outlines the high-level architecture, design decisions, data flow, and security considerations for the Hostel Complaint & Maintenance Tracker application.

## Overview
The system enables students residing in university hostels/PGs to submit, track, and manage maintenance complaints while empowering administrative staff and wardens to prioritize, assign, and audit resolution workflows.

## Technology Stack
- **Backend API**: Node.js, Express.js, MongoDB + Mongoose, Redis (optional caching)
- **Frontend SPA**: React (Vite), React Router, Axios, Recharts
- **Security**: JWT (Access + Refresh tokens), bcryptjs, Helmet, CORS allowlist, express-rate-limit
- **Testing & DevOps**: Jest, Supertest, mongodb-memory-server, Docker, Docker Compose, GitHub Actions
