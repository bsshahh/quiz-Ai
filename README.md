AI Quizzer – Backend

This is the backend service for AI Quizzer, built with Node.js + Express.
It supports AI-powered quiz generation, secure user authentication, and submission history tracking.

🚀 Setup Instructions
1. Install dependencies
npm install

2. Create .env file

In the root folder, add the following values:

# MongoDB Connection
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<dbname>

# Server Port
PORT=5500

# JWT Secret Key
JWT_SECRET=your_jwt_secret

# Groq API Key
GROQ_API_KEY=your_groq_api_key

# Email Credentials
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_app_password

# Groq Models
GROQ_MODEL1=llama-3.1-8b-instant
GROQ_MODEL2=llama-3.3-70b-versatile

# Redis Config
REDIS_HOST=redis
REDIS_PORT=6379

3. Run Locally
Without Docker
npm run dev / npm start

With Docker (recommended, Redis included 🚀)

Make sure you have Docker installed, then run:

docker-compose up -d


This will start:

Node.js server

Redis (caching layer)


Server will be available at:

http://localhost:5500

4. API Documentation

Swagger UI is available at:

http://localhost:5500/api-docs

🤖 AI Integration (Groq)

Provider: Groq API

Models used:

llama-3.1-8b-instant → fast quiz generation

llama-3.3-70b-versatile → detailed evaluation

Usage:
The backend uses Groq API for:

Quiz generation

Answer evaluation

AI-based suggestions

AI-based hint for question

📌Redis (via Docker ) is used to:

Cache quizzes (/quizzes and /quizzes/:id)

Cache history, oldsubmissions

Reduce API latency and repeated AI calls


📌 Example API Requests
Login
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "mypassword"
}

Generate Quiz
POST /api/quizzes/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Math",
  "grade": "10"
}

Submit Quiz
POST /api/submissions/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "quizId": "<quiz_id>",
  "responses": [
    { "questionId": "q1", "answer": "A" },
    { "questionId": "q2", "answer": "C" }
  ]
}

R