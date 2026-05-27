const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Matthias Adamsen</title>
    <link rel="stylesheet" type="text/css" href="https://codeberg.org/Freedom-to-Write/readable.css/raw/branch/main/readable.min.css">
    <link rel="stylesheet" type="text/css" href="/styles.css">
</head>
<body>
    <header>
        <div class="profile-header">
            <img class="profile-photo" src="/profile.jpg" alt="Photo of Matthias Adamsen">
            <div class="profile-title">
                <h1>Matthias Adamsen</h1>
                <p>A short tagline goes here &mdash; one line about what you do.</p>
            </div>
        </div>
    </header>

    <nav>
        <a href="#about">About me</a>
        <a href="#projects">Notable projects</a>
        <a href="#books">Book reviews</a>
    </nav>

    <main>
        <section id="about">
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
        </section>

        <section id="projects">
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
        </section>

        <section id="books">
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
        </section>
    </main>

    <footer>
        <p>
            &copy; <time datetime="2026">2026</time> Matthias Adamsen &middot;
            <a href="https://github.com/">GitHub</a> &middot;
            <a href="mailto:you@example.com">Email</a>
        </p>
    </footer>
</body>
</html>`;

const cssContent = `.profile-header {
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

    if (pathname === '/' || pathname === '/index.html') {
      headers.set('Content-Type', 'text/html; charset=utf-8');
      return new Response(htmlContent, { headers });
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
