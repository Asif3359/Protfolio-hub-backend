# 🚀 Portfolio-hub — AI-Powered Portfolio Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

> **A modern portfolio platform where users can showcase their skills, test their abilities with AI assistance, and build professional resumes — all in one place.**

## 🌐 Live Demo

| Frontend | Backend API (Docs) |
|----------|-------------------|
| [🔗 portfolio-hub-web.vercel.app](https://portfolio-hub-web.vercel.app) | [🔗 Portfolio-hub](https://github.com/Asif3359/Protfolio-hub-backend) |


## 🔑 Demo Account

Use the credentials below to explore the platform without signing up:

| Field | Value |
|-------|-------|
| **Email** | `asifahammednishst@gmail.com` |
| **Password** | `123456` |

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI-Powered Skill Assessment** | Test your skills with intelligent, adaptive assessments powered by AI. |
| 📄 **AI Resume Builder** | Generate professional, ATS-friendly resumes with AI assistance. |
| 🧑‍💻 **Portfolio Showcase** | Create and customize your personal portfolio to highlight projects & experience. |
| 📊 **Skill Analytics** | Visual insights into your strengths and areas for improvement. |
| 🔐 **Secure Authentication** | JWT-based authentication with role-based access control. |
| 📱 **Responsive Design** | Seamless experience across desktop, tablet, and mobile devices. |

---

## 🛠️ Tech Stack

### Frontend
```
Next.js 15  |  TypeScript  |  Tailwind CSS  |  Framer Motion
```
- React Hooks & Server Components
- API integration with Axios
- Responsive UI with dark/light mode

### Backend
```
Express.js  |  Node.js  |  MongoDB  |  Mongoose ODM
```
- RESTful API architecture
- JWT authentication & authorization
- AI integration (OpenAI / Gemini)
- Input validation & error handling

### DevOps & Tools
```
Vercel (Frontend)  |  Render / Vercel (Backend)  |  Git & GitHub
```

---

## 📁 Repository Structure

```
portfolio-hub/
├── frontend/                 # Next.js client
│   ├── src/
│   │   ├── app/              # App router pages
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/              # API calls & utilities
│   │   └── styles/           # Global styles
│   └── package.json
│
├── backend/                  # Express.js server
│   ├── src/
│   │   ├── controllers/      # Route controllers
│   │   ├── models/           # MongoDB models
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Auth, error handling
│   │   └── services/         # Business logic & AI
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)
- OpenAI / Gemini API key (for AI features)

### 1. Clone the Repository

```bash
git clone https://github.com/Asif3359/protfolio-hub.git
cd protfolio-hub
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
AI_API_KEY=your_openai_or_gemini_key
```

Start the backend server:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📸 Screenshots

> *Screenshots coming soon — check the live demo!*

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📬 Contact

**Asif Ahammed Nishst**  
[![GitHub](https://img.shields.io/badge/GitHub-Asif3359-181717?style=flat-square&logo=github)](https://github.com/Asif3359)  
[![Email](https://img.shields.io/badge/Email-asifahammednishst@gmail.com-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:asifahammednishst@gmail.com)

---

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/) — React framework
- [Express.js](https://expressjs.com/) — Backend framework
- [MongoDB](https://mongodb.com/) — NoSQL database
- [Vercel](https://vercel.com/) — Hosting platform
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/Asif3359">Asif Ahammed Nishst</a>
</div>
