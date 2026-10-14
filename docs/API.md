# 📡 Hostel Complaint Tracker — API Documentation

Base URL: `http://localhost:5001/api/v1`

---

## 1. Authentication Endpoints (`/auth`)

### 1.1 Register Student
- **Method:** `POST`
- **Route:** `/auth/register`
- **Access:** Public
- **Request Body:**
```json
{
  "name": "Aman Sharma",
  "email": "aman@hostel.edu",
  "password": "Password123!",
  "roomNumber": "B-204"
}
```
- **Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "670da41e8f...",
      "name": "Aman Sharma",
      "email": "aman@hostel.edu",
      "role": "student",
      "roomNumber": "B-204"
    },
    "accessToken": "eyJhbGciOi..."
  }
}
```

### 1.2 Login
- **Method:** `POST`
- **Route:** `/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "warden@hostel.edu",
  "password": "Password123!"
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "670da41e...",
      "name": "Hostel Warden",
      "email": "warden@hostel.edu",
      "role": "admin"
    },
    "accessToken": "eyJhbGciOi..."
  }
}
```
*(Sets `refreshToken` in HTTP-only cookie automatically)*

### 1.3 Refresh Access Token
- **Method:** `POST`
- **Route:** `/auth/refresh-token`
- **Access:** Public (Requires valid `refreshToken` cookie)

### 1.4 Get Profile
- **Method:** `GET`
- **Route:** `/auth/me`
- **Access:** Authenticated (`Bearer <accessToken>`)

---

## 2. Complaint Endpoints (`/complaints`)

### 2.1 List Complaints
- **Method:** `GET`
- **Route:** `/complaints?status=Open&category=Electrical&page=1&limit=10`
- **Access:** Authenticated (Students see their own; Wardens/Staff see all with filters)

### 2.2 Lodge Complaint
- **Method:** `POST`
- **Route:** `/complaints`
- **Access:** Student only
- **Request Body:**
```json
{
  "title": "Water heater not functioning",
  "category": "Plumbing",
  "description": "Geyser does not heat water in bathroom B-204.",
  "priority": "High",
  "roomNumber": "B-204",
  "imageUrl": "https://example.com/geyser.jpg"
}
```

### 2.3 Update Status
- **Method:** `PATCH`
- **Route:** `/complaints/:id/status`
- **Access:** Admin or Staff
- **Request Body:**
```json
{
  "status": "In Progress"
}
```

### 2.4 Assign Staff Member
- **Method:** `PATCH`
- **Route:** `/complaints/:id/assign`
- **Access:** Admin only
- **Request Body:**
```json
{
  "staffId": "670da41e8f..."
}
```

### 2.5 Add Comment / Internal Note
- **Method:** `POST`
- **Route:** `/complaints/:id/comments`
- **Access:** Authenticated
- **Request Body:**
```json
{
  "text": "Technician visited room at 11 AM; part ordered.",
  "isInternal": true
}
```

### 2.6 Reopen Resolved Complaint
- **Method:** `POST`
- **Route:** `/complaints/:id/reopen`
- **Access:** Student (Ticket owner only)
- **Request Body:**
```json
{
  "reason": "Geyser tripped again after 5 minutes of usage."
}
```

---

## 3. Dashboard Endpoints (`/dashboard`)

### 3.1 Get Metrics & Analytics
- **Method:** `GET`
- **Route:** `/dashboard/metrics`
- **Access:** Admin only
- **Response:**
```json
{
  "success": true,
  "data": {
    "total": 45,
    "active": 18,
    "inProgress": 10,
    "resolved": 22,
    "critical": 3,
    "avgResolutionHours": 14.5,
    "categoryBreakdown": [
      { "category": "Electrical", "count": 16 },
      { "category": "Plumbing", "count": 12 },
      { "category": "Internet / Wi-Fi", "count": 9 },
      { "category": "Carpentry", "count": 5 },
      { "category": "Cleanliness", "count": 3 }
    ]
  }
}
```
