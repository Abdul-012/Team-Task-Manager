TaskFlow - Team Task Manager

TaskFlow is a full-stack team task management app built for the assignment requirement: authentication, project/team management, task assignment, status tracking, dashboard stats, validations, database relationships, and Admin/Member role-based access control.

GitHub Repository:
https://github.com/Abdul-012/Team-Task-Manager

Live Application URL:
https://team-task-manager-production-8bf2.up.railway.app

Tech Stack:
- Backend: Node.js, Express.js
- Frontend: HTML, CSS, vanilla JavaScript
- Database: Supabase PostgreSQL
- Auth: bcryptjs, JWT, httpOnly cookies
- Validation: express-validator
- Deployment: Railway

Main Features:
- Signup and login
- Hashed passwords
- JWT cookie session
- Optional GitHub OAuth login shown only when OAuth variables are configured
- Create and view projects
- Add and remove team members
- Admin/Member role-based access control
- Create, edit, delete, assign, and update tasks
- Dashboard with total tasks, in-progress tasks, completed tasks, overdue tasks, and personal tasks
- Supabase SQL schema with relationships, constraints, indexes, and updated_at triggers

Local Setup:
1. Install Node.js 20+.
2. Clone the repository:
   git clone https://github.com/Abdul-012/Team-Task-Manager.git
   cd Team-Task-Manager
3. Install dependencies:
   npm install
4. Create a Supabase project.
5. Open Supabase SQL Editor and run the SQL from:
   backend/config/schema.sql
6. Copy .env.example to .env and fill:
   SUPABASE_URL
   SUPABASE_SERVICE_KEY
   JWT_SECRET
   PORT
   NODE_ENV
   APP_URL
7. Start locally:
   npm run dev
8. Open:
   http://localhost:3000

Railway Deployment:
1. Push the code to GitHub.
2. Open Railway.
3. Create New Project.
4. Select Deploy from GitHub Repo.
5. Choose Abdul-012/Team-Task-Manager.
6. Add Railway environment variables:
   SUPABASE_URL
   SUPABASE_SERVICE_KEY
   JWT_SECRET
   NODE_ENV=production
   APP_URL=https://team-task-manager-production-8bf2.up.railway.app
7. Railway runs npm start automatically.
8. Test:
   https://team-task-manager-production-8bf2.up.railway.app/healthz

Demo Video Checklist:
1. Show signup/login.
2. Create a project.
3. Add a team member.
4. Create a task and assign it.
5. Update task status.
6. Show dashboard stats and overdue task behavior.
7. Show role-based restriction: Member cannot delete project or manage members.