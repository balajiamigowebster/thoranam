// Optional custom server script for cPanel Node.js Application deployment
// This acts as the Application Startup File (e.g., server.js) in cPanel "Setup Node.js App"

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const ALLOWED_ORIGINS = [
  "https://thoranam.co",
  "https://www.thoranam.co",
  "https://thoranam-olive.vercel.app",
  "http://localhost:3000",
];

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const origin = req.headers.origin;

      // Enable CORS for frontend applications (Vercel, Live domains, Localhost)
      if (origin && (ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes(origin.replace(/\/$/, "")))) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, DELETE, PATCH, OPTIONS"
        );
        res.setHeader(
          "Access-Control-Allow-Headers",
          "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
        );
      }

      // Handle preflight OPTIONS requests
      if (req.method === "OPTIONS") {
        res.statusCode = 200;
        res.end();
        return;
      }

      // Handle subpath prefix if deployed under /thoranam in cPanel
      if (req.url === "/thoranam") {
        req.url = "/";
      } else if (req.url.startsWith("/thoranam/")) {
        req.url = req.url.replace(/^\/thoranam/, "");
      }

      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Allowed Live Origins:`, ALLOWED_ORIGINS);
  });
});
