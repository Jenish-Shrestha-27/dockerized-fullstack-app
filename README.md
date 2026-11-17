# Dockerized Full-Stack Application

A containerized full-stack task management application built with **Next.js, NestJS, PostgreSQL, and Docker Compose**.

The project demonstrates how to containerize frontend and backend applications, configure database connectivity, manage services, and run a multi-container application using Docker Compose.

![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)
![Docker Compose](https://img.shields.io/badge/Docker_Compose-2496ED?logo=docker&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-5FA04E?logo=nodedotjs&logoColor=white)

## Architecture

The application consists of three independent services:

```text
              Browser
                 |
                 v
          Next.js Frontend
           localhost:3001
                 |
                 v
           NestJS Backend
           localhost:8000
                 |
                 v
           PostgreSQL DB
           localhost:5432
                 |
                 v
           Docker Volume
```

Docker Compose manages the services and their communication through a shared Docker network.

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | Frontend application |
| NestJS | Backend REST API |
| PostgreSQL 18 | Relational database |
| Docker | Application containerization |
| Docker Compose | Multi-container orchestration |
| Node.js | JavaScript runtime |

## Features

- Separate containers for frontend, backend, and database.
- Multi-container orchestration using Docker Compose.
- Docker networking and service-name-based communication.
- PostgreSQL data persistence using a named volume.
- Database health checks and service startup dependency.
- Environment-based configuration.
- Dockerfiles for frontend and backend.
- Multi-stage Dockerfile examples.
- `.dockerignore` files to reduce build context.
- Dependency installation and Docker layer caching considerations.

## Project Structure

```text
dockerized-fullstack-app/
│
├── backend/
│   ├── src/
│   ├── test/
│   ├── Dockerfile
│   ├── Dockerfile.multistage
│   ├── .dockerignore
│   └── package.json
│
├── next-ui/
│   ├── app/
│   ├── public/
│   ├── Dockerfile
│   ├── Dockerfile.multistage
│   ├── .dockerignore
│   └── package.json
│
├── compose.yaml
├── .env.example
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

Make sure you have installed:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

### 1. Clone the repository

```bash
git clone https://github.com/Jenish-Shrestha-27/dockerized-fullstack-app.git
```

```bash
cd dockerized-fullstack-app
```

### 2. Configure environment variables

Create your local environment file from the example:

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

Update `.env` with your local database credentials and configuration.

Do not commit your actual `.env` file.

### 3. Build and start the application

```bash
docker compose up --build -d
```

This builds the application images and starts the frontend, backend, and PostgreSQL services.

### 4. Check running containers

```bash
docker compose ps
```

### 5. View application logs

```bash
docker compose logs -f
```

To view logs for a specific service:

```bash
docker compose logs -f backend
```

```bash
docker compose logs -f frontend
```

```bash
docker compose logs -f db
```

## Application URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:3001 |
| Backend | http://localhost:8000 |
| PostgreSQL | localhost:5432 |

## Useful Docker Commands

| Command | Description |
|---|---|
| `docker compose up -d` | Start services in detached mode |
| `docker compose up --build -d` | Rebuild and start services |
| `docker compose ps` | List Compose services |
| `docker compose logs -f` | Follow service logs |
| `docker compose stop` | Stop services |
| `docker compose start` | Start stopped services |
| `docker compose down` | Stop and remove containers and network |
| `docker compose build` | Build application images |

**Important:** `docker compose down -v` also removes named volumes and can permanently delete your local PostgreSQL data.

## What I Learned

This project is part of my hands-on DevOps learning journey. Through building it, I practiced:

- Understanding Docker images and containers.
- Writing Dockerfiles for Node.js applications.
- Managing containers using Docker Compose.
- Connecting multiple services through Docker networking.
- Persisting database data using Docker volumes.
- Configuring environment variables.
- Using health checks and service dependencies.
- Understanding multi-stage builds.
- Separating build-time and runtime dependencies.
- Optimizing Docker image builds and layer caching.

## Future Improvements

- Add automated CI checks using GitHub Actions.
- Improve production deployment configuration.
- Add application health checks.
- Implement automated testing in the CI pipeline.
- Explore container monitoring and logging.

## Author

**Jenish Shrestha**



- GitHub: [@Jenish-Shrestha-27](https://github.com/Jenish-Shrestha-27)
- Project: [Dockerized Full-Stack Application](https://github.com/Jenish-Shrestha-27/dockerized-fullstack-app)

---

*Built as a practical project to learn Docker, containerization, and multi-container application management.*
