import { config } from "./config.js";
import layoutTemplate from "./layout.html";
import homeBody from "./pages/home.html";
import aboutBody from "./pages/about.html";
import projectsBody from "./pages/projects.html";
import booksBody from "./pages/books.html";
import stylesCss from "./styles.css";
import readableCss from "./readable.min.css";
import profileImage from "./profile.png";

const interpolate = (template, vars) =>
  template.replace(/\{\{(\w+)\}\}/g, (m, key) => (key in vars ? vars[key] : m));

const hashContent = (input) => {
  const bytes =
    typeof input === "string"
      ? new TextEncoder().encode(input)
      : new Uint8Array(input);
  let h = 5381;
  for (let i = 0; i < bytes.length; i++) {
    h = (((h << 5) + h) ^ bytes[i]) >>> 0;
  }
  return h.toString(36);
};

const versions = {
  stylesVersion: hashContent(stylesCss),
  readableVersion: hashContent(readableCss),
  photoVersion: hashContent(profileImage),
};

const renderPage = (title, bodyTemplate) => {
  const ctx = {
    ...config,
    ...versions,
    photo: `${config.photo}?v=${versions.photoVersion}`,
    title,
  };
  const body = interpolate(bodyTemplate, ctx);
  return interpolate(layoutTemplate, { ...ctx, body });
};

const pages = {
  home: renderPage(config.name, homeBody),
  about: renderPage(`About me — ${config.name}`, aboutBody),
  projects: renderPage(`Notable projects — ${config.name}`, projectsBody),
  books: renderPage(`Favorite books — ${config.name}`, booksBody),
};

const routes = {
  "/": pages.home,
  "/index.html": pages.home,
  "/about": pages.about,
  "/about.html": pages.about,
  "/projects": pages.projects,
  "/projects.html": pages.projects,
  "/books": pages.books,
  "/books.html": pages.books,
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    const headers = new Headers({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
    });

    if (routes[pathname]) {
      headers.set("Content-Type", "text/html; charset=utf-8");
      headers.set("Cache-Control", "public, max-age=300, must-revalidate");
      return new Response(routes[pathname], { headers });
    }

    if (pathname === "/styles.css") {
      headers.set("Content-Type", "text/css; charset=utf-8");
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
      return new Response(stylesCss, { headers });
    }

    if (pathname === "/readable.min.css") {
      headers.set("Content-Type", "text/css; charset=utf-8");
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
      return new Response(readableCss, { headers });
    }

    if (pathname === "/profile.png") {
      headers.set("Content-Type", "image/png");
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
      return new Response(profileImage, { headers });
    }

    return new Response("Not Found", {
      status: 404,
      headers: { "Content-Type": "text/plain" },
    });
  },
};
