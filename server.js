import express from 'express';
import next from 'next';
import fs from 'fs';
import http from 'http';
import https from 'https';
import { printBanner } from './utils/banner.js';

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev, turbo: true });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  printBanner();

  server.all('*', (req, res) => handle(req, res));

  const useHttps = process.env.USE_HTTPS === 'true';

  if (useHttps) {
    const httpsOptions = {
      key: fs.readFileSync('./certs/key.pem'),
      cert: fs.readFileSync('./certs/cert.pem'),
    };
    https.createServer(httpsOptions, server).listen(port, '0.0.0.0', (err) => {
      if (err) throw err;
      console.log(`> Ready on https://0.0.0.0:${port} (Turbopack)`);
    });
  } else {
    http.createServer(server).listen(port, '0.0.0.0', (err) => {
      if (err) throw err;
      console.log(`> Ready on http://0.0.0.0:${port} (Turbopack)`);
    });
  }
});
