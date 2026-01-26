# Church Management System

A comprehensive web application for managing church operations, including financial tracking, member management, and reporting.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.11+-green.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)

## 🌟 Features

### Financial Management
- **Income Tracking**: Record tithes, offerings, donations with donor attribution
- **Expense Management**: Track all church expenditures by category
- **Financial Reports**: Income statements, monthly comparisons, budget analysis
- **Export Capabilities**: Download reports as CSV for external analysis

### Member Management
- **Member Directory**: Complete database of church members
- **Contact Information**: Phone, email, address tracking
- **Membership Status**: Active, inactive, visitor tracking
- **Donor History**: Track giving patterns per member

### User Management
- **Role-Based Access**: Super Admin, Admin, Finance, Leader, Member roles
- **Secure Authentication**: JWT-based auth with refresh tokens
- **Multi-Church Support**: Architecture supports multiple congregations

## 🏗️ Architecture

```
Church-financial-reporting/
├── backend/                 # FastAPI Python backend
│   ├── app/
│   │   ├── api/routes/     # API endpoints
│   │   ├── core/           # Config, security, database
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # Business logic
│   └── requirements.txt
├── frontend/               # React TypeScript frontend
│   ├── src/
│   │   ├── layouts/        # Page layouts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── stores/         # Zustand state management
│   │   └── types/          # TypeScript types
│   └── package.json
├── docker-compose.yml      # Production Docker setup
└── docker-compose.dev.yml  # Development Docker setup
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (or use SQLite for development)

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/Church-financial-reporting.git
cd Church-financial-reporting

# Copy environment file
cp .env.example .env
# Edit .env with your values

# Start with Docker
docker-compose up -d

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="sqlite:///./church.db"  # or PostgreSQL URL
export SECRET_KEY="your-secret-key"

# Run the server
uvicorn app.main:app --reload
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📚 API Documentation

Once the backend is running, access:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User authentication |
| `/api/auth/register` | POST | User registration |
| `/api/finance/income` | GET/POST | Income transactions |
| `/api/finance/expenses` | GET/POST | Expense transactions |
| `/api/reports/income-statement` | GET | Financial report |
| `/api/members` | GET/POST | Member management |

## 🔐 Security

- Password hashing with bcrypt
- JWT access tokens (30 min expiry)
- Refresh tokens (7 day expiry)
- Role-based access control
- CORS protection
- Input validation with Pydantic

## 🎨 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **Pydantic** - Data validation
- **JWT** - Authentication tokens
- **PostgreSQL/SQLite** - Database

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Zustand** - State management
- **React Hook Form** - Form handling
- **Chart.js** - Data visualization
- **Axios** - HTTP client

## 📋 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | SQLite |
| `SECRET_KEY` | JWT signing key | Required |
| `DEBUG` | Enable debug mode | False |
| `ALLOWED_ORIGINS` | CORS origins | localhost |

## 🧪 Development

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Code Style
```bash
# Backend - format with black
black app/

# Frontend - lint with ESLint
npm run lint
```

## 🚢 Deployment

### Docker Production
```bash
# Build and run production containers
docker-compose -f docker-compose.yml up -d --build
```

### Manual Deployment
1. Set up PostgreSQL database
2. Configure environment variables
3. Build frontend: `npm run build`
4. Serve with nginx (see `frontend/nginx.conf`)
5. Run backend with Gunicorn: `gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker`

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For issues or questions, please open a GitHub issue.