# 🚀 ShopEZ — Stock Trading Platform

Developed and Maintained by **Guduguntla Manikanta**.

A full-stack MERN application for virtual stock trading with real-time market simulation.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite (port 3000) |
| Backend | Node.js + Express (port 5001) |
| Database | MongoDB |
| Auth | JWT |
| Charts | Chart.js + react-chartjs-2 |

---

## 📋 Prerequisites

Make sure you have these installed:

- **Node.js v18+** → [nodejs.org](https://nodejs.org)
- **MongoDB** (already installed at `/Users/manikanta/mongodb-macos-aarch64--8.2.4/`)
- **npm** (comes with Node.js)

---

## ▶️ How to Run (Every Time)

### Step 1 — Start MongoDB

Open a terminal and run this **first, before anything else**:

```bash
/Users/manikanta/mongodb-macos-aarch64--8.2.4/bin/mongod \
  --dbpath /Users/manikanta/Coding/Projects/TradeSphere/.mongo/data \
  --logpath /Users/manikanta/Coding/Projects/TradeSphere/.mongo/mongod.log &
```

Wait 3–5 seconds for it to start.

### Step 2 — Start the App

Open a **second terminal**, go to the project folder, and run:

```bash
cd /Users/manikanta/Coding/Projects/TradeSphere
npm run dev
```

This starts **both** the backend and frontend at the same time.

### Step 3 — Open in Browser

```
http://localhost:3000
```

---

## 🔐 Login Credentials

| Role | Email | Password |
|---|---|---|
| 👤 Regular User | `manikanta@tradesphere.com` | `Manikanta123` |
| 🛡️ Admin | `admin@tradesphere.com` | `Admin@123` |

---

## ⏹️ How to Stop

Press `Ctrl + C` in the terminal running `npm run dev`.

To stop MongoDB:

```bash
# Find the MongoDB process
lsof -i :27017

# Kill it (replace XXXX with the PID from above)
kill XXXX
```

---

## 🌱 First-Time Setup (only needed once)

If you're setting up on a fresh machine:

```bash
# 1. Go to the project
cd /Users/manikanta/Coding/Projects/TradeSphere

# 2. Install all dependencies
npm run install-all

# 3. Start MongoDB (see Step 1 above)

# 4. Seed the database (only needed once!)
npm run seed

# 5. Start the app
npm run dev
```

---

## 📁 Project Structure

```
TradeSphere/
├── client/              ← React frontend (Vite)
│   └── src/
│       ├── pages/       ← All pages (Home, Market, Portfolio, etc.)
│       ├── components/  ← Reusable UI components
│       ├── context/     ← Auth state (AuthContext)
│       └── api/         ← Axios HTTP client
│
├── server/              ← Express backend
│   ├── models/          ← MongoDB schemas
│   ├── controllers/     ← Business logic
│   ├── routes/          ← API routes
│   ├── middleware/       ← Auth, error handling
│   ├── seeds/           ← Database seeder (50 stocks)
│   └── .env             ← Environment variables
│
└── package.json         ← Root scripts (npm run dev)
```

---

## 🌐 API Endpoints (Port 5001)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| GET | `/api/stocks` | Get all stocks |
| GET | `/api/stocks/:id` | Get single stock |
| POST | `/api/trade/buy` | Buy stock |
| POST | `/api/trade/sell` | Sell stock |
| GET | `/api/portfolio` | Get your portfolio |
| GET | `/api/trade/history` | Transaction history |
| GET | `/api/admin/dashboard` | Admin stats (admin only) |

---

## 🔧 Environment Variables

Located at `server/.env`:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/shopez
JWT_SECRET=shopez_jwt_secret_key_2024_ultra_secure
NODE_ENV=development
```

---

## ❓ Troubleshooting

### "MongoDB not connecting"
→ Make sure you ran the MongoDB start command (Step 1) before `npm run dev`

### "Port already in use"
```bash
# Kill whatever is on port 5001
lsof -ti:5001 | xargs kill -9

# Kill whatever is on port 3000
lsof -ti:3000 | xargs kill -9
```

### "Login not working" / Blank page after login
→ Open browser in **Incognito/Private mode**, or clear LocalStorage:
- Open DevTools (F12) → Application → Local Storage → Delete all entries

### "Can't find module" error
```bash
cd /Users/manikanta/Coding/Projects/TradeSphere
npm run install-all
```

### Re-seed the database (reset all data)
```bash
npm run seed
```

---

## 📝 npm Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start both backend + frontend |
| `npm run server` | Start backend only |
| `npm run client` | Start frontend only |
| `npm run seed` | Seed the database (50 stocks + 2 users) |
| `npm run install-all` | Install all dependencies |
