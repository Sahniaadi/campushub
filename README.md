# 🎓 CampusHub – All-in-One Student Platform

> A full-stack student web application with Notes, Assignments, AI Tools, Planner, CGPA Calculator, and Community.

---

## 📁 Project Structure

```
system edu/
├── backend/                    # Node.js + Express API
│   ├── controllers/            # Business logic
│   │   ├── authController.js
│   │   ├── notesController.js
│   │   ├── assignmentController.js
│   │   ├── aiController.js
│   │   ├── plannerController.js
│   │   ├── cgpaController.js
│   │   ├── communityController.js
│   │   ├── notificationController.js
│   │   └── profileController.js
│   ├── middleware/
│   │   ├── auth.js             # JWT middleware
│   │   └── upload.js           # Multer file upload
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js
│   │   ├── Note.js
│   │   ├── Assignment.js
│   │   ├── Task.js
│   │   ├── CGPARecord.js
│   │   ├── Post.js
│   │   └── Notification.js
│   ├── routes/                 # Express routes
│   │   ├── auth.js
│   │   ├── notes.js
│   │   ├── assignments.js
│   │   ├── ai.js
│   │   ├── planner.js
│   │   ├── cgpa.js
│   │   ├── community.js
│   │   ├── notifications.js
│   │   └── profile.js
│   ├── scripts/
│   │   └── seed.js             # Sample data seeder
│   ├── uploads/                # Auto-created for file storage
│   ├── server.js               # Entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/                   # React.js app
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── api/
    │   │   └── axios.js        # Axios instance
    │   ├── context/
    │   │   ├── AuthContext.js  # Authentication state
    │   │   └── ThemeContext.js # Dark mode state
    │   ├── components/
    │   │   └── Layout/
    │   │       ├── Layout.jsx
    │   │       ├── Sidebar.jsx
    │   │       └── Navbar.jsx
    │   ├── pages/
    │   │   ├── Auth/
    │   │   │   ├── Login.jsx
    │   │   │   └── Register.jsx
    │   │   ├── Dashboard/Dashboard.jsx
    │   │   ├── Notes/Notes.jsx
    │   │   ├── Assignments/Assignments.jsx
    │   │   ├── AI/AITools.jsx
    │   │   ├── Planner/Planner.jsx
    │   │   ├── CGPA/CGPACalculator.jsx
    │   │   ├── Community/Community.jsx
    │   │   └── Profile/Profile.jsx
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

---

## ⚙️ Prerequisites

1. **Node.js** v18+ → [Download](https://nodejs.org/)
2. **MongoDB** (local or Atlas) → [Download](https://www.mongodb.com/try/download/community)
3. **Git** (optional)
4. **OpenAI API Key** (optional – demo mode works without it)

---

## 🚀 Step-by-Step Setup

### 1. Install MongoDB

- Download and install MongoDB Community Server
- Start MongoDB service:
  - **Windows**: It starts automatically after install, or run `mongod` in terminal

---

### 2. Setup the Backend

```bash
# Navigate to backend folder
cd "system edu/backend"

# Install dependencies
npm install

# Copy environment file
copy .env.example .env
```

Edit `.env` and set:
```env
MONGODB_URI=mongodb://localhost:27017/campushub
JWT_SECRET=any_long_random_string_here
OPENAI_API_KEY=sk-your-key-here   # Optional
```

```bash
# Seed the database with demo data
node scripts/seed.js

# Start the backend server
npm run dev
```

✅ Backend runs at: **http://localhost:5000**

---

### 3. Setup the Frontend

Open a **new terminal**:

```bash
# Navigate to frontend folder
cd "system edu/frontend"

# Install dependencies
npm install

# Start the React app
npm start
```

✅ Frontend opens at: **http://localhost:3000**

---

## 🔑 Demo Login Credentials

```
Email:    demo@campushub.com
Password: demo1234
```

Or click **"Continue with Demo Account"** on the Login page.

---

## 🌐 API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/notes` | List notes (search, filter) |
| POST | `/api/notes` | Upload note |
| DELETE | `/api/notes/:id` | Delete note |
| GET | `/api/assignments` | List assignments |
| POST | `/api/assignments` | Create assignment |
| PUT | `/api/assignments/:id/submit` | Mark submitted |
| POST | `/api/ai/chat` | Chat with AI |
| POST | `/api/ai/summarize` | Summarize notes |
| POST | `/api/ai/generate-code` | Generate code |
| POST | `/api/ai/solve-doubt` | Solve academic doubt |
| GET | `/api/planner/tasks` | Get tasks |
| POST | `/api/planner/tasks` | Create task |
| PUT | `/api/planner/tasks/:id/toggle` | Toggle complete |
| GET | `/api/cgpa` | Get CGPA record |
| POST | `/api/cgpa/semester` | Add/update semester |
| GET | `/api/community/posts` | Get forum posts |
| POST | `/api/community/posts` | Create post |
| POST | `/api/community/posts/:id/comment` | Add comment |
| GET | `/api/notifications` | Get notifications |

---

## 🤖 OpenAI Setup (Optional)

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an account → API Keys → Create new key
3. Copy the key to `backend/.env`:
   ```
   OPENAI_API_KEY=sk-...
   ```
4. Restart the backend

Without the key, all AI tools run in **Demo Mode** showing example responses.

---

## 🎓 CGPA Grade Scale (10-point)

| Grade | Points |
|-------|--------|
| O (Outstanding) | 10 |
| A+ | 9 |
| A | 8 |
| B+ | 7 |
| B | 6 |
| C | 5 |
| D | 4 |
| F (Fail) | 0 |

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, Tailwind CSS 3, React Router 6 |
| State | React Context API |
| HTTP | Axios |
| Icons | Lucide React |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (JSON Web Tokens) |
| AI | OpenAI GPT-3.5-turbo |
| Files | Multer |
| Date | date-fns |

---

## 🔧 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| MongoDB not connecting | Make sure MongoDB is running (`mongod`) |
| CORS error | Check `FRONTEND_URL` in backend `.env` |
| AI not responding | Add valid `OPENAI_API_KEY` in `.env` |
| File upload fails | Check `uploads/` folder exists in backend |
| Port in use | Change `PORT` in `.env` |

---

## 📝 Sample Test Data (after seed)

- **3 demo users** (demo, priya, arjun)
- **5 study notes** across subjects
- **5 assignments** with different statuses
- **5 planner tasks** for today
- **3 semesters** of CGPA data (Demo CGPA: ~8.9)
- **3 community posts** with comments
- **4 notifications**
