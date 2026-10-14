# API Reference — Hostel Complaint & Maintenance Tracker

Base URL: `http://localhost:5001/api/v1`

---

## 1. Authentication & Session Management

### Register a User
- **Route**: `POST /api/v1/auth/register`
- **Rate Limit**: 10 requests / 15 minutes
- **Access**: Public
- **Request Body (Student)**:
  ```json
  {
    "name": "Aman Verma",
    "email": "aman@hostel.edu",
    "password": "Password123!",
    "role": "student",
    "roomNumber": "A-101",
    "phone": "9876543210"
  }
  ```
- **Request Body (Admin / Staff)**:
  ```json
  {
    "name": "Chief Warden",
    "email": "warden@hostel.edu",
    "password": "AdminPassword123!",
    "role": "admin"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "requestId": "da4b8e41-088b-4e1e-a5e9-1a424754df43",
    "data": {
      "user": {
        "_id": "670da483e0a158b49e048712",
        "name": "Aman Verma",
        "email": "aman@hostel.edu",
        "role": "student",
        "roomNumber": "A-101",
        "phone": "9876543210",
        "createdAt": "2026-10-14T13:19:35.000Z",
        "updatedAt": "2026-10-14T13:19:35.000Z"
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

---

### Login User
- **Route**: `POST /api/v1/auth/login`
- **Rate Limit**: 10 requests / 15 minutes
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "aman@hostel.edu",
    "password": "Password123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Logged in successfully",
    "requestId": "f83a4291-7f82-416a-9a99-b14fa06277d1",
    "data": {
      "user": {
        "_id": "670da483e0a158b49e048712",
        "name": "Aman Verma",
        "email": "aman@hostel.edu",
        "role": "student",
        "roomNumber": "A-101"
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

---

### Refresh Access Token (Token Rotation)
- **Route**: `POST /api/v1/auth/refresh-token`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Access token refreshed successfully",
    "requestId": "2c94ba01-38fe-4a37-b8d4-87cfd422a101",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

---

### Get Authenticated User Profile
- **Route**: `GET /api/v1/auth/me`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Access**: Authenticated (`student`, `admin`, `staff`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User profile retrieved successfully",
    "requestId": "9082acbb-6541-4560-84cf-38411b0213aa",
    "data": {
      "_id": "670da483e0a158b49e048712",
      "name": "Aman Verma",
      "email": "aman@hostel.edu",
      "role": "student",
      "roomNumber": "A-101"
    }
  }
  ```

---

### Logout & Revoke Session
- **Route**: `POST /api/v1/auth/logout`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully",
    "requestId": "8134bb01-4432-4e01-9acb-001923fa188a",
    "data": null
  }
  ```

---

## 2. Complaint Management & Audit Trail

### Register a Maintenance Complaint
- **Route**: `POST /api/v1/complaints`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Rate Limit**: 30 complaints / hour
- **Access**: Students & Admins
- **Request Body**:
  ```json
  {
    "title": "Bathroom tap leaking severely",
    "description": "Water is dripping constantly and flooding the bathroom floor.",
    "category": "water",
    "priority": "high",
    "imageUrl": "https://example.com/tap.jpg"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Complaint registered successfully",
    "requestId": "9c104e7b-1234-4567-89ab-cdef01234567",
    "data": {
      "_id": "670da990e0a158b49e048799",
      "title": "Bathroom tap leaking severely",
      "description": "Water is dripping constantly and flooding the bathroom floor.",
      "category": "water",
      "priority": "high",
      "status": "Open",
      "student": "670da483e0a158b49e048712",
      "roomNumber": "A-101",
      "imageUrl": "https://example.com/tap.jpg",
      "statusHistory": [
        {
          "status": "Open",
          "changedBy": "670da483e0a158b49e048712",
          "note": "Complaint registered by student",
          "timestamp": "2026-10-14T13:25:00.000Z"
        }
      ],
      "comments": [],
      "createdAt": "2026-10-14T13:25:00.000Z"
    }
  }
  ```

---

### List Complaints (Pagination & Filters)
- **Route**: `GET /api/v1/complaints?page=1&limit=10&status=Open&category=water&priority=high`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Access**:
  - `student`: Automatically scoped to own complaints only (`{ student: req.user._id }`).
  - `admin`: Can view all complaints across students.
  - `staff`: Can view all complaints or filter by `assignedOnly=true`.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Complaints fetched successfully",
    "requestId": "3b29c1e0-789a-4123-bcde-fabc01234567",
    "data": [
      {
        "_id": "670da990e0a158b49e048799",
        "title": "Bathroom tap leaking severely",
        "category": "water",
        "priority": "high",
        "status": "Open",
        "roomNumber": "A-101",
        "student": {
          "name": "Aman Verma",
          "email": "aman@hostel.edu",
          "roomNumber": "A-101"
        },
        "assignedTo": null,
        "createdAt": "2026-10-14T13:25:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
  ```

---

### Get Single Complaint Details
- **Route**: `GET /api/v1/complaints/:id`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Access**:
  - Students can strictly view their own complaints (cross-student access yields `403 Forbidden`).
  - Admins and Staff can view any complaint. Internal staff notes are automatically stripped out for students.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Complaint retrieved successfully",
    "requestId": "4a51e2bc-9012-4345-cdef-123456789abc",
    "data": {
      "_id": "670da990e0a158b49e048799",
      "title": "Bathroom tap leaking severely",
      "description": "Water is dripping constantly and flooding the bathroom floor.",
      "category": "water",
      "priority": "high",
      "status": "In Progress",
      "roomNumber": "A-101",
      "statusHistory": [
        {
          "status": "Open",
          "changedBy": { "name": "Aman Verma", "role": "student" },
          "note": "Complaint registered by student",
          "timestamp": "2026-10-14T13:25:00.000Z"
        },
        {
          "status": "In Progress",
          "changedBy": { "name": "Plumber John", "role": "staff" },
          "note": "Inspecting pipeline in duct",
          "timestamp": "2026-10-14T13:40:00.000Z"
        }
      ],
      "comments": []
    }
  }
  ```

---

### Update Complaint Status & Audit Trail
- **Route**: `PATCH /api/v1/complaints/:id/status`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Access**:
  - `admin` and `staff`: Can advance status (`Open` -> `In Progress` -> `Resolved` -> `Closed`).
  - `student`: Can **only** reopen a `Resolved` complaint (`Resolved` -> `In Progress`).
- **Request Body**:
  ```json
  {
    "status": "Resolved",
    "note": "Replaced faulty washer and tested water flow"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Complaint status updated to Resolved",
    "requestId": "2e3f4a5b-6c7d-8e9f-0a1b-2c3d4e5f6a7b",
    "data": {
      "_id": "670da990e0a158b49e048799",
      "status": "Resolved",
      "resolvedAt": "2026-10-14T14:10:00.000Z"
    }
  }
  ```

---

### Assign Complaint to Staff (Admin Only)
- **Route**: `PATCH /api/v1/complaints/:id/assign`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Access**: `admin` only (Wardens)
- **Request Body**:
  ```json
  {
    "staffId": "670da512e0a158b49e048725"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Staff assigned to complaint successfully",
    "requestId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    "data": {
      "_id": "670da990e0a158b49e048799",
      "assignedTo": "670da512e0a158b49e048725",
      "status": "In Progress"
    }
  }
  ```

---

### Add Comment / Internal Note
- **Route**: `POST /api/v1/complaints/:id/comments`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Access**: Students (own complaints), Staff, and Admins
- **Request Body**:
  ```json
  {
    "text": "Waiting for delivery of replacement PVC pipe from warehouse.",
    "isInternal": true
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Comment added successfully",
    "requestId": "7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b",
    "data": {
      "_id": "670da990e0a158b49e048799",
      "comments": [
        {
          "user": "670da512e0a158b49e048725",
          "text": "Waiting for delivery of replacement PVC pipe from warehouse.",
          "isInternal": true,
          "createdAt": "2026-10-14T13:55:00.000Z"
        }
      ]
    }
  }
  ```

---

## 3. Dashboard Analytics & Reporting

### Get Dashboard Metrics Summary
- **Route**: `GET /api/v1/dashboard/summary`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Access**: `admin` and `staff` only (Wardens & Maintenance Staff)
- **Caching**: Cached in Redis for 60 seconds with active invalidation on mutations.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Dashboard summary retrieved successfully",
    "requestId": "28a0deaf-78f7-4125-b36d-5746101ae2dd",
    "cached": false,
    "data": {
      "totalComplaints": 20,
      "unresolvedUrgentCount": 4,
      "statusBreakdown": {
        "Open": 6,
        "In Progress": 6,
        "Resolved": 5,
        "Closed": 3
      },
      "categoryBreakdown": [
        { "category": "water", "count": 5, "percentage": 25 },
        { "category": "electricity", "count": 4, "percentage": 20 },
        { "category": "furniture", "count": 4, "percentage": 20 },
        { "category": "wifi", "count": 3, "percentage": 15 },
        { "category": "cleanliness", "count": 2, "percentage": 10 },
        { "category": "other", "count": 2, "percentage": 10 }
      ],
      "priorityBreakdown": {
        "low": 4,
        "medium": 7,
        "high": 5,
        "urgent": 4
      },
      "averageResolutionTimeHours": 8.4,
      "totalResolvedCount": 8,
      "calculatedAt": "2026-10-14T14:10:31.904Z"
    }
  }
  ```

