# JBC Purchasing System

A full-stack web application designed to manage purchasing workflows for JBC.

## Table of Contents

- [Technology Stack](#technology-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup and Installation](#setup-and-installation)
- [Running the Application](#running-the-application)
- [Running Tests](#running-tests)
- [Environment Variables](#environment-variables)

## Technology Stack

**Backend:**
- Node.js
- TypeScript
- Express.js
- MongoDB
- Mongoose
- Zod (for validation)
- JWT (for authentication)
- Jest (for testing)

**Frontend:**
- Next.js
- React
- TypeScript
- Tailwind CSS

**Proxy:**
- Nginx

**Containerization:**
- Docker
- Docker Compose

## Features

- User Authentication & Authorization (JWT-based)
- Supply Management (CRUD operations, status updates)
- Supplier Management (CRUD operations)
- Supplier Pricing Management (Adding, updating, removing pricing details for supplies)
- Attachment Management (Adding/removing attachments to supplies - *implementation details might vary*)
- Search functionality for supplies
- Robust data validation using Zod

## Project Structure

```
.
├── backend/          # Node.js/Express backend application
│   ├── src/          # Source code (controllers, models, routes, etc.)
│   ├── tests/        # Unit and integration tests
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/         # Next.js frontend application
│   ├── src/          # Source code (pages, components, etc.)
│   ├── public/
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── proxy/            # Nginx reverse proxy configuration
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml # Docker Compose configuration for all services
└── README.md          # This file
```

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/) (Usually included with Docker Desktop)

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd JBCPurchasingSystem
    ```

2.  **Environment Variables:**
    - Create a `.env` file in the `backend/` directory.
    - Add the necessary environment variables. Refer to the [Environment Variables](#environment-variables) section below for required variables.

3.  **Build and Start Containers:**
    From the root directory (`JBCPurchasingSystem`), run:
    ```bash
    docker-compose up --build -d
    ```
    This command will build the Docker images for the backend, frontend, and proxy services and start them in detached mode.

## Running the Application

- **Frontend:** Access the application in your browser at `http://localhost:80` (or the port mapped by Nginx).
- **Backend API:** The API will be accessible through the Nginx proxy, typically at `http://localhost:80/api/...`. The backend service itself runs internally on port 5001 (as per typical `docker-compose.yml` setups, but verify yours).

To stop the application:
```bash
docker-compose down
```

## Running Tests

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies (if not already done via Docker build):**
    ```bash
    npm install
    ```

3.  **Run the tests:**
    ```bash
    npm test
    ```
    This will execute the Jest test suite defined in the `backend/tests` directory.

## Environment Variables

The backend requires a `.env` file located in the `backend/` directory. Key variables include:

```dotenv
# backend/.env

# Database
DATABASE_URL=mongodb://mongo:27017/jbc_purchasing # Example using Docker service name 'mongo'
MONGO_INITDB_ROOT_USERNAME= # Optional: if your MongoDB requires authentication
MONGO_INITDB_ROOT_PASSWORD= # Optional: if your MongoDB requires authentication

# JWT
JWT_SECRET=your_strong_jwt_secret_key # Replace with a strong, random secret
JWT_EXPIRES_IN=1d # Example: token expiry time

# Server
PORT=5001 # The internal port the backend server listens on

# Add any other environment variables required by the application (e.g., API keys, service URLs)
```

**Note:** Ensure the `DATABASE_URL` points to the correct MongoDB instance. If running via Docker Compose as configured in the standard `docker-compose.yml`, `mongodb://mongo:27017/jbc_purchasing` is typically correct, using the service name `mongo`.

---
*(Optional: Add sections for API Documentation, Contributing Guidelines, and License if applicable)*
