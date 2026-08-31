# EduFlux - Smart Tuition Fee Portal

EduFlux is a comprehensive SaaS-based Tuition Fee Portal designed to streamline fee collection, tracking, and management for educational institutes and private classes. 

It aims to eliminate manual bookkeeping, reduce delayed payments through automated reminders, and provide actionable analytics for institute admins while offering a transparent, self-service dashboard for students and parents.

## 🚀 Features
- **Role-Based Dashboards**: Independent, secure dashboards for Institute Admins and Students.
- **Automated Fee Management**: Create custom fee structures, assign them to students, and track pending dues easily.
- **Online Payments**: Integrated with **Razorpay** for seamless, secure online fee collection.
- **Smart AI Assistant**: Powered by **Google Gemini AI**, allowing admins and students to query their data conversationally (e.g., "Show me my pending dues" or "What is my total collection?").
- **Multi-Tenant Architecture**: Ensures strict data isolation; each Admin operates independently with their own exclusive set of students and financial records.
- **Real-Time Analytics**: Visual charts and statistics displaying collections, active students, and overdue amounts.

## 🛠️ Technology Stack
- **Frontend**: React.js, Vite, Recharts, Tailwind/Modern CSS, React Router
- **Backend**: Java 17, Spring Boot, Spring Security, Spring Data JPA
- **Database**: MySQL
- **APIs & Integrations**: Razorpay API, Google Gemini API

## 📦 Project Structure
- `/frontend`: Contains the React.js application.
- `/backend`: Contains the Spring Boot backend REST API.

## ⚙️ Environment Variables
For security, sensitive credentials are removed from the source code. To run this project locally, configure the following environment variables on your system:
- `GEMINI_API_KEY`: Your Google Gemini API Key.
- `RAZORPAY_API_KEY`: Razorpay Key ID.
- `RAZORPAY_API_SECRET`: Razorpay Key Secret.
- `DB_PASSWORD`: Password for your local MySQL instance.
- `JWT_SECRET`: Secret key for signing secure JWT tokens.
- `MAIL_PASSWORD`: App password for sending automated emails via Gmail SMTP.

## 📄 Documentation & Diagrams
All project documentation, including Context Level DFDs, Use Cases, ER Diagrams, and Activity Diagrams, are available in the root directory:
- `EduFlux_Project_Presentation.pptx`: The updated presentation slides.
- `EduFlux_Diagrams_Full.docx`: High-quality Mermaid diagrams tailored for the project.
