# Kodbank

Kodbank is a secure web application implementing stateless JWT authentication, designed for a production environment.

## Project Structure
- `backend/` - Node.js Express server
- `frontend/` - React application built with Vite
- `database/` - MySQL schema files
- `tests/` - Test scripts
- `run.sh` - Script to run the full system

## Environment Variables Example
Create `.env` file inside `backend/`:

```
PORT=5000
DB_URI=mysql://user:pass@host:port/database?ssl-mode=REQUIRED
JWT_SECRET=super_secret_jwt_key
```

## Setup Instructions

1. Install backend dependencies: `cd backend && npm install`
2. Install frontend dependencies: `cd frontend && npm install`
3. Setup the database by running the migration script: `cd backend && node migrate.js`
4. Run both servers: `sh run.sh`

## API Documentation

### `POST /register`
Creates a new user account.
- **Body**: `{ "username": "...", "email": "...", "password": "...", "phone": "..." }`
- **Response**: `201 Created` on success.

### `POST /login`
Authenticates a user and issues an HTTP-only JWT cookie.
- **Body**: `{ "username": "...", "password": "..." }`
- **Response**: `200 OK` + `Set-Cookie`. Stores the token in `usertoken` table.

### `GET /getBalance`
Retrieves the logged-in user's balance.
- **Headers**: Automatically uses the HTTP-only cookie to authenticate.
- **Response**: `200 OK` `{ "balance": 100000.00 }` on success.

## Test Scripts
See `tests/api.test.js` for an example of automated API test assertions using mocha + supertest. Run tests locally by adding `mocha` in `package.json` scripts or using a test runner of preference.
