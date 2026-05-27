const HEAD_LINKS = `
    <link rel="stylesheet" type="text/css" href="/readable.min.css">
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

const readableCss = `/* readable.css v1.1.0, licensed 0BSD */
html,html[data-font-family="serif"]{--font-family:serif}html[data-font-family="sans-serif"]{--font-family:sans-serif}html[data-font-family="monospace"]{--font-family:monospace}html,html[data-theme="light"]{--background-color:snow;--color:#000}html[data-high-contrast="on"],html[data-theme="light"][data-high-contrast="on"]{--background-color:#fff}html[data-theme="dark"]{--background-color:#1f272d;--color:#fff}html[data-theme="dark"][data-high-contrast="on"]{--background-color:#000}@media (prefers-color-scheme:dark){html{--background-color:#222830;--color:#fff}html[data-high-contrast="on"]{--background-color:#000}}@media (prefers-contrast:more){:is(html,html[data-theme="light"]):not([data-high-contrast="off"]){--background-color:#fff}html[data-theme="dark"]:not([data-high-contrast="off"]){--background-color:#000}}:root{--column-width:67ch;--form-width:50ch;--line-width:.125rem;--line-height:1.5;--one-line:calc(var(--line-height) * 1rem);--half-line:calc(var(--one-line) * 0.5);font-family:var(--font-family);background-color:var(--background-color);color:var(--color)}a{color:inherit}a:active{color:red}header,footer,h1,h2{text-align:center}footer:not(.exclude){border-top:var(--line-width) solid}summary{cursor:pointer}blockquote:not(.exclude){padding-left:var(--one-line);border-left:var(--line-width) solid}ul,ol{padding-left:calc(var(--line-height) * 2rem)}:is(body,article,main,figure)>:is(img,video):not(.exclude){max-width:100%}figure:not(.exclude){text-align:center}figure:not(.exclude)>*+figcaption{margin-top:0;font-style:italic}article aside:not(.exclude){border:var(--line-width) solid;padding:0 var(--one-line);border-radius:var(--half-line)}pre{max-width:100%;overflow:auto}hr{color:inherit;border:0;border-top:var(--line-width) solid}p,ul,ol,figcaption,nav,td,th,label{line-height:var(--line-height)}h1,h2,h3,h4,h5,h6,p,blockquote,hr,footer,header,nav,figure,figcaption,:is(ul,ol):not(li>*),:is(body,article,main)>:is(img,video,details):not(.exclude),table,article>aside,article>aside{margin:var(--one-line) 0}header h1{font-weight:400}h1,h2{line-height:calc(var(--line-height) * 2rem)}h1{font-size:2.5rem}h2{font-size:1.75rem}h3,h4,h5,h6{line-height:var(--one-line);padding-top:calc(var(--line-height) * 0.75rem);margin-bottom:calc(var(--line-height) * 0.25rem)}:is(h3,h4,h5,h6)+*{margin-top:0}nav:not(.exclude:not([data-style]),[data-style="none"]){text-align:center;border-width:var(--line-width) 0;border-style:solid;line-height:var(--line-height);display:flex;flex-flow:row wrap}nav:not(.exclude:not([data-style]),[data-style="none"])>*{flex-grow:1;margin:calc((var(--line-height) * 0.5rem) - var(--line-width)) var(--half-line);text-transform:uppercase}nav[data-style="blockout"],nav:is([data-style="boxes"],[data-style="roundesque"]) a:is(:hover,:focus){background-color:var(--color);color:var(--background-color)}nav[data-style="blockout"] a{text-decoration:none}nav[data-style="blockout"] a:is(:hover,:focus){background-color:var(--background-color);color:var(--color)}nav[data-style]:is([data-style="boxes"],[data-style="roundesque"]){border:0}nav:is([data-style="boxes"],[data-style="roundesque"]) a{text-decoration:none;border:var(--line-width) solid}nav[data-style="roundesque"] a{border-radius:calc(0.25 * var(--one-line))}@media (prefers-reduced-motion:no-preference){nav[data-style="classy"] span>a{text-decoration:none;display:inline-block}nav[data-style="classy"] span>a::after{content:'';width:0;height:var(--line-width);display:block;background:var(--color);transition:150ms}nav[data-style="classy"] span>a:is(:hover,:focus)::after{width:100%}}body{margin:0 auto;width:min(95%,var(--column-width))}@media (min-width:70.5ch){[data-justify="on"] body{text-align:justify;text-justify:inter-character}}table:not(.exclude){display:block;width:100%;overflow:auto;border-collapse:collapse}table:not(.exclude) :is(td,th){padding:calc(var(--line-height) * 0.25rem);border:var(--line-width) solid}table:not(.exclude) td{word-wrap:break-word}form{max-width:var(--form-width)}form:not(.exclude) :is(label:not(input:is([type="checkbox"],[type="radio"])+label),input:not([type="checkbox"],[type="radio"]),textarea,select){display:block;margin:var(--half-line) 0}form:not(.exclude) :is(input:not([type="checkbox"],[type="radio"]),textarea,select),button{box-sizing:border-box;padding:var(--half-line);background:transparent;border:var(--line-width) solid;color:inherit;font:inherit;width:100%}button{width:initial}form:not(.exclude) label:not(input:is([type="checkbox"],[type="radio"])+label){font-weight:700}
`;

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
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    });

    if (routes[pathname]) {
      headers.set('Content-Type', 'text/html; charset=utf-8');
      headers.set('Cache-Control', 'public, max-age=300, must-revalidate');
      return new Response(routes[pathname], { headers });
    }

    if (pathname === '/styles.css') {
      headers.set('Content-Type', 'text/css; charset=utf-8');
      headers.set('Cache-Control', 'public, max-age=86400');
      return new Response(cssContent, { headers });
    }

    if (pathname === '/readable.min.css') {
      headers.set('Content-Type', 'text/css; charset=utf-8');
      headers.set('Cache-Control', 'public, max-age=86400');
      return new Response(readableCss, { headers });
    }

    return new Response('Not Found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain' }
    });
  },
};
