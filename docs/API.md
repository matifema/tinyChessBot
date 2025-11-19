# API Documentation

The application exposes several API endpoints, primarily used by the Admin Dashboard.

**Base URL**: `/api`

## Authentication

Most endpoints require authentication. The session is managed via NextAuth.js cookies.

## Endpoints

### Listings

#### `GET /api/listings`
Retrieves a list of properties.
- **Access**: Protected (Admin only).
- **Query Params**:
    - `propertyType` (optional): Filter by type.
    - `sortBy` (optional): Sort order (default: `createdAt_desc`).

#### `POST /api/listings`
Creates a new property listing.
- **Access**: Protected (Admin only).
- **Body**: JSON object containing listing details (`title`, `price`, `description`, `imageUrls`, etc.).

#### `GET /api/listings/[id]`
Retrieves a specific listing by ID.
- **Access**: Public/Protected (depending on implementation, usually public for read, but API route might be admin-scoped).

#### `PUT /api/listings/[id]`
Updates an existing listing.
- **Access**: Protected (Admin only).
- **Body**: JSON object with fields to update.

#### `DELETE /api/listings/[id]`
Deletes a listing.
- **Access**: Protected (Admin only).

### Uploads

#### `POST /api/upload`
Uploads a file to Vercel Blob storage.
- **Access**: Protected (Admin only).
- **Query Params**:
    - `filename`: The name of the file being uploaded.
- **Body**: Binary file content.
- **Response**: JSON containing the `url` of the uploaded file.

### Auth

#### `GET/POST /api/auth/[...nextauth]`
Handles NextAuth.js authentication flows (login, logout, session).
