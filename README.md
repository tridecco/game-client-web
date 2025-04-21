# Tridecco Game Client (Web)

Tridecco Game Client is a frontend application designed to support Tridecco game. It provides user interface rendering, user interaction handling, dynamic content loading, and communication with the backend server.

## Features

- **Dynamic Content Loading**: The client fetches game data from the backend server and renders it on the user interface.
- **Real-time Updates**: The client supports real-time updates using WebSockets.
- **Game Replayability**: The client allows users to replay games by fetching game data from the backend server.
- **Authentication**: The client supports user authentication with JWT and OAuth 2.0.
- **Responsive Design**: The client is designed to be responsive and work on various devices and screen sizes.
- **Admin Panel**: The client provides an admin panel for managing users, statistics, and game records, etc.
- **Offline Support**: The client can work offline by caching game data and assets.

## Tech Stack

- **Languages**: HTML, CSS, JavaScript
- **Frameworks**: Express.js + Socket.IO, Tailwind CSS
- **Authentication**: JWT, OAuth 2.0

## Getting Started

### Prerequisites

- Node.js
- Tridecco Game Server (backend)
- Tridecco Game Match Server (backend)
- Google OAuth 2.0 client ID
- Nginx (for reverse proxy) (optional)
- PM2 (for process management) (optional)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/tridecco/game-client-web.git && cd game-client-web
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:

   ```env
   PORT=3000 # Port number for the server (default: 3000)
   HOST=localhost # Host address for the server (default: localhost)
   CDN_URL= # CDN URL for static assets (default: empty)
   API_URL=/api # API URL for the backend server (default: /api)
   GOOGLE_CLIENT_ID=client_id # Google OAuth 2.0 client ID
   ```

4. Build the Tailwind CSS:

   ```bash
   npm run build:css
   ```

5. Start the server:

   ```bash
   npm start
   ```

6. The server should be running on `http://localhost:3000`.

> **Note**: Use a reverse proxy (e.g., Nginx) to serve the server on a public domain (`/` -> `http://localhost:3000`). Use a process manager (e.g., PM2) to keep the server running in the background.

## License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](LICENSE) file for details.
