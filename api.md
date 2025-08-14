Here are cURL commands to test all the API endpoints in your authentication system:

### 1. User Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "22234103047@cse.bubt.edu.bd",
    "password": "password123",
    "role": "customer"
  }'
```

### 2. User Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "22234103359@cse.bubt.edu.bd",
    "password": "12345678",
    "rememberMe": true
  }'
```

### 3. Get Current User (Protected Route)
```bash
# First get token from login response, then:
curl -X GET http://localhost:3000/api/user/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjg5YjhkMjEwYzUyYTk3ZmU0ZGYyMDRhIiwicm9sZSI6ImN1c3RvbWVyIn0sImlhdCI6MTc1NTAyNjI3MiwiZXhwIjoxNzU3NjE4MjcyfQ.ToUDTRWxihT6mEdZo8SpQ75fwZiUrK9do8i9O3BA3nU"
```

### 4. Verify Email (Using token from signup email)
```bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "VERIFICATION_TOKEN_FROM_EMAIL"
  }'
```

### 5. Resend Verification Email
```bash
curl -X POST http://localhost:3000/api/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{
    "email": "asifahmedty404@gmail.com"
  }'
```

### 6. Forgot Password
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "asifahammed359@gmail.com"
  }'
```

### 7. Reset Password (Using code from email)
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "asifahammed359@gmail.com",
    "code": "DD3E83",
    "newPassword": "404asif404"
  }'
```

### 8. Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 9. Get All Users (Admin Only)
```bash
curl -X GET http://localhost:3000/api/user \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjg5Yjc3MmI2ZGU0NjUxNzNmNTk2NWM3Iiwicm9sZSI6ImFkbWluIn0sImlhdCI6MTc1NTA5NTg4OCwiZXhwIjoxNzU3Njg3ODg4fQ.2hjwAzOp6FTsFhy7j2U9LJKkt-53RP4h-CwvA2REmws"
```

### Testing Project Routes:

#### 1. Create Project
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjg5Y2M1OTZmOTgxOTlmOGQyOTVlMWE2Iiwicm9sZSI6ImN1c3RvbWVyIn0sImlhdCI6MTc1NTE0NzExOSwiZXhwIjoxNzU3NzM5MTE5fQ.BDsEEiyGYci3Q45llWluxRXVFsYwrAvUc44BgToJdYQ" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My New Project",
    "description": "This is a test project",
    "keyFeatures": ["Feature 1", "Feature 2"],
    "technologies": ["Node.js", "React"],
    "startDate": "2023-01-01"
  }'
```

#### 2. Get All Projects
```bash
curl -X GET http://localhost:3000/api/projects \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjg5Y2M1OTZmOTgxOTlmOGQyOTVlMWE2Iiwicm9sZSI6ImN1c3RvbWVyIn0sImlhdCI6MTc1NTE0NzExOSwiZXhwIjoxNzU3NzM5MTE5fQ.BDsEEiyGYci3Q45llWluxRXVFsYwrAvUc44BgToJdYQ"
```

#### 3. Get Single Project
```bash
curl -X GET http://localhost:3000/api/projects/689d6d1f173c6ae60ffa5a04 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjg5Y2M1OTZmOTgxOTlmOGQyOTVlMWE2Iiwicm9sZSI6ImN1c3RvbWVyIn0sImlhdCI6MTc1NTE0NzExOSwiZXhwIjoxNzU3NzM5MTE5fQ.BDsEEiyGYci3Q45llWluxRXVFsYwrAvUc44BgToJdYQ"
```

#### 4. Update Project
```bash
curl -X PUT http://localhost:3000/api/projects/689d6d1f173c6ae60ffa5a04 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjg5Y2M1OTZmOTgxOTlmOGQyOTVlMWE2Iiwicm9sZSI6ImN1c3RvbWVyIn0sImlhdCI6MTc1NTE0NzExOSwiZXhwIjoxNzU3NzM5MTE5fQ.BDsEEiyGYci3Q45llWluxRXVFsYwrAvUc44BgToJdYQ" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Project Title",
    "status": "completed"
  }'
```

#### 5. Delete Project
```bash
curl -X DELETE http://localhost:3000/api/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Tips for Testing:
1. Replace placeholders (YOUR_JWT_TOKEN, PROJECT_ID, etc.) with actual values
2. For protected routes, you must include the JWT token from login
3. The server must be running (typically on port 3000)
4. For email-related routes, check your console logs for the email content
5. Use `-v` flag for verbose output if you need to debug requests

Example with verbose output:
```bash
curl -v -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"asifahammed359@gmail.com","password":"password123"}'
```