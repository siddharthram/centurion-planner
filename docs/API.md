# Centurion API Documentation

This document describes the REST API for Centurion, suitable for web, iOS, Android, and other clients.

## Base URL

```
Production: https://your-domain.vercel.app/api
Development: http://localhost:3000/api
```

## Authentication

The API supports two authentication methods:

### 1. Cookie-based (Web browsers)
Automatically handled via Supabase SSR. No action required for web apps.

### 2. Bearer Token (Mobile apps, external clients)

Include the Supabase access token in the `Authorization` header:

```
Authorization: Bearer <supabase_access_token>
```

#### Getting a Token (iOS Example)

```swift
import Supabase

let client = SupabaseClient(
    supabaseURL: URL(string: "https://xxxxx.supabase.co")!,
    supabaseKey: "your-anon-key"
)

// Sign in
let session = try await client.auth.signIn(
    email: "user@example.com",
    password: "password"
)

// Use the access token for API calls
let accessToken = session.accessToken
```

---

## Endpoints

### Authentication

#### GET /api/auth/me

Get the current authenticated user's profile.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "emailVerified": true,
    "createdAt": "2026-01-04T12:00:00Z",
    "profile": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "company_name": null,
      "role": null,
      "created_at": "2026-01-04T12:00:00Z",
      "updated_at": "2026-01-04T12:00:00Z"
    }
  }
}
```

#### PUT /api/auth/me

Update the current user's profile.

**Request Body:**
```json
{
  "full_name": "John Doe",
  "company_name": "Acme Inc",
  "role": "Engineer"
}
```

---

### Templates

#### GET /api/templates

List all available templates. **No authentication required.**

**Response:**
```json
{
  "data": [
    {
      "id": "daily",
      "title": "Daily Check-In",
      "type": "review",
      "frequency": "daily",
      "duration": "5 minutes",
      "description": "Quick daily reflection...",
      "version": "1.0.0"
    }
  ]
}
```

#### GET /api/templates?id={templateId}&withContent=true

Get a specific template with its content.

**Response:**
```json
{
  "data": {
    "id": "daily",
    "metadata": {
      "id": "daily",
      "title": "Daily Check-In",
      "type": "review",
      "frequency": "daily",
      "duration": "5 minutes",
      "version": "1.0.0"
    },
    "content": "# Daily Check-In\n\n**Date**: 2026-01-04\n...",
    "rawContent": "# Daily Check-In\n\n**Date**: {{date}}\n..."
  }
}
```

---

### Reviews

#### GET /api/reviews

List all reviews for the authenticated user.

**Query Parameters:**
- `type` (optional): Filter by type (`daily`, `weekly`, `quarterly`, `annual`)
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "type": "daily",
      "date": "2026-01-04",
      "template_id": "daily",
      "template_version": "1.0.0",
      "content": "# Daily Check-In\n...",
      "metadata": {},
      "created_at": "2026-01-04T12:00:00Z",
      "updated_at": "2026-01-04T12:00:00Z"
    }
  ],
  "meta": {
    "total": 100,
    "limit": 50,
    "offset": 0
  }
}
```

#### POST /api/reviews

Create a new review.

**Request Body:**
```json
{
  "type": "daily",
  "date": "2026-01-04",
  "template_id": "daily",
  "template_version": "1.0.0",
  "content": "# Daily Check-In\n\n**Date**: 2026-01-04\n...",
  "metadata": {
    "energy_level": 7
  }
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "type": "daily",
    "date": "2026-01-04",
    ...
  }
}
```

#### GET /api/reviews/{id}

Get a specific review.

#### PUT /api/reviews/{id}

Update a review.

**Request Body:**
```json
{
  "content": "# Updated content...",
  "metadata": {}
}
```

#### DELETE /api/reviews/{id}

Delete a review.

**Response:** `200 OK`
```json
{
  "success": true
}
```

---

### Goals

#### GET /api/goals

List all goals for the authenticated user.

**Query Parameters:**
- `type` (optional): Filter by type (`1-year`, `3-year`, `10-year`)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "type": "1-year",
      "template_id": "goals-1-year",
      "template_version": "1.0.0",
      "content": "# 1-Year Goals\n...",
      "metadata": {},
      "created_at": "2026-01-04T12:00:00Z",
      "updated_at": "2026-01-04T12:00:00Z"
    }
  ]
}
```

#### POST /api/goals

Create a new goal.

**Request Body:**
```json
{
  "type": "1-year",
  "template_id": "goals-1-year",
  "template_version": "1.0.0",
  "content": "# 1-Year Goals\n...",
  "metadata": {}
}
```

#### GET /api/goals/{id}

Get a specific goal.

#### PUT /api/goals/{id}

Update a goal.

#### DELETE /api/goals/{id}

Delete a goal.

---

### Documents

#### GET /api/documents

List all foundational documents for the authenticated user.

**Query Parameters:**
- `type` (optional): Filter by type (`north_star`, `vivid_vision`, `principles`, `memory`)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "type": "north_star",
      "template_id": "north_star",
      "template_version": "1.0.0",
      "content": "# North Star\n...",
      "metadata": {},
      "created_at": "2026-01-04T12:00:00Z",
      "updated_at": "2026-01-04T12:00:00Z"
    }
  ]
}
```

#### POST /api/documents

Create a new document.

#### GET /api/documents/{id}

Get a specific document.

#### PUT /api/documents/{id}

Update a document.

#### DELETE /api/documents/{id}

Delete a document.

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message here"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing or invalid token) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## iOS Integration Example

```swift
import Foundation

class PersonalOSAPI {
    let baseURL: URL
    var accessToken: String?
    
    init(baseURL: String) {
        self.baseURL = URL(string: baseURL)!
    }
    
    func request<T: Decodable>(
        endpoint: String,
        method: String = "GET",
        body: Data? = nil
    ) async throws -> T {
        var request = URLRequest(url: baseURL.appendingPathComponent(endpoint))
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if let token = accessToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        if let body = body {
            request.httpBody = body
        }
        
        let (data, _) = try await URLSession.shared.data(for: request)
        return try JSONDecoder().decode(T.self, from: data)
    }
    
    // Get all daily reviews
    func getDailyReviews() async throws -> ReviewListResponse {
        return try await request(endpoint: "/api/reviews?type=daily")
    }
    
    // Create a review
    func createReview(_ review: CreateReviewRequest) async throws -> ReviewResponse {
        let body = try JSONEncoder().encode(review)
        return try await request(endpoint: "/api/reviews", method: "POST", body: body)
    }
    
    // Get current user
    func getCurrentUser() async throws -> UserResponse {
        return try await request(endpoint: "/api/auth/me")
    }
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting before production use with high traffic.

---

**Last Updated:** 2026-01-04

