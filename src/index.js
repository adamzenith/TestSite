import { config } from "./config.js";
import { pageList } from "./pages.config.js";
import layoutTemplate from "./layout.html";
import stylesCss from "./styles.css";
import readableCss from "./readable.min.css";
import profileImage from "./profile.png";

// PAGE-BODIES:START — managed by the editor (npm run edit).
// Keep exactly one import line and one `bodies` entry per page. Map keys must match a slug in pages.config.js.
import blogsBody from "./pages/blogs.html";
import homeBody from "./pages/home.html";
import aboutBody from "./pages/about.html";
import projectsBody from "./pages/projects.html";
import booksBody from "./pages/books.html";

const bodies = {
  home: homeBody,
  about: aboutBody,
  projects: projectsBody,
  books: booksBody,
  "blogs": blogsBody,
};
// PAGE-BODIES:END

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

const navHtml = pageList
  .map((p) => `<a href="${p.path}">${p.nav}</a>`)
  .join("\n            ");

const renderPage = (page) => {
  const ctx = {
    ...config,
    ...versions,
    nav: navHtml,
    photo: `${config.photo}?v=${versions.photoVersion}`,
  };
  ctx.title = interpolate(page.title, ctx);
  const body = interpolate(bodies[page.slug] ?? "", ctx);
  return interpolate(layoutTemplate, { ...ctx, body });
};

const routes = {};
for (const page of pageList) {
  const html = renderPage(page);
  routes[page.path] = html;
  if (page.path === "/") {
    routes["/index.html"] = html;
  } else {
    routes[`${page.path}.html`] = html;
  }
}

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
