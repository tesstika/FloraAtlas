# 🌱 FloraAtlas — "Grow a Plant" (Вырасти растение)

> **Educational Interactive Web Platform for Studying Plant Life Cycles**

FloraAtlas (Вырасти растение) is a web-based educational platform designed for step-by-step observation of plant development. Users can select plants, observe their growth stages, study theoretical materials, react to environmental events, and complete interactive mini-games that directly influence plant health and unlock growth bonuses.

---

## 🚀 Key Features

* 🌿 **Interactive Plant Catalog & Geographic Map**: Explore plants (Spruce/Ель, Baobab, Sequoia, Coffee) with regional markers on an interactive vector map with pan and zoom capabilities.
* 📈 **Step-by-Step Growth Observation**: Observe growth across 6 visual stages with animated health bars (0-100%) and virtual vs. real time mode options.
* 🎮 **Interactive Educational Mini-Games Suite**:
  * **Quiz Test**: Multiple-choice testing on growth conditions and eco-habits.
  * **Matching Game**: Connecting overwatering/care symptoms with corrective actions.
  * **Classification / Grouping**: Categorizing pests vs. protective biological measures.
  * **Crossword Grid**: Interactive botany terminology puzzle.
  * **Care Table Matching**: Symptom, cause, and fungicide treatment matching.
* 🧪 **Health & Fertilizer Mechanics**: Unsuccessful mini-game attempts reduce plant health (-10 HP), while correct answers award fertilizers (+1 bonus) to restore health (+15 HP).
* 👩‍🏫 **Teacher Cabinet**:
  * **Student Process Editor**: Filter by student group (e.g. `БИО-101`), inspect progress, override plant health, and unlock specific growth stages.
  * **Plant Content Editor**: Manage plant cards, descriptions, region tags, and stage counts.

---

## 🛠️ Technology Stack

### Backend
* **Runtime**: Node.js (`26.5.1` / `20+ LTS`)
* **Framework**: Express (`5.2.1`)
* **Database**: SQLite via `better-sqlite3` (`13.0.2`) initialized in WAL mode
* **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs` password hashing
* **Development**: `nodemon` (`3.1.14`)

### Frontend
* **Framework**: Vue 3 (`3.5.40`) using `<script setup lang="ts">` Composition API
* **State Management**: Pinia (`4.0.2`)
* **Routing**: Vue Router (`5.2.0` / `4.x`) with navigation guards
* **Tooling & DevTools**: Vite (`8.1.5`), `vite-plugin-vue-devtools` (`8.2.1`), TypeScript (`7.0.2`)
* **HTTP Client**: Axios (`1.19.0`)
* **Map & Zoom Utilities**: `@panzoom/panzoom` (`4.6.2`)

---

## 📁 Project Structure

```
FloraAtlas/
├── backend/
│   ├── data/                    # Local SQLite database (flora_atlas.db)
│   ├── src/
│   │   ├── config/              # SQLite database engine (WAL PRAGMAs)
│   │   ├── controllers/         # Auth, Plant, Observation & Teacher controllers
│   │   ├── middleware/          # JWT Auth & Role guards, Global error handler
│   │   ├── models/              # Initial database schema & seed data
│   │   ├── routes/              # Express API route modules
│   │   └── app.js               # Express app configuration & middleware
│   ├── .env                     # Environment variables
│   ├── package.json
│   └── server.js                # Backend entry point (Port 3000)
├── frontend/
│   ├── src/
│   │   ├── assets/              # Global styling & CSS design system
│   │   ├── components/          # Vue components (Layout, Catalog, Watch, Games, Teacher)
│   │   ├── router/              # Vue Router navigation definitions & guards
│   │   ├── services/            # Axios API service instance
│   │   ├── stores/              # Pinia state stores (auth, plants, observation, teacher)
│   │   └── views/               # Views (Home, Auth, Catalog, Detail, MyPlants, Watch, Teacher)
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts           # Vite configuration & proxy settings
├── Task/                        # Project specifications & mockup resources
├── package.json                 # Workspace root package.json (concurrently script)
└── README.md
```

---

## ⚙️ Getting Started / Quick Start Guide

### Prerequisites
* **Node.js**: `v20.0.0` or higher (`v26.5.1` recommended)
* **npm**: `v10.0.0` or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/flora-atlas.git
   cd flora-atlas
   ```

2. **Install root dependencies**:
   ```bash
   npm install
   ```

3. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   cd ..
   ```

### Running the Application

Start both the Backend API server and Frontend Vite development server simultaneously with a single command from the project root:

```bash
npm run dev
```

* **Frontend**: [http://localhost:5173](http://localhost:5173)
* **Backend API**: [http://localhost:3000](http://localhost:3000)

---

## 🔑 Pre-Seeded Test Credentials

* **Student Account**:
  * **Email**: `student@example.ru`
  * **Password**: `123456`
  * **Group**: `БИО-101`
* **Teacher Account**:
  * **Email**: `teacher@example.ru`
  * **Password**: `123456`
  * **Role**: `Teacher`

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
