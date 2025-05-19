const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DEFAULT_PORT = 3000;
const PORT = process.env.DEV_SERVER_PORT || DEFAULT_PORT;
const HOST = process.env.DEV_SERVER_HOST || 'localhost';
const PROXY_PATH = process.env.DEV_SERVER_PROXY || '/api';
const PROXY_TARGET =
  process.env.DEV_SERVER_PROXY_TARGET || 'http://localhost:5000';
const STATIC_DIR = path.join(__dirname, '../dist');
const NOT_FOUND_PAGE = path.join(STATIC_DIR, '404.html');
const HTTP_STATUS_NOT_FOUND = 404;

const app = express();

if (PROXY_PATH && PROXY_TARGET) {
  app.use(
    PROXY_PATH,
    createProxyMiddleware({
      target: PROXY_TARGET,
      changeOrigin: true,
      logLevel: 'debug',
      pathRewrite: { '^': '/api' },
    }),
  );
  console.log(`Proxying requests from ${PROXY_PATH} to ${PROXY_TARGET}`);
} else {
  console.log(
    'Proxy configuration not found or incomplete. Skipping proxy setup.',
  );
}

app.use(express.static(STATIC_DIR, { index: false, redirect: false }));

app.use((req, res, next) => {
  const requestedPath = req.path;

  if (!path.extname(requestedPath)) {
    const indexPath = path.join(STATIC_DIR, requestedPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }

  return next();
});

app.use((_req, res) => {
  if (fs.existsSync(NOT_FOUND_PAGE)) {
    res.status(HTTP_STATUS_NOT_FOUND).sendFile(NOT_FOUND_PAGE);
  } else {
    res.status(HTTP_STATUS_NOT_FOUND).send('Not Found');
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Development server running at http://${HOST}:${PORT}`);
});
