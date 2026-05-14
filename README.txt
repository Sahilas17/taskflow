================================================================================
  TASKFLOW — Team Task Manager
  Full-Stack Web Application
================================================================================

LIVE URL:     https://taskflow-frontend-production.up.railway.app
GITHUB REPO:  https://github.com/YOUR_USERNAME/taskflow

--------------------------------------------------------------------------------
  OVERVIEW
--------------------------------------------------------------------------------

TaskFlow is a full-stack team task management application with role-based access
control (Admin/Member). It allows teams to create projects, assign tasks, track
progress, and collaborate efficiently.

--------------------------------------------------------------------------------
  KEY FEATURES
--------------------------------------------------------------------------------

AUTHENTICATION
  - JWT-based signup & login
  - Secure password hashing (bcryptjs)
  - Protected routes on both frontend and backend
  - Token stored in localStorage, auto-attached to all API requests

ROLE-BASED ACCESS CONTROL
  - Admin: Full access — manage users, all projects, change roles
  - Member: Access only to projects they are part of
  - Project-level roles: project owners/admins vs regular members
  - First registered user automatically becomes Admin

PROJECT MANAGEMENT
  - Create projects with name, description, due date, color
  - Add/remove team members per project
  - Progress tracking (completed vs total tasks)
  - Archive/complete projects

TASK MANAGEMENT
  - Create, edit, delete tasks per project
  - Assign tasks to project members
  - Statuses: To Do → In Progress → Review → Done
  - Priority levels: Low, Medium, High, Critical
  - Due dates with overdue highlighting
  - Tags/labels for categorization
  - Board view (kanban-style) and List view

DASHBOARD
  - At-a-glance stats: total tasks, my tasks, in progress, overdue
  - Status breakdown with visual progress bars
  - Overdue task alert panel
  - Recent activity table

TEAM PAGE
  - View all team members
  - Admin can promote/demote members to admin role

--------------------------------------------------------------------------------
  TECH STACK
--------------------------------------------------------------------------------

BACKEND
  - Node.js + Express.js (REST API)
  - MongoDB + Mongoose (database & ODM)
  - JWT (authentication)
  - bcryptjs (password hashing)
  - express-validator (input validation)

FRONTEND
  - React 18 + Vite (build tool)
  - React Router v6 (client-side routing)
  - Axios (HTTP client with interceptors)
  - react-hot-toast (notifications)
  - date-fns (date formatting)
  - Custom CSS (no UI library — fully handcrafted dark theme)

DEPLOYMENT
  - Railway (both backend and frontend deployed separately)
  - MongoDB Atlas (cloud database)

--------------------------------------------------------------------------------
  API ENDPOINTS
--------------------------------------------------------------------------------

AUTH
  POST   /api/auth/signup         Register new user
  POST   /api/auth/login          Login, receive JWT
  GET    /api/auth/me             Get current user

PROJECTS
  GET    /api/projects            List all accessible projects
  POST   /api/projects            Create new project
  GET    /api/projects/:id        Get project + its tasks
  PUT    /api/projects/:id        Update project (admin)
  DELETE /api/projects/:id        Delete project + tasks (admin)
  POST   /api/projects/:id/members        Add member
  DELETE /api/projects/:id/members/:uid   Remove member

TASKS
  GET    /api/tasks               List tasks (with filters)
  GET    /api/tasks/dashboard     Dashboard statistics
  POST   /api/tasks               Create task
  PUT    /api/tasks/:id           Update task
  DELETE /api/tasks/:id           Delete task
  POST   /api/tasks/:id/comments  Add comment

USERS
  GET    /api/users               List all users
  PUT    /api/users/:id/role      Change user role (admin only)
  PUT    /api/users/profile       Update own profile

--------------------------------------------------------------------------------
  DATABASE SCHEMA
--------------------------------------------------------------------------------

User
  name, email, password (hashed), role (admin|member), avatar, timestamps

Project
  name, description, owner (ref User), members [{user, role}],
  status (active|completed|archived), dueDate, color, timestamps

Task
  title, description, project (ref Project), assignee (ref User),
  createdBy (ref User), status (todo|in-progress|review|done),
  priority (low|medium|high|critical), dueDate, tags[], comments[], timestamps

--------------------------------------------------------------------------------
  LOCAL SETUP
--------------------------------------------------------------------------------

Prerequisites: Node.js 18+, MongoDB Atlas account (free tier)

1. Clone the repo:
   git clone https://github.com/YOUR_USERNAME/taskflow.git
   cd taskflow

2. Setup Backend:
   cd backend
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   npm install
   npm run dev

3. Setup Frontend:
   cd ../frontend
   cp .env.example .env
   # Edit VITE_API_URL to http://localhost:5000/api
   npm install
   npm run dev

4. Open http://localhost:5173 in your browser

--------------------------------------------------------------------------------
  DEPLOYMENT STEPS (Railway)
--------------------------------------------------------------------------------

1. Create MongoDB Atlas cluster (free) → get connection string

2. Push code to GitHub

3. Deploy Backend on Railway:
   - New project → Deploy from GitHub → select /backend
   - Add env vars: MONGODB_URI, JWT_SECRET, FRONTEND_URL, PORT=5000
   - Copy the generated backend URL

4. Deploy Frontend on Railway:
   - New project → Deploy from GitHub → select /frontend
   - Add env var: VITE_API_URL=https://YOUR-BACKEND.railway.app/api
   - Copy the generated frontend URL

5. Update backend FRONTEND_URL with the frontend Railway URL

--------------------------------------------------------------------------------
  VALIDATION & SECURITY
--------------------------------------------------------------------------------

- All inputs validated with express-validator
- Passwords hashed with bcrypt (salt rounds: 12)
- JWT tokens expire in 7 days
- Route-level auth middleware on all protected endpoints
- Role checks enforced server-side (not just frontend)
- CORS configured to allow only frontend origin in production

--------------------------------------------------------------------------------
  AUTHOR
--------------------------------------------------------------------------------

Built as part of full-stack assignment.
Timeline: ~10 hours

================================================================================
