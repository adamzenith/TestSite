const HEAD_LINKS = `
    <link rel="stylesheet" type="text/css" href="https://codeberg.org/Freedom-to-Write/readable.css/raw/branch/main/readable.min.css">
    <link rel="stylesheet" type="text/css" href="/styles.css">`;

const HEADER = `
    <header>
        <div class="profile-header">
            <img class="profile-photo" src="/profile.jpg" alt="Photo of Matthias Adamsen">
            <div class="profile-title">
                <h1>Matthias Adamsen</h1>
                <p>A short tagline goes here &mdash; one line about what you do.</p>
            </div>
        </div>
    </header>`;

const FOOTER = `
    <footer>
        <p>
            &copy; <time datetime="2026">2026</time> Matthias Adamsen &middot;
            <a href="https://github.com/">GitHub</a> &middot;
            <a href="mailto:you@example.com">Email</a>
        </p>
    </footer>`;

const navFor = (current) => {
    const links = [
        { href: '/', label: 'Home' },
        { href: '/about', label: 'About me' },
        { href: '/projects', label: 'Notable projects' },
        { href: '/books', label: 'Book reviews' },
    ];
    return `
    <nav>
        ${links
            .filter((l) => !(current === 'home' && l.href === '/'))
            .map((l) => `<a href="${l.href}">${l.label}</a>`)
            .join('\n        ')}
    </nav>`;
};

const page = ({ title, current, body }) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>${HEAD_LINKS}
</head>
<body>${HEADER}
${navFor(current)}

    <main>
${body}
    </main>
${FOOTER}
</body>
</html>`;

const homePage = page({
    title: 'Matthias Adamsen',
    current: 'home',
    body: `        <p>
            Welcome. Use the links above to read more about me, my projects,
            and books I&rsquo;ve been reading.
        </p>`,
});

const aboutPage = page({
    title: 'About me — Matthias Adamsen',
    current: 'about',
    body: `        <section id="about">
            <h2>About me</h2>
            <p>
                Write a couple of sentences about who you are, what you care about,
                and what you&rsquo;re working on.
            </p>
            <p>
                <strong>Currently:</strong>
                <em>Add your current role and company here.</em>
            </p>
            <p>
                You can reach me at
                <a href="mailto:you@example.com">you@example.com</a>.
            </p>
        </section>`,
});

const projectsPage = page({
    title: 'Notable projects — Matthias Adamsen',
    current: 'projects',
    body: `        <section id="projects">
            <h2>Notable projects</h2>

            <article>
                <h3>Project name</h3>
                <p class="meta">2026 &middot; <a href="#">link</a> &middot; <a href="#">source</a></p>
                <p>
                    One or two sentences on what the project is, what you built,
                    and what was interesting about it.
                </p>
            </article>

            <article>
                <h3>Another project</h3>
                <p class="meta">2025 &middot; <a href="#">link</a></p>
                <p>
                    Short description. Duplicate this &lt;article&gt; block to add more.
                </p>
            </article>
        </section>`,
});

const booksPage = page({
    title: 'Book reviews — Matthias Adamsen',
    current: 'books',
    body: `        <section id="books">
            <h2>Book reviews</h2>

            <article>
                <h3><cite>Book Title</cite> &mdash; Author Name</h3>
                <p class="meta">Read May 2026 &middot; &#9733;&#9733;&#9733;&#9733;&#9734;</p>
                <p>
                    A few sentences on what you took away from the book.
                    What surprised you? Who would you recommend it to?
                </p>
            </article>

            <article>
                <h3><cite>Another Book</cite> &mdash; Another Author</h3>
                <p class="meta">Read April 2026 &middot; &#9733;&#9733;&#9733;&#9734;&#9734;</p>
                <p>Short review.</p>
            </article>
        </section>`,
});

const cssContent = `:root {
    color-scheme: light;
}

html, body {
    background: #e8dcc4;
    color: #000;
}

a {
    color: #000;
}

.profile-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    text-align: left;
}

.profile-photo {
    flex: 0 0 auto;
    width: 96px;
    height: 96px;
    border-radius: 50%;
    object-fit: cover;
}

.profile-title h1 {
    margin: 0;
}

.profile-title p {
    margin: 0.25rem 0 0;
}

.meta {
    opacity: 0.7;
    font-size: 0.9em;
    margin-top: -0.25rem;
}

@media (max-width: 480px) {
    .profile-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }
}`;

const routes = {
    '/': homePage,
    '/index.html': homePage,
    '/about': aboutPage,
    '/about.html': aboutPage,
    '/projects': projectsPage,
    '/projects.html': projectsPage,
    '/books': booksPage,
    '/books.html': booksPage,
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    const headers = new Headers({
      'Cache-Control': 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    });

    if (routes[pathname]) {
      headers.set('Content-Type', 'text/html; charset=utf-8');
      return new Response(routes[pathname], { headers });
    }

    if (pathname === '/styles.css') {
      headers.set('Content-Type', 'text/css; charset=utf-8');
      return new Response(cssContent, { headers });
    }

    return new Response('Not Found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain' }
    });
  },
};
