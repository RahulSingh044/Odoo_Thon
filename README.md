# Odoo Thon - HR Management System

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)

A comprehensive HR Management System built with Next.js and FastAPI, featuring automated resume parsing, employee management, attendance tracking, leave management, and more. Designed to streamline HR operations with modern web technologies and intelligent data processing.

## 🌟 Features

- **Employee Management**: Complete CRUD operations for employee records, including personal details, bank information, and salary structures
- **Automated Resume Parsing**: AI-powered resume analysis using FastAPI and spaCy for auto-filling employee details
- **Attendance Tracking**: Real-time attendance monitoring and reporting
- **Leave Management**: Comprehensive leave request and approval system
- **User Authentication**: Secure login/logout functionality with role-based access
- **Admin Dashboard**: Administrative controls for designations, salary structures, and employee oversight
- **Responsive UI**: Modern, intuitive interface built with shadcn/ui components
- **Database Integration**: Robust data management with Prisma ORM and PostgreSQL

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework for production
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Re-usable UI components
- **React Hook Form** - Form management

### Backend
- **FastAPI** - Modern Python web framework for the resume parser
- **spaCy** - Natural language processing for resume analysis
- **Prisma** - Next-generation ORM for database management

### Database
- **PostgreSQL** - Relational database
- **Prisma Migrate** - Database schema management

## 📋 Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **PostgreSQL** database
- **npm** or **yarn** package manager

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/RahulSingh044/Odoo_Thon.git
cd Odoo_Thon
```

### 2. Install Next.js Dependencies
```bash
npm install
```

### 3. Set Up Python Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Upgrade pip and install dependencies
python -m pip install --upgrade pip setuptools wheel

pip install "spacy<3.8"
python -m spacy download en_core_web_sm
pip install -r resume_parser/requirements.txt
```

### 4. Database Setup
```bash
# Configure your PostgreSQL database connection in prisma/schema.prisma
# Run database migrations
npx prisma migrate dev
```

## 🏃‍♂️ Running the Application

### Start the Next.js Application
```bash
npm run dev
```
The application will be available at [http://localhost:3000](http://localhost:3000)

### Start the FastAPI Resume Parser
In a new terminal:
```bash
# Ensure virtual environment is activated
venv\Scripts\activate

# Run the FastAPI server
uvicorn resume_parser.app:app --reload
```
The API will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000)

Testing can be done at [http://localhost:8000/docs#/default/read_root__get](http://localhost:8000/docs#/default/read_root__get)

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Profile Management
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `GET /api/profile/bank-details` - Get bank details
- `PUT /api/profile/bank-details` - Update bank details
- `GET /api/profile/resume` - Get resume data
- `POST /api/profile/resume` - Upload and parse resume

### Employee Management (Admin)
- `GET /api/admin/employees/list` - List all employees
- `GET /api/admin/employees/attendance` - Employee attendance records
- `GET /api/admin/employees/bank-details` - Employee bank details
- `GET /api/admin/employees/leave` - Employee leave records
- `GET /api/admin/employees/resume` - Employee resume data
- `GET /api/admin/employees/salary` - Employee salary information

### HR Operations
- `GET /api/admin/designation` - Manage designations
- `POST /api/admin/register` - Register new employee
- `GET /api/admin/salary-structure` - Salary structure management

### User Operations
- `GET /api/user/attendance` - User attendance
- `GET /api/user/leave` - User leave requests

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ using Next.js and FastAPI by our Team.
