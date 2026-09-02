# Job Tracker

Job Tracker is a comprehensive, AI-powered application designed to streamline the job search process. It empowers users to organize their job applications, track status changes, and leverage AI to prepare for interviews and automate professional communications.

## 🚀 Key Features

*   **Application Management & Pipeline Tracking**: Easily track applications across various stages (Applied, Interviewing, Offered, Rejected) and view key details like salaries, notes, and dates.
*   **AI Career Assistant**: Powered by **Groq**, the AI assistant can analyze a pasted or uploaded Resume (PDF/TXT) and Job Description to generate tailored interview preparation materials (likely questions, focus topics, strengths to highlight).
*  - **Nodemailer & SMTP**: Used for automated onboarding emails, stale application reminders, and weekly analytics reports.
*   **Dashboard & Analytics**: Visualize application progress, success rates, and pipeline health using dynamic charts built with **Recharts**.
*   **Secure Authentication**: robust user registration and login system utilizing **JWT** and bcrypt for secure access.

## 🛠️ Tech Stack

### Frontend (Client)
*   **Framework**: [React](https://react.dev/) 19 (via [Vite](https://vitejs.dev/))
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & custom CSS
*   **Routing**: [React Router](https://reactrouter.com/)
*   **Data Visualization**: [Recharts](https://recharts.org/)
*   **HTTP Client**: [Axios](https://axios-http.com/)
*   **PDF Generation**: [jsPDF](https://artskydj.github.io/jsPDF/docs/jsPDF.html) (for exporting interview prep guides)

### Backend (Server)
*   **Runtime/Framework**: [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
*   **Database**: [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/)
*   **AI Integration**: [Groq SDK](https://console.groq.com/docs/quickstart)
*   **Email & Google Integrations**: [googleapis](https://github.com/googleapis/google-api-nodejs-client) (Gmail API), [Nodemailer](https://nodemailer.com/)
*   **Task Scheduling**: [node-cron](https://github.com/node-cron/node-cron)
*   **File Parsing**: [Multer](https://github.com/expressjs/multer) (Uploads) & [pdf-parse](https://gitlab.com/autokent/pdf-parse) (Document extraction)
*   **Security & Auth**: JSON Web Tokens (JWT), bcryptjs, CORS

## 🏗️ Project Structure

The project is structured as a monorepo containing both the client and server:

```text
Job Tracker/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── api/            # Axios instance and API config
│   │   ├── components/     # Reusable React components (Forms, Modals, Pipeline)
│   │   ├── context/        # React context (Auth)
│   │   ├── pages/          # Full page views (Dashboard, ApplicationDetail)
│   │   └── utils/          # Helper functions (Dashboard stats, PDF utils)
│   └── package.json
└── server/                 # Backend Node/Express Application
    ├── src/
    │   ├── constants/      # App-wide constants (e.g. stale threshold)
    │   ├── controllers/    # Route controllers (auth, applications, google, cron)
    │   ├── middlewares/    # Custom middleware (authguard)
    │   ├── models/         # Mongoose schemas (User, Application)
    │   ├── routes/         # Express route definitions
    │   └── services/       # Business logic (AI Assistant, Email, File parser)
    ├── server.js           # Entry point
    └── package.json
```

## ⚙️ Getting Started

### Prerequisites
*   Node.js (v18+)
*   MongoDB Instance (Local or Atlas)
*   Nodemailer (for emails)
*   Groq API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Tanishkaa23/JobTracker.git
   cd "Job Tracker"
   ```

2. **Setup the Server:**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory containing:
   ```env
   PORT=...
   MONGODB_URI=...
   JWT_SECRET=...
   GROQ_API_KEY=...
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   REFRESH_TOKEN=...
   EMAIL_USER=...
   ```
   Run the server:
   ```bash
   npm run dev
   ```

3. **Setup the Client:**
   Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   npm install
   ```
   Create a `.env` file in the `client` directory (if required) for your API URL:
   ```env
   VITE_API_BASE_URL=http://localhost:<SERVER_PORT>/api
   ```
   Run the client:
   ```bash
   npm run dev
   ```
