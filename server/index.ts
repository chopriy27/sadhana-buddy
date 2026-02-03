import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Serve the app - try port 5000 first, fallback to 3000
  // Port 5000 is used by AirPlay on macOS, so we provide alternatives
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  const fallbackPort = 3000;
  
  const startServer = (portToTry: number) => {
    server.listen(portToTry, "0.0.0.0", () => {
      log(`serving on port ${portToTry}`);
    }).on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE' || err.code === 'ENOTSUP') {
        if (portToTry === port && portToTry !== fallbackPort) {
          log(`Port ${portToTry} unavailable, trying ${fallbackPort}...`);
          startServer(fallbackPort);
        } else {
          console.error(`Could not start server on port ${portToTry}:`, err.message);
          process.exit(1);
        }
      } else {
        throw err;
      }
    });
  };
  
  startServer(port);
})();
