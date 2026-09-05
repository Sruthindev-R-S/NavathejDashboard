# API Documentation

## Base URL
```
https://vehicle-9srx.onrender.com
```

## Authentication
Most endpoints require JWT authentication. After login/register, include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Public Endpoints (No Authentication Required)

### 1. Register User
**Endpoint:** `POST /register`

**Description:** Register a new user account

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "secure_password123"
}
```

**Response (201 - Success):**
```json
{
  "message": "User registered successfully",
  "user": {
    "username": "john_doe"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing username or password
- `409 Conflict` - Username already exists
- `500 Internal Server Error` - Server error

---

### 2. Login
**Endpoint:** `POST /login`

**Description:** Authenticate user and get JWT token

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "secure_password123"
}
```

**Response (200 - Success):**
```json
{
  "message": "Login Success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `404 Not Found` - User not found
- `401 Unauthorized` - Invalid password
- `500 Internal Server Error` - Server error

---

## Protected Endpoints (Require Authentication)

### 3. Get Vehicle Query
**Endpoint:** `GET /get`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Description:** Get vehicle query data

**Response (200):**
```json
{
  "data": []
}
```

---

### 4. Mobile and Vehicle Data Handler
**Endpoint:** `POST /data`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Description:** Handle mobile and vehicle data

**Request Body:**
```json
{
  "mobile": "9876543210",
  "vehicleData": {}
}
```

**Response (200):**
```json
{
  "message": "Data processed successfully"
}
```

---

### 5. Get Employee Details
**Endpoint:** `GET /getEmployee`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Description:** Retrieve employee details

**Response (200):**
```json
{
  "employees": []
}
```

---

### 6. Add Employee
**Endpoint:** `POST /addEmployee`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Description:** Create a new employee record

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "department": "Engineering",
  "position": "Developer"
}
```

**Response (201):**
```json
{
  "message": "Employee added successfully",
  "employee": {}
}
```

---

### 7. Delete Employee
**Endpoint:** `DELETE /deleteEmployee`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Description:** Delete an employee record

**Request Body:**
```json
{
  "employeeId": "123"
}
```

**Response (200):**
```json
{
  "message": "Employee deleted successfully"
}
```

---

### 8. Get Vehicle Details
**Endpoint:** `GET /getVehicle`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Description:** Retrieve vehicle information

**Response (200):**
```json
{
  "vehicles": []
}
```

---

### 9. Update Vehicle
**Endpoint:** `PATCH /updateVehicle`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Description:** Update vehicle information

**Request Body:**
```json
{
  "vehicleId": "456",
  "licensePlate": "ABC-1234",
  "status": "active"
}
```

**Response (200):**
```json
{
  "message": "Vehicle updated successfully",
  "vehicle": {}
}
```

---

### 10. Update Action
**Endpoint:** `PATCH /updateAction`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Description:** Update action status or details

**Request Body:**
```json
{
  "actionId": "789",
  "status": "completed"
}
```

**Response (200):**
```json
{
  "message": "Action updated successfully"
}
```

---

## Example Requests Using cURL

### Register
```bash
curl -X POST https://vehicle-9srx.onrender.com/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"secure_password123"}'
```

### Login
```bash
curl -X POST https://vehicle-9srx.onrender.com/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"secure_password123"}'
```

### Get Employee (Protected)
```bash
curl -X GET https://vehicle-9srx.onrender.com/getEmployee \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Add Employee (Protected)
```bash
curl -X POST https://vehicle-9srx.onrender.com/addEmployee \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{"name":"John Smith","email":"john@example.com","department":"Engineering","position":"Developer"}'
```

---

## Example Requests Using JavaScript (Fetch API)

### Register
```javascript
fetch('https://vehicle-9srx.onrender.com/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'john_doe',
    password: 'secure_password123'
  })
})
.then(res => res.json())
.then(data => console.log(data))
```

### Login
```javascript
fetch('https://vehicle-9srx.onrender.com/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'john_doe',
    password: 'secure_password123'
  })
})
.then(res => res.json())
.then(data => {
  console.log('Token:', data.token);
  localStorage.setItem('token', data.token);
})
```

### Get Employee (Protected)
```javascript
const token = localStorage.getItem('token');

fetch('https://vehicle-9srx.onrender.com/getEmployee', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => console.log(data))
```

### Add Employee (Protected)
```javascript
const token = localStorage.getItem('token');

fetch('https://vehicle-9srx.onrender.com/addEmployee', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'John Smith',
    email: 'john@example.com',
    department: 'Engineering',
    position: 'Developer'
  })
})
.then(res => res.json())
.then(data => console.log(data))
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Username and password are required"
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid password"
}
```

### 403 Forbidden (Invalid/Expired Token)
```json
{
  "message": "Invalid token or token expired"
}
```

### 404 Not Found
```json
{
  "message": "User not found"
}
```

### 409 Conflict
```json
{
  "message": "Username already exists"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## Authentication Flow

1. **Register** - Create a new user account
   ```
   POST /register
   ```

2. **Login** - Get JWT token
   ```
   POST /login → Returns token
   ```

3. **Use Token** - Include in Authorization header for protected routes
   ```
   Authorization: Bearer <token>
   ```

4. **Token Expiry** - Token will expire after set time (check JWT_EXPIRE in environment)
   - Re-login to get a new token when expired

---

## Notes

- All timestamps are in UTC
- JWT tokens must be included in the Authorization header for protected endpoints
- Passwords are hashed using Argon2 before storage
- Ensure Content-Type header is set to `application/json` for POST/PATCH requests
