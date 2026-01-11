# Auctio

## Frontend

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Backend

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Run backend services (PostgreSQL, Elasticsearch, Kibana) using Docker Compose:
   ```bash
   docker-compose up -d
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Install and run Stripe CLI to set up webhooks:
   ```bash
   stripe listen --forward-to localhost:3000/api/payment/stripe/webhook
   ```
5. Seeding the database:
   ```bash
   npx prisma db seed
   ```
6. Start the backend server:
   ```bash
   npm run dev
   ```
