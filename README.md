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
- **Authentication**: JWT, OAuth 2.0 (Google)

## Getting Started

### Prerequisites

- Node.js
- Tridecco Game Server (backend)
- Tridecco Game Match Server (backend)
- Google OAuth 2.0 client ID (only for web build)
- Nginx (for reverse proxy) (optional)

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
   CDN_URL= # CDN URL for static assets (default: empty)
   API_URL=/api # API URL for the backend server (default: /api)
   BUILD_MODE=web # Build mode (default: web, can be web or local)
   GOOGLE_CLIENT_ID=client_id # Google OAuth 2.0 client ID
   DEV_SERVER_PORT=3000 # Development server port (default: 3000)
   DEV_SERVER_HOST=localhost # Development server host (default: localhost)
   DEV_SERVER_PROXY=/api # Development server proxy (default: /api)
   DEV_SERVER_PROXY_TARGET=http://localhost:5000 # Development server proxy target (default: http://localhost:5000)
   ```

   > **Note**: The `BUILD_MODE` variable is used to determine the build mode. It can be `web` or `local`. When set to `web`, the client will load static assets from the CDN. When set to `local`, the client will load static assets from the local server. The `local` build mode is used for native builds (e.g. Electron, Capacitor, etc.).

4. Build the client:

   ```bash
   npm run build # for production mode
   ```

   or

   ```bash
   npm run dev # for development mode (will start a development server)
   ```

   > **Note**: The build will be created in the `dist` directory.

> **Note**: Use a server like Nginx to serve the static files in production mode.

## License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](LICENSE) file for details.
