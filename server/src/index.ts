import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import posts from "./routes/posts.js";
import users from "./routes/users.js";
import comments from "./routes/comments.js";
import messages from "./routes/messages.js";
import { authSocket, registerSocketHandlers } from "./socket.js";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT || 4000);

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`${name} is required`);
    process.exit(1);
  }
  return value;
}

const tokenKey = requireEnv("TOKEN_KEY");
if (tokenKey.length < 32) {
  console.error("TOKEN_KEY must be at least 32 characters");
  process.exit(1);
}

const mongoUri = requireEnv("MONGO_URI");
if (mongoUri === "memory") {
  console.error(
    'MONGO_URI=memory is not supported. Use a real MongoDB connection string.'
  );
  process.exit(1);
}

const clientOrigins = (
  isProd
    ? [process.env.CLIENT_URL]
    : [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        process.env.CLIENT_URL,
      ]
).filter(Boolean) as string[];

if (isProd && clientOrigins.length === 0) {
  console.error("CLIENT_URL is required in production");
  process.exit(1);
}

const app = express();
const httpServer = http.createServer(app);

if (isProd) {
  app.set("trust proxy", 1);
}

const io = new Server(httpServer, {
  cors: { origin: clientOrigins, credentials: true },
});

io.use(authSocket);
io.on("connection", (socket) => registerSocketHandlers(io, socket));

app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  if (isProd) {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=15552000; includeSubDomains"
    );
  }
  next();
});

app.use(express.json({ limit: "256kb" }));
app.use(
  cors({
    origin: clientOrigins,
    credentials: true,
  })
);

app.get("/api/health", (_req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  res.status(dbReady ? 200 : 503).json({
    ok: dbReady,
    service: "gila-community",
    env: isProd ? "production" : "development",
  });
});

app.use("/api/posts", posts);
app.use("/api/users", users);
app.use("/api/comments", comments);
app.use("/api/messages", messages);

if (isProd) {
  const clientDist = path.resolve(__dirname, "../../client/dist");
  app.use(express.static(clientDist, { index: false, maxAge: "1h" }));
  app.get("/{*path}", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(clientDist, "index.html"), (err) => {
      if (err) next(err);
    });
  });
}

app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
);

async function start() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");

  httpServer.listen(port, () => {
    console.log(
      `gila community listening on :${port} (${isProd ? "production" : "development"})`
    );
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
