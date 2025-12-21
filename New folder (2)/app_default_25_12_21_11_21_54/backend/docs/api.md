# Gaming Community Forum API Documentation

## Authentication
All protected routes require a JWT token in the Authorization header: `Bearer <token>`

### POST /api/auth/register
- Body: `{ "username": "string", "email": "string", "password": "string" }`
- Response: `{ "token": "string" }`

### POST /api/auth/login
- Body: `{ "email": "string", "password": "string" }`
- Response: `{ "token": "string" }`

## Posts
### GET /api/posts
- Query: `page=1&limit=10`
- Response: `{ "posts": [...], "totalPages": number, "currentPage": number }`

### POST /api/posts
- Headers: Authorization
- Body: `{ "title": "string", "content": "string", "tags": "string" }`, Images as multipart/form-data
- Response: Post object

### GET /api/posts/:id
- Response: Post object with comments

### PUT /api/posts/:id
- Headers: Authorization (owner only)
- Body: `{ "title": "string", "content": "string", "tags": "string" }`
- Response: Updated post

### DELETE /api/posts/:id
- Headers: Authorization (owner/admin)
- Response: `{ "message": "Post deleted" }`

### POST /api/posts/:id/upvote
- Headers: Authorization
- Response: Updated post

### POST /api/posts/:id/downvote
- Headers: Authorization
- Response: Updated post

### POST /api/posts/:id/comment
- Headers: Authorization
- Body: `{ "content": "string" }`
- Response: Updated post

## Users
### GET /api/users
- Response: Array of users

### GET /api/users/:id
- Response: `{ "user": object, "posts": array }`

### PUT /api/users/:id
- Headers: Authorization
- Body: Form data with avatar
- Response: Updated user

### GET /api/users/:id/reputation
- Response: `{ "reputation": number }`

## Chats
### GET /api/chats/rooms
- Headers: Authorization
- Response: Array of chats

### POST /api/chats/room
- Headers: Authorization
- Body: `{ "room": "string", "participants": ["userId"] }`
- Response: Chat object

### GET /api/chats/room/:id
- Headers: Authorization
- Response: Chat object

## Teams
### GET /api/teams
- Response: Array of teams

### POST /api/teams
- Headers: Authorization
- Body: `{ "name": "string", "description": "string", "game": "string" }`
- Response: Team object

### GET /api/teams/:id
- Response: Team object

### PUT /api/teams/:id/join
- Headers: Authorization
- Response: Updated team

### PUT /api/teams/:id/leave
- Headers: Authorization
- Response: Updated team

## Tournaments
### GET /api/tournaments
- Response: Array of tournaments

### POST /api/tournaments
- Headers: Authorization (admin)
- Body: `{ "name": "string", "game": "string", "description": "string", "startDate": "date", "endDate": "date" }`
- Response: Tournament object

### GET /api/tournaments/:id
- Response: Tournament object

### POST /api/tournaments/:id/join
- Headers: Authorization
- Response: Updated tournament

### PUT /api/tournaments/:id/leaderboard
- Headers: Authorization (admin)
- Body: `{ "leaderboard": [...] }`
- Response: Updated tournament

### POST /api/tournaments/:id/announce
- Headers: Authorization (admin)
- Body: `{ "title": "string", "content": "string" }`
- Response: Updated tournament
