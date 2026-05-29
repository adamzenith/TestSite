// Page manifest — single source of truth for routes, nav order, and titles.
// The editor (npm run edit) reads and writes this file. You can also hand-edit it.
// `title` is interpolated like page bodies, so {{name}} and other config vars work here.
// Order controls the order links appear in the nav bar.
export const pageList = [
  { slug: "home", path: "/", nav: "Home", title: "{{name}}" },
  { slug: "about", path: "/about", nav: "About me", title: "About me — {{name}}" },
  { slug: "projects", path: "/projects", nav: "Notable projects", title: "Notable projects — {{name}}" },
  { slug: "books", path: "/books", nav: "Favorite books", title: "Favorite books — {{name}}" },
  { slug: "blogs", path: "/blogs", nav: "Blogs", title: "Blogs — {{name}}" },
];
