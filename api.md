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
curl -X POST https://protfolio-hub.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "22234103359@cse.bubt.edu.bd",
    "password": "123456",
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

### 9. Get All Users and Profiles (Admin Only)
```bash
curl -X GET http://localhost:3000/api/user \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
```

Response shape (truncated):
```json
{
  "success": true,
  "count": 2,
  "data": {
    "users": [
      { "_id": "...", "name": "...", "email": "...", "role": "customer", "verified": true, "createdAt": "..." }
    ],
    "profiles": [
      { "_id": "...", "userId": "...", "headline": "...", "bio": "...", "location": "..." }
    ]
  }
}
```

### 10. Delete User and Related Data (Admin Only)
```bash
curl -X DELETE http://localhost:3000/api/user/<USER_ID> \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
```

Response shape (truncated):
```json
{
  "success": true,
  "message": "User and related data deleted",
  "data": {
    "deleted": {
      "profile": 1,
      "experiences": 3,
      "educations": 1,
      "projects": 2,
      "skills": 5,
      "research": 0,
      "achievements": 1,
      "certifications": 1
    }
  }
}
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


# Replace <USER_ID> and <VALID_TOKEN> with actual values
curl -X GET \
  http://localhost:3000/api/skill/user/689cc596f98199f8d295e1a6/all \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjg5Y2M1OTZmOTgxOTlmOGQyOTVlMWE2Iiwicm9sZSI6ImN1c3RvbWVyIn0sImlhdCI6MTc1NTI4NDM0OCwiZXhwIjoxNzU3ODc2MzQ4fQ.XKADlmVEw2zKgg8acOrBPVbTb3lLQEUUL_UlLX401qY' \
  -H 'Content-Type: application/json'

  curl -X GET \
  http://localhost:3000/api/skill/skill/689f7c0c833da957f78d3c0f \
  -H 'Content-Type: application/json'

curl -X GET http://localhost:3000/api/skill/689f7c0c833da957f78d3c0f/generate-questions

  asif-ahammed@asif-ahammed-MS-7E02:~/Project/SDP-4-Protfolio-hub/protfolio-hub$ curl -X GET http://localhost:3000/api/skill/689f7c0c833da957f78d3c0f/generate-questions
{"skill":"C++","category":"Programming","proficiency":"Beginner","questions":[{"question":"What is a Javascript object?","correct_answer":"A function that stores objects, A way to manipulate variables","incorrect_answers":["None of the above","This is not correct","Incorrect option"]},{"question":"What is a 'normal' code in C++?","correct_answer":"A function that automatically retrieves the code, 'normal' code","incorrect_answers":["None of the above","This is not correct","Incorrect option"]},{"question":"What is a c++ script?","correct_answer":"A type of code that automatically returns a function that is automatically stored","incorrect_answers":["None of the above","This is not correct","Incorrect option"]},{"question":"What is the purpose of ''i'' in C++?","correct_answer":"To create code that is faster than ''i'm using in C++) Correct Answer: To create code that runs smoothly, To handle errors","incorrect_answers":["None of the above","This is not correct","Incorrect option"]},{"question":"What is a good code in C++?","correct_answer":"A technique to write code that can easily edit code and convert code to another function","incorrect_answers":["None of the above","This is not correct","Incorrect option"]}]}asif-ahammed@asif-ahammed-MS-7E02:~/Project/SDP-4-Protfolio-hub/protfolio-hub$

### Testing Skill Routes:

#### 1. Create New Skill (Protected Route)
```bash
curl -X POST https://protfolio-hub.vercel.app/api/skill \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjhhMGU3NmJkNzU5M2FiNjczNDMxZDI3Iiwicm9sZSI6ImN1c3RvbWVyIn0sImlhdCI6MTc1NTM3NjA5NiwiZXhwIjoxNzU3OTY4MDk2fQ.2m8Jt5IJLN5KnhNC22rnWu4k56NTuPmU4Pq0-Qh3e3I" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "JavaScript",
    "category": "Programming",
    "proficiency": 85,
    "priority": 1,
    "learningResources": ["MDN Web Docs", "Eloquent JavaScript"],
    "visibility": "Public"
  }'
```

#### 2. Get Current User's Skills (Protected Route)
```bash
curl -X GET https://protfolio-hub.vercel.app/api/skill/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjhhMGU3NmJkNzU5M2FiNjczNDMxZDI3Iiwicm9sZSI6ImN1c3RvbWVyIn0sImlhdCI6MTc1NTM3NjA5NiwiZXhwIjoxNzU3OTY4MDk2fQ.2m8Jt5IJLN5KnhNC22rnWu4k56NTuPmU4Pq0-Qh3e3I" \
  -H "Content-Type: application/json"
```

#### 3. Get Current User's Skills with Filters
```bash
# Filter by category
curl -X GET "https://protfolio-hub.vercel.app/api/skill/me?category=Programming" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjhhMGU3NmJkNzU5M2FiNjczNDMxZDI3Iiwicm9sZSI6ImN1c3RvbWVyIn0sImlhdCI6MTc1NTM3NjA5NiwiZXhwIjoxNzU3OTY4MDk2fQ.2m8Jt5IJLN5KnhNC22rnWu4k56NTuPmU4Pq0-Qh3e3I" \
  -H "Content-Type: application/json"

# Filter by proficiency range
curl -X GET "https://protfolio-hub.vercel.app/api/skill/me?minProficiency=70&maxProficiency=100" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjhhMGU3NmJkNzU5M2FiNjczNDMxZDI3Iiwicm9sZSI6ImN1c3RvbWVyIn0sImlhdCI6MTc1NTM3NjA5NiwiZXhwIjoxNzU3OTY4MDk2fQ.2m8Jt5IJLN5KnhNC22rnWu4k56NTuPmU4Pq0-Qh3e3I" \
  -H "Content-Type: application/json"
```

#### 4. Get Specific Skill by ID (Public)
```bash
curl -X GET https://protfolio-hub.vercel.app/api/skill/skill/689f7c0c833da957f78d3c0f \
  -H "Content-Type: application/json"
```

#### 5. Get Public Skills for a User (Public)
```bash
curl -X GET https://protfolio-hub.vercel.app/api/skill/user/68a0e76bd7593ab673431d27 \
  -H "Content-Type: application/json"
```

#### 6. Get All Skills for a User (Protected Route)
```bash
curl -X GET https://protfolio-hub.vercel.app/api/skill/user/68a0e76bd7593ab673431d27/all \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjhhMGU3NmJkNzU5M2FiNjczNDMxZDI3Iiwicm9sZSI6ImN1c3RvbWVyIn0sImlhdCI6MTc1NTM3NjA5NiwiZXhwIjoxNzU3OTY4MDk2fQ.2m8Jt5IJLN5KnhNC22rnWu4k56NTuPmU4Pq0-Qh3e3I" \
  -H "Content-Type: application/json"
```

#### 7. Update Skill (Protected Route)
```bash
curl -X PUT https://protfolio-hub.vercel.app/api/skill/689f7c0c833da957f78d3c0f \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjhhMGU3NmJkNzU5M2FiNjczNDMxZDI3Iiwicm9sZSI6ImN1c3RvbWVyIn0sImlhdCI6MTc1NTM3NjA5NiwiZXhwIjoxNzU3OTY4MDk2fQ.2m8Jt5IJLN5KnhNC22rnWu4k56NTuPmU4Pq0-Qh3e3I" \
  -H "Content-Type: application/json" \
  -d '{
    "proficiency": 90,
    "priority": 1,
    "learningResources": ["MDN Web Docs", "Eloquent JavaScript", "You Dont Know JS"]
  }'
```

#### 8. Update Skill Proficiency Only (Protected Route)
```bash
curl -X PATCH https://protfolio-hub.vercel.app/api/skill/689f7c0c833da957f78d3c0f/proficiency \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjhhMGU3NmJkNzU5M2FiNjczNDMxZDI3Iiwicm9sZSI6ImN1c3RvbWVyIn0sImlhdCI6MTc1NTM3NjA5NiwiZXhwIjoxNzU3OTY4MDk2fQ.2m8Jt5IJLN5KnhNC22rnWu4k56NTuPmU4Pq0-Qh3e3I" \
  -H "Content-Type: application/json" \
  -d '{
    "proficiency": 95
  }'
```

#### 9. Delete Skill (Protected Route)
```bash
curl -X DELETE https://protfolio-hub.vercel.app/api/skill/689f7c0c833da957f78d3c0f \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjhhMGU3NmJkNzU5M2FiNjczNDMxZDI3Iiwicm9sZSI6ImN1c3RvbWVyIn0sImlhdCI6MTc1NTM3NjA5NiwiZXhwIjoxNzU3OTY4MDk2fQ.2m8Jt5IJLN5KnhNC22rnWu4k56NTuPmU4Pq0-Qh3e3I" \
  -H "Content-Type: application/json"
```

#### 10. Generate Questions for Skill Test (Public)
```bash
curl -X GET "http://localhost:3000/api/skill/689f7c0c833da957f78d3c0f/generate-questions?num_questions=5" \
  -H "Content-Type: application/json"
```

### Example Skill Response Format:
```json
{
  "_id": "689f7c0c833da957f78d3c0f",
  "userId": "68a0e76bd7593ab673431d27",
  "name": "JavaScript",
  "category": "Programming",
  "proficiency": 85,
  "priority": 1,
  "learningResources": ["MDN Web Docs", "Eloquent JavaScript"],
  "visibility": "Public",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Example Generated Questions Response:
```json
{
  "skill": "JavaScript",
  "category": "Programming",
  "proficiency": "Advanced",
  "questions": [
    {
      "question": "What is a closure in JavaScript?",
      "correct_answer": "A function that has access to variables in its outer scope",
      "incorrect_answers": [
        "A way to close browser windows",
        "A method to end loops",
        "A type of variable declaration"
      ]
    }
  ]
}
```

### Skill API Features:
- **CRUD Operations**: Create, Read, Update, Delete skills
- **User-specific**: Each skill belongs to a specific user
- **Visibility Control**: Public, Private, or Connections-only skills
- **Proficiency Tracking**: 0-100 scale for skill level
- **Priority System**: 1-5 scale for skill importance
- **Learning Resources**: Array of learning materials
- **Filtering**: Filter by category and proficiency range
- **Question Generation**: AI-powered skill assessment questions
- **Authorization**: Proper user ownership validation

### Testing AI Routes:
```bash
curl -X GET http://localhost:3000/api/ai/health \
  -H "Content-Type: application/json"
```

#### 2. Generate Questions for Single Skill
```bash
curl -X POST http://localhost:3000/api/ai/generate-questions -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjg5Y2M1OTZmOTgxOTlmOGQyOTVlMWE2Iiwicm9sZSI6ImN1c3RvbWVyIn0sImlhdCI6MTc1NTMyNTYxNCwiZXhwIjoxNzU3OTE3NjE0fQ.vDxfdkBNepSTm1xWBD99ocLohjIve3eh6f5e3Fk1H6o" -H "Content-Type: application/json" -d '{"skill": "Java", "category": "Programming", "num_questions": 5}' | jq .
```

#### 3. Generate Questions for Multiple Skills
```bash
curl -X POST http://localhost:3000/api/ai/generate-multiple-skills \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjg5Y2M1OTZmOTgxOTlmOGQyOTVlMWE2Iiwicm9sZSI6ImN1c3RvbWVyIn0sImlhdCI6MTc1NTMyNTYxNCwiZXhwIjoxNzU3OTE3NjE0fQ.vDxfdkBNepSTm1xWBD99ocLohjIve3eh6f5e3Fk1H6o" \
  -H "Content-Type: application/json" \
  -d '{
    "skills": [
      {
        "skill": "JavaScript",
        "category": "Programming"
      },
      {
        "skill": "React",
        "category": "Frontend"
      },
      {
        "skill": "Node.js",
        "category": "Backend"
      }
    ]
  }'
```

#### 4. Get Available Skills
```bash
curl -X GET http://localhost:3000/api/ai/skills \
  -H "Content-Type: application/json"
```

### Example AI Response Format:
```json
{
  "success": true,
  "message": "Questions generated successfully",
  "data": {
    "skill": "JavaScript",
    "category": "Programming",
    "questions": [
      {
        "question": "What is a closure in JavaScript?",
        "correct_answer": "A function that has access to variables in its outer scope",
        "incorrect_answers": [
          "A way to close browser windows",
          "A method to end loops",
          "A type of variable declaration"
        ]
      }
    ]
  }
}
```

### Testing Portfolio Routes:

#### 1. Get All Users' Portfolio Data
```bash
curl -X GET http://localhost:3000/api/portfolio/all \
  -H "Content-Type: application/json"
```

#### 2. Get Portfolio by User ID
```bash
curl -X GET http://localhost:3000/api/portfolio/user/689cc596f98199f8d295e1a6 \
  -H "Content-Type: application/json"
```

#### 3. Get Portfolio by Email
```bash
curl -X GET http://localhost:3000/api/portfolio/email/22234103359@cse.bubt.edu.bd \
  -H "Content-Type: application/json"
```

#### 4. Get Current User's Portfolio (Protected Route)
```bash
curl -X GET http://localhost:3000/api/portfolio/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjg5Y2M1OTZmOTgxOTlmOGQyOTVlMWE2Iiwicm9sZSI6ImN1c3RvbWVyIn0sImlhdCI6MTc1NTE0NzExOSwiZXhwIjoxNzU3NzM5MTE5fQ.BDsEEiyGYci3Q45llWluxRXVFsYwrAvUc44BgToJdYQ" \
  -H "Content-Type: application/json"
```

#### 5. Search Portfolios by Name
```bash
curl -X GET "http://localhost:3000/api/portfolio/search?name=asif&limit=5&page=1" \
  -H "Content-Type: application/json"
```

#### 6. Search Portfolios by Skill
```bash
curl -X GET "http://localhost:3000/api/portfolio/search?skill=javascript&limit=10&page=1" \
  -H "Content-Type: application/json"
```

#### 7. Search Portfolios by Name and Skill
```bash
curl -X GET "http://localhost:3000/api/portfolio/search?name=asif&skill=react&limit=5&page=1" \
  -H "Content-Type: application/json"
```

### Example Portfolio Response Format:
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "user": {
        "id": "689cc596f98199f8d295e1a6",
        "name": "Asif Ahammed",
        "email": "asifahammed359@gmail.com",
        "verified": true,
        "role": "customer",
        "createdAt": "2024-01-01T00:00:00.000Z"
      },
      "profile": {
        "headline": "Full Stack Developer",
        "bio": "Passionate developer with expertise in modern web technologies",
        "location": "Dhaka, Bangladesh",
        "phone": "+8801234567890",
        "website": "https://asifahammed.com",
        "linkedin": "https://linkedin.com/in/asifahammed",
        "github": "https://github.com/asifahammed",
        "portfolioLink": "https://portfolio.asifahammed.com"
      },
      "projects": [
        {
          "title": "E-commerce Platform",
          "description": "A full-stack e-commerce application",
          "technologies": ["React", "Node.js", "MongoDB"],
          "status": "completed"
        }
      ],
      "experiences": [
        {
          "title": "Senior Developer",
          "company": "Tech Corp",
          "startDate": "2023-01-01",
          "endDate": "2024-01-01"
        }
      ],
      "educations": [
        {
          "degree": "Bachelor of Computer Science",
          "institution": "BUBT",
          "startDate": "2022-01-01",
          "endDate": "2026-01-01"
        }
      ],
      "certifications": [
        {
          "name": "AWS Certified Developer",
          "issuer": "Amazon Web Services",
          "issueDate": "2023-06-01"
        }
      ],
      "achievements": [
        {
          "title": "Best Developer Award",
          "description": "Recognized for outstanding contributions",
          "date": "2023-12-01"
        }
      ],
      "researches": [
        {
          "title": "AI in Web Development",
          "description": "Research on implementing AI in modern web applications",
          "publicationDate": "2023-08-01"
        }
      ],
      "skills": [
        {
          "name": "JavaScript",
          "category": "Programming",
          "proficiency": "Advanced"
        }
      ]
    }
  ]
}
```

### Portfolio API Features:
- **Public Access**: Most endpoints are public (no authentication required)
- **Comprehensive Data**: Returns all user-related information in one request
- **Search Functionality**: Search by name or skills with pagination
- **Multiple Lookup Methods**: By user ID, email, or current user
- **Error Handling**: Proper error messages for invalid requests
- **Performance Optimized**: Uses concurrent database queries 





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


eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjhhMGU3NmJkNzU5M2FiNjczNDMxZDI3Iiwicm9sZSI6ImN1c3RvbWVyIn0sImlhdCI6MTc1NTM3NjA5NiwiZXhwIjoxNzU3OTY4MDk2fQ.2m8Jt5IJLN5KnhNC22rnWu4k56NTuPmU4Pq0-Qh3e3I

---

## 📊 System Metrics API

The System Metrics API provides comprehensive monitoring and analytics for your Portfolio Hub application. It calculates real-time metrics including system health, security scores, user activity, and resource usage.

### Base URL
```
http://localhost:3000/api/metrics
```

### Authentication
All metrics endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### 1. Dashboard Metrics
**Get real-time dashboard metrics for the main dashboard view**

```bash
curl -X GET http://localhost:3000/api/metrics/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "activePortfolios": {
      "value": 15,
      "description": "3 portfolios created this week"
    },
    "systemHealth": {
      "value": 95.8,
      "description": "All systems operational"
    },
    "securityScore": {
      "value": 97.4,
      "description": "High security level maintained"
    },
    "realTimeMetrics": {
      "usersOnline": 5,
      "activeSessions": 8,
      "apiCallsPerMinute": 12,
      "storageUsage": 65.2
    }
  }
}
```

---

### 2. Detailed System Metrics
**Get comprehensive system metrics (Admin only)**

```bash
curl -X GET http://localhost:3000/api/metrics/detailed \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "systemMetrics": {
      "systemHealth": 95.8,
      "securityScore": 97.4,
      "databaseConnections": 1,
      "errorRate": 0.02
    },
    "portfolioMetrics": {
      "totalPortfolios": 25,
      "activePortfolios": 15,
      "portfoliosCreatedThisWeek": 3
    },
    "resourceMetrics": {
      "storageUsage": 65.2,
      "memoryUsage": 45.8,
      "cpuUsage": 23.4
    },
    "performanceMetrics": {
      "activeUsers": 5,
      "activeSessions": 8,
      "apiCallsPerMinute": 12,
      "responseTime": 150
    }
  }
}
```

---

### 3. Historical Metrics
**Get historical metrics data for charts and trends (Admin only)**

```bash
curl -X GET "http://localhost:3000/api/metrics/historical?hours=24" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Query Parameters:**
- `hours` (optional): Number of hours to look back (default: 24)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2024-01-15T10:00:00.000Z",
      "systemHealth": 95.8,
      "securityScore": 97.4,
      "storageUsage": 65.2,
      "activeUsers": 5,
      "activeSessions": 8,
      "apiCallsPerMinute": 12,
      "totalPortfolios": 25,
      "activePortfolios": 15,
      "portfoliosCreatedThisWeek": 3,
      "databaseConnections": 1,
      "memoryUsage": 45.8,
      "cpuUsage": 23.4,
      "responseTime": 150,
      "errorRate": 0.02
    }
  ]
}
```

---

### 4. System Health Status
**Get current system health status (Public endpoint)**

```bash
curl -X GET http://localhost:3000/api/metrics/health \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "systemHealth": 95.8,
    "message": "All systems operational"
  }
}
```

**Status Values:**
- `healthy`: System health >= 90%
- `warning`: System health 70-89%
- `critical`: System health < 70%

---

### 5. Portfolio Statistics
**Get detailed portfolio statistics**

```bash
curl -X GET http://localhost:3000/api/metrics/portfolio-stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPortfolios": 25,
    "activePortfolios": 15,
    "portfoliosCreatedThisWeek": 3
  }
}
```

---

### 6. System Resources
**Get current system resource usage**

```bash
curl -X GET http://localhost:3000/api/metrics/system-resources \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "memoryUsage": 45.8,
    "cpuUsage": 23.4,
    "storageUsage": 65.2
  }
}
```

---

## 🔧 Metrics Calculation Details

### System Health Calculation
The system health score is calculated using a weighted average of:
- **Database Health (30%)**: Response time and connection status
- **Memory Health (20%)**: Available memory vs total memory
- **CPU Health (20%)**: Current CPU usage
- **Response Time Health (20%)**: Average API response time
- **Error Rate Health (10%)**: Percentage of failed requests

### Security Score Calculation
The security score is calculated using:
- **Password Strength (30%)**: Analysis of user password complexity
- **SSL Health (25%)**: SSL certificate validity and configuration
- **Authentication Health (25%)**: JWT implementation and session management
- **Data Encryption Health (20%)**: Encryption of sensitive data

### Storage Usage Calculation
Storage usage is estimated based on:
- User data volume
- Project data volume
- File uploads and media
- Database size

### API Call Tracking
- Tracks all API calls in real-time
- Calculates calls per minute
- Maintains rolling window of 1 minute
- Auto-cleanup of old timestamps

### User Session Tracking
- Tracks active user sessions
- 30-minute session timeout
- Automatic cleanup of expired sessions
- Real-time session count

---

## 📈 Dashboard Access

### Web Dashboard
Access the visual dashboard at:
```
http://localhost:3000/dashboard.html
```

### Dashboard Features
- **Real-time Updates**: Auto-refreshes every 30 seconds
- **Responsive Design**: Works on desktop and mobile
- **Interactive Charts**: Visual representation of metrics
- **Authentication Required**: Must be logged in to view

### Dashboard Metrics Displayed
1. **Active Portfolios**: Number of active portfolios with weekly creation stats
2. **System Health**: Overall system health percentage with status description
3. **Security Score**: Security rating with descriptive message
4. **Real-time Metrics**:
   - Users Online
   - Active Sessions
   - API Calls per Minute
   - Storage Usage

---

## 🚀 Usage Examples

### 1. Monitor System Health
```bash
# Check system health
curl -X GET http://localhost:3000/api/metrics/health

# Get detailed health info (admin only)
curl -X GET http://localhost:3000/api/metrics/detailed \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 2. Track Portfolio Growth
```bash
# Get portfolio statistics
curl -X GET http://localhost:3000/api/metrics/portfolio-stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Monitor Resource Usage
```bash
# Check system resources
curl -X GET http://localhost:3000/api/metrics/system-resources \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Historical Analysis
```bash
# Get last 48 hours of data
curl -X GET "http://localhost:3000/api/metrics/historical?hours=48" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 🔒 Security Notes

- **Authentication Required**: Most endpoints require valid JWT token
- **Admin Access**: Detailed metrics require admin role
- **Rate Limiting**: API calls are tracked and can be rate-limited
- **Data Privacy**: No sensitive user data is exposed in metrics
- **Health Check**: Public health endpoint for monitoring tools

---

## 📊 Metrics Storage

All metrics are stored in the `SystemMetrics` collection with:
- **Timestamp**: When the metric was calculated
- **Real-time Values**: Current system state
- **Historical Data**: For trend analysis
- **Auto-cleanup**: Old data is automatically archived

---

## 🛠️ Integration Examples

### Frontend Integration
```javascript
// Load dashboard metrics
async function loadDashboardMetrics() {
  const response = await fetch('/api/metrics/dashboard', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  return data.data;
}

// Auto-refresh every 30 seconds
setInterval(loadDashboardMetrics, 30000);
```

### Monitoring Integration
```javascript
// Health check for monitoring tools
async function healthCheck() {
  const response = await fetch('/api/metrics/health');
  const data = await response.json();
  return data.data.status === 'healthy';
}
```


  export OPENAI_API_KEY='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'
  curl -sS https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"