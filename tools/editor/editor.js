/* In-page editor client. Injected only by the local edit server (npm run edit). */
(function () {
  "use strict";

  var STATE = window.__EDITOR__ || { page: "home", pages: [], config: {} };
  var main = document.querySelector("main");
  if (!main) return;

  var dirty = false;
  var mode = "visual"; // "visual" | "source"
  var lastRange = null; // saved caret position inside main (visual mode)
  var sourceArea = null;

  // ---- small helpers -----------------------------------------------------

  function el(tag, props, children) {
    var node = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        if (k === "class") node.className = props[k];
        else if (k === "html") node.innerHTML = props[k];
        else if (k === "text") node.textContent = props[k];
        else if (k.slice(0, 2) === "on")
          node.addEventListener(k.slice(2).toLowerCase(), props[k]);
        else node.setAttribute(k, props[k]);
      });
    }
    (children || []).forEach(function (c) {
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  function toast(msg) {
    var t = el("div", { class: "ed-toast", text: msg });
    document.body.appendChild(t);
    requestAnimationFrame(function () {
      t.classList.add("ed-show");
    });
    setTimeout(function () {
      t.classList.remove("ed-show");
      setTimeout(function () {
        t.remove();
      }, 250);
    }, 2200);
  }

  function api(path, opts) {
    return fetch("/_editor/" + path, opts).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error(j.error || "Request failed");
        return j;
      });
    });
  }

  function setDirty(v) {
    dirty = v;
    statusEl.textContent = v ? "● unsaved" : "saved";
    statusEl.classList.toggle("ed-dirty", v);
    saveBtn.disabled = !v;
  }

  // ---- selection tracking (so toolbar inserts land at the caret) ----------

  function saveRange() {
    var sel = window.getSelection();
    if (sel && sel.rangeCount && main.contains(sel.anchorNode)) {
      lastRange = sel.getRangeAt(0).cloneRange();
    }
  }

  function restoreRange() {
    main.focus();
    if (!lastRange) return null;
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(lastRange);
    return lastRange;
  }

  function insertNodeAtCaret(node) {
    restoreRange();
    var sel = window.getSelection();
    var range =
      sel.rangeCount && main.contains(sel.anchorNode)
        ? sel.getRangeAt(0)
        : null;
    if (!range) {
      main.appendChild(node);
    } else {
      range.deleteContents();
      range.insertNode(node);
      range.setStartAfter(node);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    saveRange();
    setDirty(true);
  }

  function insertHTMLAtCaret(html) {
    var tpl = document.createElement("template");
    tpl.innerHTML = html.trim();
    var frag = tpl.content;
    var last = frag.lastChild;
    insertNodeAtCaret(frag);
    if (last) lastRange = null; // caret tracking after fragment is unreliable; reset
  }

  // ---- visual <-> source mode --------------------------------------------

  function enterVisual() {
    mode = "visual";
    if (sourceArea) {
      sourceArea.remove();
      sourceArea = null;
    }
    main.style.display = "";
    main.setAttribute("contenteditable", "true");
    main.focus();
    modeBtn.textContent = "</> Source";
    setFormatButtonsEnabled(true);
  }

  function enterSource() {
    mode = "source";
    main.removeAttribute("contenteditable");
    main.style.display = "none";
    sourceArea = el("textarea", {
      class: "ed-source",
      spellcheck: "false",
      oninput: function () {
        setDirty(true);
      },
    });
    main.parentNode.insertBefore(sourceArea, main.nextSibling);
    sourceArea.value = "Loading…";
    api("source?page=" + encodeURIComponent(STATE.page)).then(function (j) {
      sourceArea.value = j.html;
    });
    modeBtn.textContent = "👁 Visual";
    setFormatButtonsEnabled(false);
  }

  function toggleMode() {
    var go = mode === "visual" ? enterSource : enterVisual;
    if (dirty) {
      if (
        !confirm(
          "You have unsaved changes. Switching editing mode will discard them. Continue?",
        )
      )
        return;
      setDirty(false);
    }
    go();
  }

  // ---- saving -------------------------------------------------------------

  function save() {
    var payload;
    if (mode === "source") {
      payload = { page: STATE.page, html: sourceArea.value, mode: "source" };
    } else {
      var clone = main.cloneNode(true);
      clone.removeAttribute("contenteditable");
      clone.removeAttribute("style");
      // strip empty style="" that execCommand sometimes leaves behind
      clone.querySelectorAll('[style=""]').forEach(function (n) {
        n.removeAttribute("style");
      });
      payload = { page: STATE.page, html: clone.innerHTML, mode: "visual" };
    }
    saveBtn.disabled = true;
    return api("save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function () {
        setDirty(false);
        toast("Saved ✓");
      })
      .catch(function (e) {
        saveBtn.disabled = false;
        toast("Save failed: " + e.message);
        throw e;
      });
  }

  // ---- commit & push ------------------------------------------------------

  function commitChanges() {
    modal(
      "Commit & push",
      [
        {
          name: "message",
          label: "Commit message",
          placeholder: "Describe your changes",
          hint: "Runs: git add -A && git commit -m … && git push",
        },
      ],
      function (v, ui) {
        if (!v.message) return ui.error("Enter a commit message.");
        var run = function () {
          return api("commit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: v.message }),
          }).then(function (res) {
            ui.close();
            if (res.pushed) {
              toast("Committed & pushed ✓");
            } else {
              toast("Committed ✓ — push failed (see console)");
              console.warn("[editor] git push failed:\n" + res.detail);
            }
          });
        };
        // Persist any in-progress edits before committing.
        return dirty ? save().then(run) : run();
      },
    );
  }

  // ---- formatting ---------------------------------------------------------

  function exec(cmd, value) {
    if (mode !== "visual") return;
    restoreRange();
    document.execCommand(cmd, false, value || null);
    saveRange();
    setDirty(true);
  }

  // ---- modal --------------------------------------------------------------

  function modal(title, fields, onSubmit) {
    saveRange();
    var inputs = {};
    var errEl = el("div", { class: "ed-err" });
    var form = el("form");
    fields.forEach(function (f) {
      var input = el("input", {
        type: f.type || "text",
        placeholder: f.placeholder || "",
        value: f.value || "",
      });
      inputs[f.name] = input;
      form.appendChild(el("label", { text: f.label }));
      form.appendChild(input);
      if (f.hint) form.appendChild(el("div", { class: "ed-hint", text: f.hint }));
      if (f.oninput) input.addEventListener("input", function () {
        f.oninput(inputs);
      });
    });

    var backdrop = el("div", { class: "ed-modal-backdrop ed-show" });
    function close() {
      backdrop.remove();
    }
    var box = el("div", { class: "ed-modal" }, [
      el("h2", { text: title }),
      form,
      errEl,
      el("div", { class: "ed-actions" }, [
        el("button", {
          type: "button",
          class: "ed-btn",
          text: "Cancel",
          onclick: close,
        }),
        el("button", { type: "submit", class: "ed-btn ed-primary", text: "OK" }),
      ]),
    ]);
    form.appendChild(box.querySelector(".ed-actions"));
    backdrop.appendChild(box);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var values = {};
      Object.keys(inputs).forEach(function (k) {
        values[k] = inputs[k].value.trim();
      });
      var maybe = onSubmit(values, {
        close: close,
        error: function (m) {
          errEl.textContent = m;
        },
      });
      if (maybe && typeof maybe.then === "function") {
        maybe.catch(function (err) {
          errEl.textContent = err.message;
        });
      }
    });
    document.body.appendChild(backdrop);
    backdrop.addEventListener("mousedown", function (e) {
      if (e.target === backdrop) close();
    });
    var first = form.querySelector("input");
    if (first) first.focus();
  }

  // ---- insert: link / image / embed --------------------------------------

  function insertLink() {
    if (mode !== "visual") return;
    var sel = window.getSelection();
    var hasText = sel && !sel.isCollapsed && main.contains(sel.anchorNode);
    saveRange();
    modal(
      "Insert link",
      [
        { name: "url", label: "URL", type: "url", placeholder: "https://…" },
        hasText
          ? null
          : { name: "text", label: "Link text", placeholder: "click here" },
      ].filter(Boolean),
      function (v, ui) {
        if (!v.url) return ui.error("Enter a URL.");
        restoreRange();
        if (hasText) {
          exec("createLink", v.url);
        } else {
          insertHTMLAtCaret(
            '<a href="' + escapeAttr(v.url) + '">' + escapeHTML(v.text || v.url) + "</a>",
          );
        }
        ui.close();
      },
    );
  }

  function insertImageURL() {
    saveRange();
    modal(
      "Insert image by URL",
      [
        { name: "url", label: "Image URL", type: "url", placeholder: "https://…" },
        { name: "alt", label: "Alt text", placeholder: "description" },
      ],
      function (v, ui) {
        if (!v.url) return ui.error("Enter an image URL.");
        insertHTMLAtCaret(
          '<img src="' + escapeAttr(v.url) + '" alt="' + escapeAttr(v.alt) + '" />',
        );
        ui.close();
      },
    );
  }

  function embedHTMLForURL(url) {
    var u = url.trim();
    var yt = u.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/,
    );
    if (yt) {
      return (
        '<div class="embed-responsive"><iframe src="https://www.youtube.com/embed/' +
        yt[1] +
        '" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>'
      );
    }
    var vimeo = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeo) {
      return (
        '<div class="embed-responsive"><iframe src="https://player.vimeo.com/video/' +
        vimeo[1] +
        '" title="Vimeo video" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>'
      );
    }
    if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(u)) {
      var type = /\.webm/i.test(u)
        ? "video/webm"
        : /\.ogg/i.test(u)
          ? "video/ogg"
          : "video/mp4";
      return (
        '<video class="project-video" controls preload="metadata"><source src="' +
        escapeAttr(u) +
        '" type="' +
        type +
        '" /></video>'
      );
    }
    // generic iframe embed
    return (
      '<div class="embed-responsive"><iframe src="' +
      escapeAttr(u) +
      '" title="Embedded content" loading="lazy" allowfullscreen></iframe></div>'
    );
  }

  function insertEmbed() {
    saveRange();
    modal(
      "Embed video or page",
      [
        {
          name: "url",
          label: "URL",
          type: "url",
          placeholder: "YouTube, Vimeo, .mp4/.webm, or any URL",
          hint: "YouTube/Vimeo links become responsive players. Direct video files become a <video>. Anything else becomes an iframe.",
        },
      ],
      function (v, ui) {
        if (!v.url) return ui.error("Enter a URL.");
        insertHTMLAtCaret(embedHTMLForURL(v.url));
        ui.close();
      },
    );
  }

  // ---- uploads (drag-drop + picker) --------------------------------------

  function uploadFile(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = function () {
        reject(new Error("Could not read file"));
      };
      reader.onload = function () {
        var base64 = String(reader.result).split(",")[1];
        api("upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: file.name, dataBase64: base64 }),
        })
          .then(resolve)
          .catch(reject);
      };
      reader.readAsDataURL(file);
    });
  }

  function htmlForUploadedFile(file, url) {
    if (/^image\//.test(file.type)) {
      return '<img src="' + escapeAttr(url) + '" alt="" />';
    }
    if (/^video\//.test(file.type)) {
      return (
        '<video class="project-video" controls preload="metadata"><source src="' +
        escapeAttr(url) +
        '" type="' +
        escapeAttr(file.type) +
        '" /></video>'
      );
    }
    return '<a href="' + escapeAttr(url) + '">' + escapeHTML(file.name) + "</a>";
  }

  function handleDroppedFiles(files, dropRange) {
    if (mode !== "visual") {
      toast("Switch to Visual mode to drop files into the page.");
      return;
    }
    if (dropRange) {
      lastRange = dropRange;
    }
    var queue = Array.prototype.slice.call(files);
    (function next() {
      if (!queue.length) {
        toast("Added to public/ ✓");
        return;
      }
      var file = queue.shift();
      uploadFile(file)
        .then(function (j) {
          insertHTMLAtCaret(htmlForUploadedFile(file, j.url));
          next();
        })
        .catch(function (e) {
          toast("Upload failed: " + e.message);
        });
    })();
  }

  function pickAndUpload(accept) {
    var input = el("input", { type: "file", accept: accept || "" });
    input.style.display = "none";
    document.body.appendChild(input);
    input.addEventListener("change", function () {
      if (input.files.length) handleDroppedFiles(input.files, lastRange);
      input.remove();
    });
    input.click();
  }

  // ---- pages: switch / new ------------------------------------------------

  function switchPage(slug) {
    if (dirty && !confirm("Discard unsaved changes and switch page?")) {
      pageSelect.value = STATE.page;
      return;
    }
    var p = STATE.pages.find(function (x) {
      return x.slug === slug;
    });
    if (p) location.href = p.path;
  }

  function slugify(s) {
    return s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function newPage() {
    modal(
      "Add a new page",
      [
        {
          name: "nav",
          label: "Nav label (shown in the menu)",
          placeholder: "e.g. Photography",
          oninput: function (inputs) {
            if (!inputs.slug.dataset.touched)
              inputs.slug.value = slugify(inputs.nav.value);
          },
        },
        {
          name: "slug",
          label: "URL slug",
          placeholder: "photography",
          hint: "The page will live at /slug. Lowercase, dashes only.",
        },
      ],
      function (v, ui) {
        if (!v.nav) return ui.error("Give the page a nav label.");
        if (!v.slug) return ui.error("Give the page a URL slug.");
        return api("new-page", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: v.slug,
            nav: v.nav,
            title: v.nav + " — {{name}}",
          }),
        }).then(function (res) {
          ui.close();
          location.href = res.path;
        });
      },
    );
  }

  // ---- site info ----------------------------------------------------------

  function editSite() {
    api("site").then(function (j) {
      var c = j.config;
      modal(
        "Site info",
        [
          { name: "name", label: "Name", value: c.name },
          { name: "tagline", label: "Tagline", value: c.tagline },
          { name: "email", label: "Email", type: "email", value: c.email },
          { name: "github", label: "GitHub URL", type: "url", value: c.github },
          { name: "linkedin", label: "LinkedIn URL", type: "url", value: c.linkedin },
        ],
        function (v, ui) {
          return api("site", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ config: v }),
          }).then(function () {
            ui.close();
            toast("Site info saved ✓");
          });
        },
      );
    });
  }

  // ---- escaping -----------------------------------------------------------

  function escapeHTML(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  function escapeAttr(s) {
    return escapeHTML(s).replace(/"/g, "&quot;");
  }

  // ---- build the toolbar --------------------------------------------------

  var statusEl = el("div", { class: "ed-status", text: "saved" });
  var saveBtn = el("button", {
    class: "ed-btn ed-primary",
    text: "Save",
    disabled: "",
    onclick: save,
  });
  var modeBtn = el("button", {
    class: "ed-btn",
    text: "</> Source",
    onclick: toggleMode,
  });

  var formatBtns = [];
  function fmtBtn(label, title, cmd, value) {
    var b = el("button", {
      class: "ed-btn",
      title: title,
      html: label,
      onclick: function () {
        exec(cmd, value);
      },
    });
    formatBtns.push(b);
    return b;
  }
  function setFormatButtonsEnabled(on) {
    formatBtns.forEach(function (b) {
      b.disabled = !on;
      b.style.opacity = on ? "" : "0.4";
    });
  }

  var pageSelect = el(
    "select",
    {
      class: "ed-select",
      title: "Switch page",
      onchange: function () {
        switchPage(pageSelect.value);
      },
    },
    STATE.pages.map(function (p) {
      var o = el("option", { value: p.slug, text: p.nav });
      if (p.slug === STATE.page) o.selected = true;
      return o;
    }),
  );

  var bar = el("div", { class: "ed-bar" }, [
    el("div", { class: "ed-group" }, [
      el("strong", { text: "✏️" }),
      pageSelect,
      el("button", { class: "ed-btn", text: "+ Page", title: "Add a new page", onclick: newPage }),
    ]),
    el("div", { class: "ed-group" }, [
      fmtBtn("<b>B</b>", "Bold (Cmd/Ctrl+B)", "bold"),
      fmtBtn("<i>I</i>", "Italic (Cmd/Ctrl+I)", "italic"),
      fmtBtn("H2", "Heading", "formatBlock", "<h2>"),
      fmtBtn("H3", "Subheading", "formatBlock", "<h3>"),
      fmtBtn("¶", "Paragraph", "formatBlock", "<p>"),
      fmtBtn("• List", "Bulleted list", "insertUnorderedList"),
    ]),
    el("div", { class: "ed-group" }, [
      el("button", { class: "ed-btn", text: "🔗 Link", onclick: insertLink }),
      el("button", {
        class: "ed-btn",
        text: "🖼 Image",
        title: "Insert image (URL or upload)",
        onclick: function () {
          chooseImage();
        },
      }),
      el("button", { class: "ed-btn", text: "▶ Embed", title: "Embed a video or page", onclick: insertEmbed }),
    ]),
    el("div", { class: "ed-group" }, [
      el("button", { class: "ed-btn", text: "⚙ Site", title: "Edit site info", onclick: editSite }),
      modeBtn,
    ]),
    el("div", { class: "ed-spacer" }),
    statusEl,
    saveBtn,
    el("button", {
      class: "ed-btn",
      text: "⬆ Commit",
      title: "git add -A && git commit && git push",
      onclick: commitChanges,
    }),
  ]);
  document.body.appendChild(bar);

  function chooseImage() {
    modal(
      "Insert image",
      [
        {
          name: "url",
          label: "Image URL (or use upload below)",
          type: "url",
          placeholder: "https://…",
        },
        { name: "alt", label: "Alt text", placeholder: "description" },
      ],
      function (v, ui) {
        if (!v.url) return ui.error("Enter a URL, or Cancel and drag a file onto the page.");
        insertHTMLAtCaret(
          '<img src="' + escapeAttr(v.url) + '" alt="' + escapeAttr(v.alt) + '" />',
        );
        ui.close();
      },
    );
    // Offer a quick upload shortcut alongside the URL modal.
    setTimeout(function () {
      var actions = document.querySelector(".ed-modal .ed-actions");
      if (actions)
        actions.insertBefore(
          el("button", {
            type: "button",
            class: "ed-btn",
            text: "Upload…",
            onclick: function () {
              document.querySelector(".ed-modal-backdrop").remove();
              pickAndUpload("image/*");
            },
          }),
          actions.firstChild,
        );
    }, 0);
  }

  // ---- drag & drop --------------------------------------------------------

  var dropOverlay = el("div", { class: "ed-drop", text: "Drop to add to your page" });
  document.body.appendChild(dropOverlay);
  var dragDepth = 0;
  window.addEventListener("dragenter", function (e) {
    if (e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types, "Files") !== -1) {
      dragDepth++;
      dropOverlay.classList.add("ed-show");
    }
  });
  window.addEventListener("dragover", function (e) {
    e.preventDefault();
  });
  window.addEventListener("dragleave", function () {
    dragDepth = Math.max(0, dragDepth - 1);
    if (!dragDepth) dropOverlay.classList.remove("ed-show");
  });
  window.addEventListener("drop", function (e) {
    e.preventDefault();
    dragDepth = 0;
    dropOverlay.classList.remove("ed-show");
    if (!e.dataTransfer || !e.dataTransfer.files.length) return;
    var range = null;
    if (document.caretRangeFromPoint)
      range = document.caretRangeFromPoint(e.clientX, e.clientY);
    if (range && !main.contains(range.startContainer)) range = null;
    handleDroppedFiles(e.dataTransfer.files, range);
  });

  // ---- keyboard, edits, navigation guards --------------------------------

  document.addEventListener("selectionchange", function () {
    if (mode === "visual") saveRange();
  });
  main.addEventListener("input", function () {
    if (mode === "visual") setDirty(true);
  });
  main.addEventListener("keyup", saveRange);
  main.addEventListener("mouseup", saveRange);

  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      if (dirty) save();
    }
  });

  window.addEventListener("beforeunload", function (e) {
    if (dirty) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  // ---- live reload --------------------------------------------------------

  try {
    var es = new EventSource("/_editor/reload-stream");
    es.addEventListener("reload", function () {
      if (!dirty) location.reload();
    });
  } catch (e) {
    /* no live reload — not fatal */
  }

  // ---- go -----------------------------------------------------------------

  enterVisual();
})();
