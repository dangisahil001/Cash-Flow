# Loan Manager - Setup & Installation Guide

## Prerequisites

Before installation, ensure you have:
- **Node.js** v18 or higher
- **npm** or **yarn** package manager
- **MongoDB** (local or cloud: MongoDB Atlas)
- **Git** for cloning the repository
- **VS Code** or any code editor (optional)

## Installation Steps

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd loan-manager
```

### Step 2: Install Root Dependencies

```bash
npm install
```

This will install shared workspace dependencies.

### Step 3: Install Backend Dependencies

```bash
npm install --workspace=backend
```

Or navigate to backend and install:
```bash
cd backend
npm install
```

### Step 4: Install Frontend Dependencies

```bash
npm install --workspace=frontend
```

Or navigate to frontend and install:
```bash
cd frontend
npm install
```

### Step 5: Setup Environment Variables

#### Backend Setup

Create `.env` file in the `backend` folder:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```
MONGODB_URI=mongodb://localhost:27017/loan-manager
JWT_SECRET=your_very_secret_key_min_32_characters_long
JWT_EXPIRATION=7d
PORT=3000
NODE_ENV=development
```

#### Password Reset Emails

Forgot-password emails require an SMTP sender. Add these values to `backend/.env`:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_gmail_app_password
NOTIFICATION_EMAIL_FROM=your_email@gmail.com
FRONTEND_URL=http://localhost:5173
```

For Gmail, enable 2-Step Verification, then create an App Password in your Google Account. Use that 16-character App Password as `SMTP_PASS`; do not use your normal Gmail password. Restart the backend after editing `.env`.

**For MongoDB Atl (Cloud):**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/loan-manager?retryWrites=true&w=majority
```

#### Frontend Setup

Create `.env` file in the `frontend` folder:

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```
VITE_API_URL=http://localhost:3000/api
```

### Step 6: Setup MongoDB

#### Option A: Local MongoDB

**Windows:**
1. Download MongoDB from https://www.mongodb.com/try/download/community
2. Run the installer
3. MongoDB runs as a service on `localhost:27017`

**macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

#### Option B: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster
4. Get connection string
5. Add to `.env` file

### Step 7: Run Database Migrations (if any)

```bash
cd backend
npm run build
```

---

## Running the Application

### Development Mode (Recommended)

Run both backend and frontend simultaneously:

```bash
# From root directory
npm run dev
```

This will:
- Start backend on `http://localhost:3000`
- Start frontend on `http://localhost:5173`

Or run them separately:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Production Build

Build for production:
```bash
npm run build
```

Generates:
- Backend: `backend/dist/`
- Frontend: `frontend/dist/`

### Run Production Build

```bash
# Backend
cd backend
npm run start

# Frontend (requires static server)
npx serve frontend/dist
```

---

## Testing

```bash
# Test all workspaces
npm run test

# Test backend only
npm run test --workspace=backend

# Test frontend only
npm run test --workspace=frontend
```

---

## Linting & Formatting

```bash
# Lint all workspaces
npm run lint

# Format code
npm run format --workspace=backend
npm run format --workspace=frontend
```

---

## Troubleshooting

### PORT 3000 already in use

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

### MongoDB Connection Error

1. Check if MongoDB is running:
```bash
# Windows
Get-Service MongoDB

# macOS
brew services list

# Linux
sudo systemctl status mongodb
```

2. Verify connection string in `.env`

3. Test connection:
```bash
mongosh "mongodb://localhost:27017"
```

### Port 5173 (frontend) already in use

```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5173
kill -9 <PID>
```

### CORS Errors

Ensure backend URL in `frontend/.env` matches:
```
VITE_API_URL=http://localhost:3000/api
```

### Module not found errors

Reinstall dependencies:
```bash
npm install
npm install --workspace=backend
npm install --workspace=frontend
```

---

## Docker Setup (Optional)

### Docker Compose

Create `docker-compose.yml` in root:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: loan-manager-db
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: password

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: loan-manager-backend
    ports:
      - "3000:3000"
    depends_on:
      - mongodb
    environment:
      MONGODB_URI: mongodb://root:password@mongodb:27017/loan-manager

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: loan-manager-frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

Run with Docker:
```bash
docker-compose up
```

---

## VS Code Extensions (Recommended)

- **MongoDB for VS Code** - MongoDB management
- **Thunder Client** or **REST Client** - API testing
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Node.js Extension Pack** - Development support

---

## First Steps After Setup

1. **Access the application**
   - Frontend: http://localhost:5173
   - API: http://localhost:3000/api

2. **Create admin account**
   - Go to Register page
   - Fill in lender details
   - Set password

3. **Login**
   - Use registered credentials
   - Access dashboard

4. **Add first customer**
   - Navigate to Customers
   - Click "Add New Customer"
   - Fill in details

5. **Create first loan**
   - Go to Loans page
   - Select customer
   - Enter loan details
   - EMI schedule auto-generates

6. **Record payment**
   - Go to Transactions
   - Record payment
   - Check dashboard update

---

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Chart.js Documentation](https://www.chartjs.org)

---

## Support

For issues:
1. Check troubleshooting section
2. Review error logs
3. Create GitHub issue with:
   - Error message
   - Steps to reproduce
   - Environment details

Happy coding! 🚀
