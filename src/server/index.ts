import express from "express";
import path from "path";
import fs from "fs";
import * as esbuild from "esbuild";
import { fileURLToPath } from "node:url";
import chokidar from "chokidar";
import WebSocket, { WebSocketServer } from "ws";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, "..");
const PUBLIC_DIR = path.join(__dirname, "../../public");

const app = express();
const PORT = 3000;

// Function to bundle TypeScript
async function bundleTypeScript(entryPoint: string): Promise<string> {
  try {
    const result = await esbuild.build({
      entryPoints: [entryPoint],
      bundle: true,
      write: false,
      format: "esm",
      target: "esnext",
    });

    return result.outputFiles[0].text;
  } catch (error: unknown) {
    console.error("Bundling failed:", error);
    return `console.error("Bundling failed: ${(error as Error).message}")`;
  }
}

// Serve static files from src/client
app.use(express.static(path.join(__dirname, "../client")));
// use assets from /public on client-side
app.use(express.static(PUBLIC_DIR));

const desc = `
<p><a href="https://github.com/mattdesl/workshop-generative-color">Original code</a> by Matt DesLauriers. 
  <br>Ported to <a href="https://github.com/cdaein/ssam">Ssam.js</a> and <a href="https://thi.ng">Thing Umbrella</a> by Daeinc</p>
`;

// Route to list all sketches
app.get("/", (_req, res) => {
  const sketchesDir = path.join(__dirname, "../client/sketches");
  const sketches = fs
    .readdirSync(sketchesDir)
    .filter((file) => file.endsWith(".ts"))
    .map((file) => file.replace(".ts", ""));

  const sketchLinks = sketches
    .map(
      (sketch) => `
        <li>
          <a href="/sketch/${sketch}">
            <div class="img-container">
              <img src="/output/${sketch.split("-")[0]}.png" />
            </div>
            <p>${sketch}</p>
          </a>
        </li>
      `,
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Generative Colors</title>
        <link rel="stylesheet" type="text/css" href="/style.css"/>
      </head>
      <body>
        <nav>
          <h1><a href="/">Generative Colors</a></h1>
${desc}
        </nav>
        <ul class="sketch-links">
          ${sketchLinks}
        </ul>
          <script>
            const ws = new WebSocket('ws://localhost:${PORT}');
            ws.onmessage = function(event) {
                if (event.data === 'reload') {
                    location.reload();
                }
            };
            // Optional: handle connection open and errors
            ws.onopen = function() {
              console.log('Connected to WebSocket server');
            };

            ws.onerror = function(error) {
              console.error('WebSocket error:', error);
            };
          </script>
      </body>
    </html>
  `;

  res.send(html);
});

// Route to serve individual sketches
app.get("/sketch/:name", async (req, res) => {
  const sketchName = req.params.name;
  const sketchPath = path.join(
    __dirname,
    `../client/sketches/${sketchName}.ts`,
  );

  if (!fs.existsSync(sketchPath)) {
    return res.status(404).send("Sketch not found");
  }

  try {
    const bundledJS = await bundleTypeScript(sketchPath);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${sketchName}</title>
          <link rel="stylesheet" type="text/css" href="/style.css"/>
          <style>
          </style>
        </head>
        <body>
          <nav>
            <h1><a href="/">Generative Colors</a></h1> / <span>${sketchName}</span>
${desc}
          </nav>
          <div class="sketch-parent"></div>
          <script type="module">
            ${bundledJS}
          </script>
          <script>
            const ws = new WebSocket('ws://localhost:${PORT}');
            ws.onmessage = function(event) {
                if (event.data === 'reload') {
                    location.reload();
                }
            };
            // Optional: handle connection open and errors
            ws.onopen = function() {
              console.log('Connected to WebSocket server');
            };

            ws.onerror = function(error) {
              console.error('WebSocket error:', error);
            };
          </script>
        </body>
      </html>
    `;

    res.send(html);
    return;
  } catch (error) {
    //@ts-ignore
    res.status(500).send(`Error bundling sketch: ${error.message}`);
    return;
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (_ws) => {
  // console.log("Client connected");
});

// Watch for file changes
chokidar
  .watch([SRC_DIR, path.join(__dirname, "../../public/**/*.css")])
  .on("change", (path) => {
    // if (path.endsWith(".ts")) {
    console.log(`File ${path} has been changed`);

    // Notify all clients to reload
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send("reload");
      }
    });
    // }
  });
