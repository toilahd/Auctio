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
4. Seeding the database (optional):
   ```bash
   npx prisma db seed
   ```
5. Start the backend server:
   ```bash
   npm run dev
   ```
