# 🎨 Imagify — AI Text-to-Image SaaS Platform

<p align="center">
  <img src="https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-5-purple?style=for-the-badge&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-4-lightgrey?style=for-the-badge&logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-darkgreen?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Razorpay-Payment-0C2340?style=for-the-badge&logo=razorpay" alt="Razorpay" />
</p>

---

## 🚀 Overview

**Imagify** is a full-stack AI SaaS application that transforms text prompts into high-quality visual art. Built on the **MERN** stack, it features a complete credit-based economy, secure user authentication with JWT, seamless **Razorpay** payment gateway integration for purchasing credits, and real-time AI image synthesis powered by the **ClipDrop API**.

---

## ✨ Key Features

- 🧠 **AI Image Generation**: Convert descriptive text prompts into high-resolution images in seconds using the ClipDrop AI API.
- 💳 **Credit-Based Economy**: Integrated credit wallet where users consume credits for each generated image and can buy more credits.
- 💰 **Razorpay Payment Gateway**: Seamless credit package purchasing with HMAC-SHA256 server-side signature verification.
- 🔐 **Secure Authentication**: User registration and login protected with bcrypt password hashing and JSON Web Tokens (JWT).
- 🎨 **Modern & Responsive UI**: Sleek, glassmorphism-inspired design crafted with Tailwind CSS and smooth micro-animations powered by Motion.
- 📁 **Download & Save**: Download generated artwork directly to your device with a single click.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Animations**: Motion (Framer Motion)
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **Notifications**: React Toastify

### **Backend**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (`jsonwebtoken`) & `bcrypt`
- **Payment Processing**: Razorpay Node SDK & crypto verification
- **AI Integration**: ClipDrop Text-to-Image API (`form-data`, `axios`)

---

## 📁 Project Structure

```bash
Imagify/
├── client/                     # Frontend React + Vite application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── assets/             # Images, icons, and static presets
│   │   ├── components/         # Reusable UI components (Navbar, Header, Login, etc.)
│   │   ├── context/            # AppContext state management
│   │   ├── pages/              # Application views (Home, Result, BuyCredit)
│   │   ├── App.jsx             # Main router and layout
│   │   ├── index.css           # Global stylesheet & Tailwind directives
│   │   └── main.jsx            # Entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Backend Express REST API
│   ├── config/                 # MongoDB database connection
│   ├── controllers/            # Request handlers (auth, image, payment)
│   ├── middlewares/            # Auth and token validation middlewares
│   ├── models/                 # Mongoose schemas (User, Transaction)
│   ├── routes/                 # Express API routes (userRoutes, imageRoutes)
│   ├── package.json
│   └── server.js               # Express application entry point
│
├── .gitignore
└── README.md
```

---

## ⚙️ Environment Variables Setup

### **1. Server (`server/.env`)**
Create a `.env` file in the `server/` directory:

```env
# Server Port
PORT=4000

# MongoDB Database Connection String
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/imagify?appName=Cluster0"

# JWT Secret Key for Authentication
JWT_SECRET="your_super_secret_jwt_key"

# Razorpay Payment Gateway Credentials
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
CURRENCY="INR"

# ClipDrop AI API Key
CLIPDROP_API="your_clipdrop_api_key"
```

### **2. Client (`client/.env`)**
Create a `.env` file in the `client/` directory:

```env
# Backend API Base URL
VITE_BACKEND_URL="http://localhost:4000"

# Razorpay Public Key ID
VITE_RAZORPAY_KEY_ID="your_razorpay_key_id"
```

---

## 🚦 Getting Started Locally

### **Prerequisites**
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB Atlas](https://cloud.mongodb.com/) account or local MongoDB instance
- [ClipDrop API Key](https://clipdrop.co/apis)
- [Razorpay Account](https://razorpay.com/) (Test Mode)

---

### **Installation Steps**

#### **1. Clone the repository**
```bash
git clone https://github.com/Pranay-k1408/Imagify.git
cd Imagify
```

#### **2. Set up the Backend Server**
```bash
cd server
npm install
npm start
```
*The backend will run at `http://localhost:4000`.*

#### **3. Set up the Frontend Client**
Open a new terminal window:
```bash
cd client
npm install
npm run dev
```
*The frontend will run at `http://localhost:8000`.*

---

## 📡 API Endpoints

### **User & Auth Routes (`/api/user`)**
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/user/register` | Register a new user | No |
| `POST` | `/api/user/login` | Login user & return JWT token | No |
| `GET` | `/api/user/credits` | Fetch logged-in user's credit balance | Yes (JWT) |
| `POST` | `/api/user/pay-razor` | Create a Razorpay payment order | Yes (JWT) |
| `POST` | `/api/user/verify-razor` | Verify payment signature & credit account | Yes (JWT) |

### **Image Routes (`/api/image`)**
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/image/generate-image` | Generate AI image from text prompt | Yes (JWT) |

---

## 🛡️ License

This project is open-source and available under the [ISC License](LICENSE).

---

## 👨‍💻 Author

- **Pranay** — [@Pranay-k1408](https://github.com/Pranay-k1408)
