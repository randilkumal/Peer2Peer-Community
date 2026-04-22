# Peer2Peer Student Collaboration Platform

A modern, full-stack peer-to-peer collaboration platform designed to connect students, expert students, and lecturers. This platform facilitates study group management, resource sharing, and academic collaboration with AI-enhanced features.

---

## 🚀 Features

- **Multi-Role Authentication**: Secure login and registration for Students, Expert Students, and Lecturers.
- **Dynamic Study Groups**: Create, join, and manage academic groups with real-time updates.
- **Resource Hub**: Upload and share learning materials (PDFs, docs) with automated parsing capabilities.
- **AI-Powered Assistance**: Integrated AI (Gemini/Groq) to help students with academic queries and resource summarization.
- **Interactive Dashboard**: Personalized views for different user roles to track progress and activities.
- **Email Notifications**: Automated email alerts for account updates and group activities.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State/Routing**: React Router DOM, Axios
- **UI Components**: Modern, responsive design with glassmorphic elements.

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JSON Web Tokens (JWT) & BcryptJS
- **File Handling**: Multer (Uploads) & PDF-Parse
- **AI Integration**: Google Generative AI (Gemini) & Groq SDK

---

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (Local instance or Atlas Cluster)
- **NPM** or **Yarn**

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/Peer2Peer-Community.git
cd Peer2Peer-Community
```

### 2. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Create a `.env` file in the `backend` directory.
   - Copy content from `.env.example` and fill in your credentials:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   PORT=5000
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   GROQ_API_KEY=your_groq_api_key
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📂 Project Structure

```text
Peer2Peer-Community/
├── backend/
│   ├── config/         # Database and app configurations
│   ├── controllers/    # Business logic for routes
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API endpoints
│   ├── middleware/     # Auth and error handling
│   └── server.js       # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI elements
│   │   ├── pages/      # View components
│   │   ├── assets/     # Images and global styles
│   │   └── App.jsx     # Main application logic
│   └── tailwind.config.js
└── README.md
```

---

## 🛡️ License

This project is licensed under the **MIT License**.

---

## 🤝 Contributing

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.
