# FitNova Pro - Enterprise Fitness & Nutrition Management

FitNova Pro is a comprehensive, full-stack health and fitness tracking ecosystem designed for performance-driven users. It features an intelligent dashboard, advanced workout analytics, precise nutrition tracking, and a social connection hub.

## 🚀 Key Features

- **Intelligent Dashboard**: Real-time visualization of weekly streaks, calories burned, and active goals.
- **Advanced Workout Tracking**: Multi-parameter activity logging with intensity metrics and history.
- **Precision Nutrition**: Intelligent meal logging with automated macro calculations and daily targets.
- **Goal Management**: Dynamic, type-aware goal setting (Weight Loss, Muscle Gain, Performance) with real-time progress visualization.
- **Social Ecosystem**: Connect with other athletes, share progress through the Activity Feed, and manage connection requests.
- **Enterprise UI**: Fully responsive, mobile-first design system with professional-grade glassmorphism effects.

## 🛠 Tech Stack

- **Frontend**: Angular 18 (Standalone Components, RxJS, SCSS)
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB (Mongoose)
- **Security**: JWT Authentication, Zod Validation, CORS Protection
- **DevOps**: Professional Build System, Environment-based Configurations

## 📁 Project Structure

```text
fit-nova/
├── frontend/          # Angular Application
│   ├── src/app/core/  # Singleton services & configurations
│   ├── src/app/shared/# Reusable UI components & services
│   └── src/app/features/# Domain-driven feature modules
└── backend/           # Node.js API
    ├── src/models/    # Mongoose data models
    ├── src/routes/    # API endpoints
    └── src/services/  # Business logic layer
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/fit-nova.git
   cd fit-nova
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env based on .env.example
   npm run build
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm start
   ```

## 🧹 Project Maintenance

To keep the project clean, the following directories are ignored by Git:
- `node_modules/` (Dependencies)
- `dist/` and `.angular/` (Build artifacts)
- `.env` files (Secrets)
- `logs/` (Application logs)

## ⚖️ License

This project is licensed under the MIT License.
