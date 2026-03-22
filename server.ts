import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.post("/api/legal", async (req, res) => {
    // This will be handled by Gemini on the frontend as per guidelines
    // But we can keep it here if we want to proxy or handle specific logic
    res.status(501).json({ error: "Use frontend Gemini SDK directly" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
