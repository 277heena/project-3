# ArchConnect — Project 3

Full-stack architecture portfolio, account, and inquiry SPA created for Heena Patel's WEB 602 Project 3.

## Requirements covered

- React single-page app with React Router
- Express API, MongoDB, and Mongoose
- SASS responsive styling
- Signup, login, logout, authentication, authorization, sessions, and HTTP-only cookies
- Validated inquiry and project forms
- Add, view, filter, and delete project data
- PWA manifest and service worker
- GitHub-ready; production build is served by Express
- SSL is supplied by the HTTPS deployment host

## Run locally

1. Install Node.js 20 or newer and create a free MongoDB Atlas database.
2. In VS Code, open the `archconnect` folder.
3. In the terminal, run `npm install`.
4. Copy `.env.example` to `.env` and enter the MongoDB connection string and a long random session secret.
5. Run `npm run dev`.
6. Open `http://localhost:5173`.

## Deploy on Render

1. Push this folder to a public GitHub repository.
2. On Render, create a **Web Service** from the repository.
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables: `MONGODB_URI`, `SESSION_SECRET`, `NODE_ENV=production`, and `CLIENT_URL=https://YOUR-RENDER-URL.onrender.com`.
6. Deploy. Render supplies the required HTTPS/SSL URL.

## Submission

Submit both the GitHub repository URL and the live Render URL in Module 6 Week 8 Day 3 Project 3.
