// Local WYSIWYG edit server for the CV site.
//
//   npm run edit   ->   http://localhost:8788
//
// Renders the real pages (same layout + config + page bodies, read live from disk),
// overlays an in-page editor, and writes your changes back into src/.
//
// Why this exists separately from `wrangler dev`: the Cloudflare Worker runs in a
// sandboxed runtime with no filesystem access, so it cannot save edits to files.
// This is a plain Node process that can. `wrangler dev` / `deploy` stay the source
// of truth for production — this server just edits the same files they ship.

import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const PAGES_DIR = path.join(SRC, "pages");
const PUBLIC = path.join(ROOT, "public");
const EDITOR_DIR = path.join(__dirname, "editor");
const PORT = Number(process.env.EDIT_PORT) || 8788;

const RESERVED_SLUGS = new Set(["styles", "readable", "profile", "index", "_editor"]);
// Config values that are safe to turn back into {{placeholders}} on save.
// (Distinctive, and actually used inside page bodies. We deliberately skip name/
//  tagline/year/photo — they only live in layout/titles and substituting them in
//  prose would be wrong.)
const REVERSIBLE_KEYS = ["email", "github", "linkedin"];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".webm": "video/webm",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".pdf": "application/pdf",
};

// ---------------------------------------------------------------------------
// Rendering (mirrors src/index.js, but reads everything fresh on each request)
// ---------------------------------------------------------------------------

const interpolate = (template, vars) =>
  template.replace(/\{\{(\w+)\}\}/g, (m, key) => (key in vars ? vars[key] : m));

async function loadModule(relPath) {
  // Cache-bust so edits to config / manifest are picked up without restarting.
  const url = pathToFileURL(path.join(SRC, relPath)).href + `?t=${Date.now()}`;
  return import(url);
}

async function loadConfig() {
  return (await loadModule("config.js")).config;
}

async function loadPageList() {
  return (await loadModule("pages.config.js")).pageList;
}

async function renderPage(page, { editor = true } = {}) {
  const config = await loadConfig();
  const pageList = await loadPageList();
  const layout = await fsp.readFile(path.join(SRC, "layout.html"), "utf8");
  const body = await fsp.readFile(path.join(PAGES_DIR, `${page.slug}.html`), "utf8");

  const navHtml = pageList
    .map((p) => `<a href="${p.path}">${p.nav}</a>`)
    .join("\n            ");

  const ctx = {
    ...config,
    // Local dev: cache-busting versions don't matter, assets are served fresh.
    stylesVersion: "dev",
    readableVersion: "dev",
    photoVersion: "dev",
    nav: navHtml,
    photo: config.photo,
  };
  ctx.title = interpolate(page.title, ctx);
  const renderedBody = interpolate(body, ctx);
  let html = interpolate(layout, { ...ctx, body: renderedBody });

  if (editor) {
    const inject =
      `<link rel="stylesheet" href="/_editor/editor.css" />\n` +
      `<script>window.__EDITOR__ = ${JSON.stringify({
        page: page.slug,
        pages: pageList,
        config,
      })};</script>\n` +
      `<script src="/_editor/editor.js" defer></script>\n`;
    html = html.replace("</head>", `${inject}</head>`);
  }
  return html;
}

// ---------------------------------------------------------------------------
// Saving
// ---------------------------------------------------------------------------

function reverseInterpolate(html, config) {
  let out = html;
  for (const key of REVERSIBLE_KEYS) {
    const value = config[key];
    if (typeof value === "string" && value.length > 0) {
      out = out.split(value).join(`{{${key}}}`);
    }
  }
  return out;
}

async function savePageBody(slug, html, mode) {
  const file = path.join(PAGES_DIR, `${slug}.html`);
  if (!fs.existsSync(file)) throw new Error(`Unknown page: ${slug}`);
  let toWrite = html;
  if (mode !== "source") {
    const config = await loadConfig();
    toWrite = reverseInterpolate(html, config);
  }
  if (!toWrite.endsWith("\n")) toWrite += "\n";
  await fsp.writeFile(file, toWrite, "utf8");
}

const slugVar = (slug) => {
  const camel = slug.replace(/[^a-zA-Z0-9]+(.)?/g, (_, c) =>
    c ? c.toUpperCase() : "",
  );
  return `${camel || "page"}Body`;
};

async function createPage({ slug, nav, title }) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    throw new Error("Slug must be lowercase letters, numbers and dashes.");
  }
  if (RESERVED_SLUGS.has(slug)) throw new Error(`"${slug}" is reserved.`);
  const pageList = await loadPageList();
  if (pageList.some((p) => p.slug === slug)) {
    throw new Error(`A page with slug "${slug}" already exists.`);
  }

  // 1. New page body file.
  const bodyFile = path.join(PAGES_DIR, `${slug}.html`);
  const heading = nav || slug;
  await fsp.writeFile(
    bodyFile,
    `<section id="${slug}">\n    <h2>${heading}</h2>\n    <p>New page — start editing!</p>\n</section>\n`,
    "utf8",
  );

  // 2. Register in pages.config.js (insert before the closing `];`).
  const manifestPath = path.join(SRC, "pages.config.js");
  let manifest = await fsp.readFile(manifestPath, "utf8");
  const entry = `  { slug: ${JSON.stringify(slug)}, path: ${JSON.stringify(
    `/${slug}`,
  )}, nav: ${JSON.stringify(nav || slug)}, title: ${JSON.stringify(
    title || `${nav || slug} — {{name}}`,
  )} },\n`;
  const lastBracket = manifest.lastIndexOf("];");
  if (lastBracket === -1) throw new Error("Could not parse pages.config.js");
  manifest = manifest.slice(0, lastBracket) + entry + manifest.slice(lastBracket);
  await fsp.writeFile(manifestPath, manifest, "utf8");

  // 3. Register import + bodies entry in index.js (inside the managed block).
  const indexPath = path.join(SRC, "index.js");
  let index = await fsp.readFile(indexPath, "utf8");
  const varName = slugVar(slug);
  const importLine = `import ${varName} from "./pages/${slug}.html";\n`;
  // Add the import just after the PAGE-BODIES:START marker line.
  index = index.replace(
    /(\/\/ PAGE-BODIES:START[^\n]*\n(?:\/\/[^\n]*\n)*)/,
    (block) => block + importLine,
  );
  // Add the bodies map entry just before its closing `};`.
  index = index.replace(
    /(\n};\n\/\/ PAGE-BODIES:END)/,
    `\n  ${JSON.stringify(slug)}: ${varName},$1`,
  );
  await fsp.writeFile(indexPath, index, "utf8");

  return { slug, path: `/${slug}` };
}

function serializeConfig(config) {
  const lines = Object.entries(config).map(([k, v]) => {
    const value = typeof v === "number" ? String(v) : JSON.stringify(v);
    return `  ${k}: ${value},`;
  });
  return `export const config = {\n${lines.join("\n")}\n};\n`;
}

async function saveConfig(updates) {
  const current = await loadConfig();
  const next = { ...current, ...updates };
  await fsp.writeFile(path.join(SRC, "config.js"), serializeConfig(next), "utf8");
  return next;
}

async function saveUpload(name, dataBase64) {
  const safe = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, "_");
  if (!safe) throw new Error("Invalid file name.");
  await fsp.mkdir(PUBLIC, { recursive: true });
  let target = safe;
  // Avoid clobbering an existing file with a different content.
  if (fs.existsSync(path.join(PUBLIC, target))) {
    const ext = path.extname(safe);
    const base = safe.slice(0, safe.length - ext.length);
    target = `${base}-${Date.now().toString(36)}${ext}`;
  }
  await fsp.writeFile(path.join(PUBLIC, target), Buffer.from(dataBase64, "base64"));
  return { url: `/${target}` };
}

// ---------------------------------------------------------------------------
// Live reload (SSE + fs.watch)
// ---------------------------------------------------------------------------

const reloadClients = new Set();
let reloadTimer = null;

function broadcastReload() {
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => {
    for (const res of reloadClients) {
      try {
        res.write("event: reload\ndata: 1\n\n");
      } catch {
        reloadClients.delete(res);
      }
    }
  }, 120);
}

for (const dir of [SRC, PUBLIC]) {
  if (fs.existsSync(dir)) {
    try {
      fs.watch(dir, { recursive: true }, (_e, file) => {
        if (file && file.includes("_editor")) return;
        broadcastReload();
      });
    } catch {
      /* recursive watch unsupported — non-fatal, manual reload still works */
    }
  }
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

function send(res, status, body, headers = {}) {
  res.writeHead(status, { "Cache-Control": "no-store", ...headers });
  res.end(body);
}

function sendJSON(res, status, obj) {
  send(res, status, JSON.stringify(obj), {
    "Content-Type": "application/json; charset=utf-8",
  });
}

async function readBody(req, limitBytes = 200 * 1024 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limitBytes) throw new Error("Payload too large");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function readJSON(req) {
  const buf = await readBody(req);
  return buf.length ? JSON.parse(buf.toString("utf8")) : {};
}

async function serveFile(res, filePath, { download = false } = {}) {
  try {
    const data = await fsp.readFile(filePath);
    const type = MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    send(res, 200, data, { "Content-Type": type, ...(download ? {} : {}) });
  } catch {
    send(res, 404, "Not Found", { "Content-Type": "text/plain" });
  }
}

// ---------------------------------------------------------------------------
// Routing
// ---------------------------------------------------------------------------

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = decodeURIComponent(url.pathname);

    // --- Editor API ---
    if (pathname.startsWith("/_editor/")) {
      const ep = pathname.slice("/_editor/".length);

      if (ep === "editor.js" || ep === "editor.css") {
        return serveFile(res, path.join(EDITOR_DIR, ep));
      }

      if (ep === "reload-stream") {
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        });
        res.write("retry: 1000\n\n");
        reloadClients.add(res);
        req.on("close", () => reloadClients.delete(res));
        return;
      }

      if (ep === "source" && req.method === "GET") {
        const slug = url.searchParams.get("page");
        const file = path.join(PAGES_DIR, `${path.basename(slug || "")}.html`);
        if (!fs.existsSync(file)) return sendJSON(res, 404, { error: "Unknown page" });
        return sendJSON(res, 200, { html: await fsp.readFile(file, "utf8") });
      }

      if (ep === "site" && req.method === "GET") {
        return sendJSON(res, 200, { config: await loadConfig() });
      }

      if (req.method === "POST") {
        const data = await readJSON(req);
        try {
          if (ep === "save") {
            await savePageBody(data.page, data.html ?? "", data.mode);
            return sendJSON(res, 200, { ok: true });
          }
          if (ep === "new-page") {
            const result = await createPage(data);
            return sendJSON(res, 200, { ok: true, ...result });
          }
          if (ep === "site") {
            const next = await saveConfig(data.config || {});
            return sendJSON(res, 200, { ok: true, config: next });
          }
          if (ep === "upload") {
            const result = await saveUpload(data.name, data.dataBase64);
            return sendJSON(res, 200, { ok: true, ...result });
          }
        } catch (err) {
          return sendJSON(res, 400, { error: err.message });
        }
      }

      return sendJSON(res, 404, { error: "Unknown editor endpoint" });
    }

    // --- Static assets from src/ ---
    if (pathname === "/styles.css") return serveFile(res, path.join(SRC, "styles.css"));
    if (pathname === "/readable.min.css")
      return serveFile(res, path.join(SRC, "readable.min.css"));
    if (pathname === "/profile.png") return serveFile(res, path.join(SRC, "profile.png"));

    // --- Static assets from public/ ---
    const publicCandidate = path.join(PUBLIC, path.normalize(pathname));
    if (
      pathname !== "/" &&
      publicCandidate.startsWith(PUBLIC) &&
      fs.existsSync(publicCandidate) &&
      fs.statSync(publicCandidate).isFile()
    ) {
      return serveFile(res, publicCandidate);
    }

    // --- Pages ---
    const pageList = await loadPageList();
    const cleanPath = pathname.replace(/\.html$/, "") || "/";
    const page =
      pageList.find((p) => p.path === pathname) ||
      pageList.find((p) => p.path === cleanPath) ||
      (pathname === "/index.html" ? pageList.find((p) => p.path === "/") : null);

    if (page) {
      const html = await renderPage(page);
      return send(res, 200, html, { "Content-Type": "text/html; charset=utf-8" });
    }

    send(res, 404, "Not Found", { "Content-Type": "text/plain" });
  } catch (err) {
    console.error(err);
    send(res, 500, `Server error: ${err.message}`, { "Content-Type": "text/plain" });
  }
});

server.listen(PORT, () => {
  console.log(`\n  ✏️  Editor running at  http://localhost:${PORT}\n`);
  console.log("  Click into the page to edit. Cmd/Ctrl+S to save.");
  console.log("  Changes are written straight into src/. Use git to review/undo.\n");
});
