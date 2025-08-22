# Paywall & Subscription Starter Kit

This project provides a production-grade "Paywall & Subscription Starter Kit" built with Node.js, TypeScript, Express, MongoDB, and Stripe. It's designed to be a comprehensive starting point for applications requiring robust subscription management and content paywall functionalities.

## Features

- **Authentication**: JWT (RS256) based stateless authentication with registration, login, logout, refresh, forgot/reset password flows.
- **Subscription Management**: Integration with Stripe for creating, upgrading, downgrading, canceling, and reactivating subscriptions.
- **Paywall**: Middleware to protect premium content based on active subscriptions and features.
- **Admin Panel**: Endpoints for managing users, feature flags, and viewing key metrics (MRR, churn, ARPU).
- **Webhooks**: Secure handling of Stripe webhooks for real-time subscription and invoice updates.
- **Security**: Rate-limiting, input validation (Zod), bcrypt for password hashing, Helmet, CORS, hpp, mongo-sanitize.
- **Database**: MongoDB via Mongoose for data persistence.
- **Caching**: Redis for rate-limiting and session cache.
- **Testing**: Unit, integration, and E2E tests with Jest and Supertest.
- **CI/CD**: GitHub Actions for automated build, test, and deployment to Fly.io.
- **API Documentation**: OpenAPI 3.1 specification with auto-generated Postman collection and Swagger UI.
- **Monorepo Structure**: Organized into `apps` (api, ui-admin) and `packages` (eslint-config).

## Tech Stack

- Node.js 20 + TypeScript (strict)
- Express 5 (async error handling)
- MongoDB (NoSQL) via Mongoose 8
- Stripe (latest SDK)
- Redis
- JWT (RS256)
- Docker & docker-compose
- Jest + supertest
- Husky + lint-staged + ESLint + Prettier
- GitHub Actions
- OpenAPI 3.1

## Quickstart

Follow these steps to get the project up and running quickly:

1.  **Clone the repository:**
     bash
    git clone <your-repo-url>
    cd paywall-starter-kit
     

2.  **Install dependencies:**
    This project uses pnpm workspaces. Ensure pnpm is installed (`npm install -g pnpm`).
     bash
    pnpm install
     

3.  **Prepare environment variables:**
    Create a `.env` file in the `apps/api` directory by copying the example:
     bash
    cp apps/api/.env.example apps/api/.env
     
    Edit `apps/api/.env` with your actual configuration, especially for Stripe keys and MongoDB/Redis URLs.

4.  **Generate JWT keys:**
    You'll need to generate `private.pem` and `public.pem` files in a `keys` directory at the root of the `apps/api` folder. (Instructions for generating these keys will be provided in a later step or can be found in the `apps/api/README.md` once created).

5.  **Start services with Docker Compose:**
     bash
    docker-compose up --build
     
    This will start MongoDB, Redis, and the Node.js API server.

6.  **Access API Documentation:**
    Once the API server is running, you can access the Swagger UI at `http://localhost:4000/docs` (or your configured port).

## Project Structure

 
root
├─ apps
│  └─ api
│     ├─ src
│     │  ├─ config
│     │  ├─ models
│     │  ├─ routes
│     │  ├─ controllers
│     │  ├─ services
│     │  ├─ middlewares
│     │  ├─ utils
│     │  ├─ tests
│     │  └─ server.ts
│     ├─ Dockerfile
│     ├─ jest.config.js
│     └─ tsconfig.json
├─ packages
│  ├─ eslint-config
│  └─ ui-admin
├─ docker-compose.yml
├─ .github/workflows/ci.yml
└─ README.md
 

## Contributing

Contributions are welcome! Please refer to the contributing guidelines (to be added).

## License

This project is licensed under the MIT License.
