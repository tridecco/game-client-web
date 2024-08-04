# Tridecco Game Client Web

Tridecco Game Client is a frontend application designed to support Tridecco games. It provides user interface rendering, user interaction handling, dynamic content loading, and communication with the backend server.

## Tech Stack Used

### Platform

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

### Language

![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

### Real-Time Communication

![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)

### Package Manager

![NPM](https://img.shields.io/badge/NPM-%23CB3837.svg?style=for-the-badge&logo=npm&logoColor=white)

## Quick Start

### Environment Requirements

- Node.js

### Setting Up the Server

1. Clone the repository:

```bash
git clone https://github.com/tridecco/game-client-web.git
cd game-client-web
```

2. Install dependencies:

```bash
npm install
```

3. Compile Tailwind CSS and PostCSS:

```bash
npm run build:css
```

4. Configure the backend server URL in the `app.js` file:

```javascript
// ......

// Create a new App object (global variable)
const app = new App("https://127.0.0.1"); // Change this to the backend server URL
```

5. Start the server:

```bash
npm start
```
