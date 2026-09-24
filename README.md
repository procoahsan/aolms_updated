# AOLMS - Advanced Order and Logistics Management System

## Overview

AOLMS is a comprehensive task/order management and technical data-entry system designed for service delivery and assurance operations. It provides a centralized platform for managing orders, tracking service delivery, handling service assurance tickets, and maintaining inventory of ONT and CPE devices.

## Features

### For Admins
- User management
- Role assignment
- Project management

### For Controllers
- Order management
- Service delivery tracking
- Service assurance ticket management
- Spreadsheet interface for data entry

### For Technicians
- Mobile-first workspace
- Task assignment
- Delivery and assurance form submission
- Local autosave of drafts

## Technology Stack

### Backend
- NestJS
- TypeORM
- PostgreSQL
- Supabase Auth
- JWT Authentication

### Frontend
- React
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- Zod
- Supabase JS client

## Getting Started

### Prerequisites
- Node.js (v20.18.0 or later)
- npm (v10.0.0 or later)
- PostgreSQL database
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/AOLMS.git
   cd AOLMS
   ```

2. Install dependencies for both backend and frontend:
   ```bash
   npm install
   cd client && npm install
   ```

3. Set up environment variables:
   - Create `.env` files in both the root directory and the `client` directory
   - Use `.env.example` as a template

4. Set up the database:
   ```bash
   # Run database migrations
   cd server
   npm run typeorm migration:run
   ```

5. Start the development servers:
   ```bash
   # In one terminal, start the backend
   cd server
   npm run start:dev

   # In another terminal, start the frontend
   cd client
   npm run dev
   ```

## Project Structure

```
AOLMS/
├── client/          # Frontend application
├── server/          # Backend application
├── docs/            # Project documentation
├── .env.example     # Environment variables template
└── README.md        # Project documentation
```

## API Documentation

The API documentation is available at `/api-docs` when the backend server is running.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any questions or feedback, please contact us at support@aolms.com.