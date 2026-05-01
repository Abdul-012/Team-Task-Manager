# TaskFlow - Team Task Manager

TaskFlow is a full-stack team task management application built for managing projects, team members, task assignments, task status tracking, dashboard statistics, validations, database relationships, and role-based access control.

**Live Application:** https://team-task-manager-production-8bf2.up.railway.app  
**GitHub Repository:** https://github.com/Abdul-012/Team-Task-Manager

---

## Features

- User signup and login
- Password hashing using bcryptjs
- JWT authentication stored in an httpOnly cookie
- Optional GitHub OAuth login
- Create, view, and delete projects
- Add and remove team members
- Admin and Member role-based access control
- Create, edit, delete, assign, and update tasks
- Dashboard with task statistics
- Track completed, in-progress, overdue, and personal tasks
- Supabase PostgreSQL database
- Proper table relationships with foreign keys
- Server-side validations using express-validator
- Railway-ready Node.js/Express deployment

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | Node.js, Express.js |
| Frontend | HTML, CSS, Vanilla JavaScript |
| Database | Supabase PostgreSQL |
| Authentication | bcryptjs, JWT, httpOnly cookies |
| Validation | express-validator |
| Deployment | Railway |

---

## Project Structure

```text
Team-Task-Manager/
├── server.js
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
├── README.md
├── README.txt
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── schema.sql
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validators.js
│   └── routes/
│       ├── auth.js
│       ├── dashboard.js
│       ├── projects.js
│       └── tasks.js
└── frontend/
    ├── index.html
    ├── signup.html
    ├── dashboard.html
    ├── projects.html
    ├── project.html
    ├── new-project.html
    ├── new-task.html
    ├── edit-task.html
    ├── css/
    │   └── style.css
    └── js/
        ├── api.js
        └── utils.js
```

---

## Local Setup

### 1. Prerequisites

Make sure you have these installed:

- Node.js 20+
- npm
- Supabase account

---

### 2. Clone the Repository

```bash
git clone https://github.com/Abdul-012/Team-Task-Manager.git
cd Team-Task-Manager
```

---

### 3. Install Dependencies

```bash
npm install
```

---

### 4. Create Supabase Database Tables

1. Open your Supabase dashboard.
2. Create a new project.
3. Go to **SQL Editor**.
4. Open the file:

```text
backend/config/schema.sql
```

5. Copy the full SQL code.
6. Paste it into Supabase SQL Editor.
7. Click **Run**.

This will create the required database tables, relationships, constraints, indexes, and triggers.

---

### 5. Environment Variables

Create a `.env` file in the root folder.

You can copy `.env.example`:

```bash
cp .env.example .env
```

Add your real values:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-role-key
JWT_SECRET=replace-with-a-long-random-secret
PORT=3000
NODE_ENV=development
APP_URL=http://localhost:3000
```

Optional GitHub OAuth variables:

```env
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

For local GitHub OAuth, use this callback URL in your GitHub OAuth app:

```text
http://localhost:3000/api/auth/github/callback
```

---

### 6. Run the Project Locally

```bash
npm run dev
```

Open in browser:

```text
http://localhost:3000
```

---

### 7. Check Syntax

```bash
npm run check
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/signup` | Create a new account |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/config` | Get authentication feature flags |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current logged-in user |
| GET | `/api/auth/github` | Start GitHub OAuth login |
| GET | `/api/auth/github/callback` | GitHub OAuth callback |

---

### Dashboard

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/dashboard` | Get dashboard stats and assigned tasks |

---

### Projects

| Method | Endpoint | Access |
| --- | --- | --- |
| GET | `/api/projects` | Authenticated user |
| POST | `/api/projects` | Authenticated user |
| GET | `/api/projects/:id` | Project member |
| DELETE | `/api/projects/:id` | Project admin |
| POST | `/api/projects/:id/members` | Project admin |
| DELETE | `/api/projects/:id/members/:memberId` | Project admin |

---

### Tasks

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/api/projects/:projectId/tasks` | Project admin |
| GET | `/api/projects/:projectId/members` | Project member |
| GET | `/api/tasks/:id` | Project member |
| PUT | `/api/tasks/:id` | Project admin |
| PATCH | `/api/tasks/:id/status` | Project admin or assigned user |
| DELETE | `/api/tasks/:id` | Project admin |

---

## Railway Deployment

This project is deployed on Railway.

### Required Railway Variables

Add these variables in Railway:

| Variable | Value |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `JWT_SECRET` | Long random secret |
| `NODE_ENV` | `production` |
| `APP_URL` | `https://team-task-manager-production-8bf2.up.railway.app` |

Optional GitHub OAuth variables:

| Variable | Value |
| --- | --- |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret |

---

### Railway Start Command

Railway will automatically run:

```bash
npm start
```

The start script is already defined in `package.json`:

```json
"start": "node server.js"
```

---

### Health Check

Test the deployed backend using:

```text
https://team-task-manager-production-8bf2.up.railway.app/healthz
```

Expected response:

```json
{
  "status": "ok"
}
```

---

## Security Notes

- Do not upload `.env` to GitHub.
- Keep `SUPABASE_SERVICE_KEY` private.
- Keep `JWT_SECRET` private.
- Use `.env.example` only for sample environment variable names.
- In production, Railway environment variables should be used instead of a local `.env` file.

---

## Assessment Submission Checklist

- Live Application URL: https://team-task-manager-production-8bf2.up.railway.app
- GitHub Repository Link: https://github.com/Abdul-012/Team-Task-Manager
- README file completed
- Supabase database schema created
- Railway deployment active
- Demo video recorded

---

## Demo Video Checklist

Show these points in the demo video:

1. Open the live Railway application.
2. Signup with a new user.
3. Login successfully.
4. Create a new project.
5. Add a team member.
6. Create a task and assign it.
7. Update task status.
8. Show dashboard statistics.
9. Show role-based access control.
10. Show that a Member cannot delete a project or manage members.

---

## Author

**Abdul-012**

GitHub: https://github.com/Abdul-012