# 🚀 TaskFlow - Full-Stack Task Management SaaS

[![Frontend Framework](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Backend Framework](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

TaskFlow is a production-grade, full-stack Task Management SaaS application. It provides an intuitive, real-time Kanban board experience designed for modern teams, complete with authentication, real-time socket connections, and deep analytics.

---

## ✨ Features

- **🔐 Secure Authentication:** JWT-based authentication using HTTP-only cookies and bcrypt for password hashing. Role-based access control enabled.
- **📋 Advanced Task Management:** Drag & Drop Kanban board using `@dnd-kit`. Create, read, update, and delete tasks seamlessly.
- **⚡ Real-Time Updates:** Powered by `Socket.IO`, any changes made to tasks (creation, moving, deletion) are instantly reflected across all connected clients.
- **📊 Interactive Dashboard:** Visual representation of task progress using `Recharts`.
- **🎨 Premium UI/UX:** Built with Tailwind CSS v4, featuring a fully responsive design, custom color tokens, and Dark/Light mode capabilities.
- **👥 Team Collaboration:** (Foundation built) Workspace grouping, assigning users to tasks, and commenting systems.

---

## 🏗️ Architecture & Tech Stack

The project is structured as a monorepo containing two entirely independent modules: the `client` (Frontend) and the `server` (Backend).

### 🖥️ Frontend (`/client`)
- **Core:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS v4, PostCSS, Lucide React (Icons)
- **State Management:** Zustand
- **Routing:** React Router v6
- **Data Fetching:** Axios
- **Drag & Drop:** `@dnd-kit/core`, `@dnd-kit/sortable`
- **Charts/Analytics:** Recharts
- **Real-Time:** `socket.io-client`

### ⚙️ Backend (`/server`)
- **Core:** Node.js, Express, TypeScript
- **Database:** MongoDB (via Mongoose)
- **Authentication:** `jsonwebtoken`, `bcrypt`, `passport`
- **Security:** `helmet`, `cors`, `express-rate-limit`, `cookie-parser`
- **Real-Time:** `socket.io`
- **Data Validation:** `zod`

---

## 🚀 Getting Started (Local Development)

### 📋 Prerequisites
Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account and a database cluster connection string.
- Git

### 1️⃣ Installation

You only need to install the dependencies once. I have created a root-level shortcut for you. Open your terminal in the main `TASK MANAGER` folder and run:

```bash
npm run install:all
```
*(This will automatically install dependencies for both the backend and frontend at once).*

### 2️⃣ Environment Variables

**Backend (`server`):**
Create a `.env` file in the root of the `server` directory and add the following:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/taskmanager?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**Frontend (`client`):**
Create a `.env` file in the root of the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3️⃣ Start the App (One Command)

To run **both** the frontend and backend simultaneously, just run this from the main `TASK MANAGER` folder:

```bash
npm run dev
```

*This will start the API on `http://localhost:5000` and the web app on `http://localhost:5173` automatically!*

---

## 🌍 Live Deployment Guide

The application is heavily optimized for zero-config deployments. The frontend is meant to be hosted on **Vercel** and the backend on **Render**.

### ⚙️ Backend Deployment (Render)

1. Push your entire project to a GitHub repository.
2. Go to your [Render Dashboard](https://dashboard.render.com/) and click **New+** -> **Web Service**.
3. Connect your GitHub repository.
4. Render will automatically detect the `render.yaml` file located in the `server` directory and configure the environment for you. 
   - *If it doesn't:* Set the Root Directory to `server`, Build Command to `npm run build`, and Start Command to `npm start`.
5. Navigate to the **Environment** tab on Render and add your production variables:
   - `MONGODB_URI`: Your production database URL.
   - `JWT_SECRET`: A secure random string.
   - `CLIENT_URL`: The URL of your Vercel frontend (e.g., `https://my-taskflow.vercel.app`).
   - `NODE_ENV`: `production`
6. Click **Deploy**.

### 🌐 Frontend Deployment (Vercel)

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New** -> **Project**.
2. Import the GitHub repository.
3. In the project configuration, edit the **Root Directory** and select `client`.
4. Open the **Environment Variables** section and add:
   - `VITE_API_URL`: Your deployed Render backend URL (e.g., `https://task-manager-api.onrender.com/api`).
5. Click **Deploy**.
*(Note: A `vercel.json` file is already included to properly handle React SPA client-side routing).*

---

## 🔌 Socket.IO Events

The application utilizes the following WebSocket events for real-time reactivity:
- `join_workspace`: Fired when a user enters a workspace to subscribe to specific rooms.
- `task_created`: Broadcasts newly created tasks.
- `task_updated`: Broadcasts edits to existing tasks.
- `task_deleted`: Removes tasks from the board for all users.
- `task_moved`: Broadcasts Kanban drag-and-drop state changes instantly.

---

## 🛠️ Troubleshooting & Common Issues

- **CORS Errors:** If you face CORS issues during local development, ensure that your backend `.env` file has `CLIENT_URL=http://localhost:5173` and your frontend `.env` has `VITE_API_URL=http://localhost:5000/api`.
- **Tailwind Compilation Errors:** This project uses the newer Tailwind CSS v4 alongside PostCSS. Do not use legacy `@tailwind base;` directives; instead, the `client/src/index.css` correctly uses `@import "tailwindcss";`.
- **Database Connection Failure:** Double-check your MongoDB Atlas Network Access. Ensure your current IP address (or `0.0.0.0/0` for everywhere) is whitelisted.
