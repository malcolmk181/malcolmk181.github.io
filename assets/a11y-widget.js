/*
 * Shared accessibility settings widget: theme (system/light/dark) and text
 * size. Include with a plain, blocking <script src="/assets/a11y-widget.js">
 * near the top of <head> so the theme/size apply before first paint.
 *
 * Host pages must:
 *   - Define colors that react to :root[data-theme="light"|"dark"] (and
 *     fall back to @media (prefers-color-scheme: dark) when unset).
 *   - Size text with rem/em units so the text-size control has an effect.
 */
(function () {
  "use strict";

  var THEME_KEY = "a11y-theme";
  var SCALE_KEY = "a11y-font-scale";
  var SCALES = { small: "87.5%", normal: "100%", large: "115%", "x-large": "130%" };
  var root = document.documentElement;

  function readStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // Ignore storage errors (e.g. private browsing); setting still applies for this page view.
    }
  }

  function applyTheme(theme) {
    if (theme === "light" || theme === "dark") {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme");
    }
  }

  function applyFontScale(scale) {
    root.style.fontSize = SCALES[scale] || SCALES.normal;
  }

  // Apply immediately (before body renders) to avoid a flash of the wrong theme/size.
  var storedTheme = readStorage(THEME_KEY) || "system";
  var storedScale = readStorage(SCALE_KEY) || "normal";
  applyTheme(storedTheme);
  applyFontScale(storedScale);

  function buildWidget() {
    var style = document.createElement("style");
    style.textContent =
      ".a11y-widget-btn{position:fixed;top:.75rem;right:.75rem;z-index:1000;" +
      "font:1rem/1.2 system-ui,-apple-system,\"Segoe UI\",sans-serif;background:#fff;color:#1a1a1a;" +
      "border:1px solid #767676;border-radius:999px;padding:.4rem .9rem;cursor:pointer}" +
      "@media (prefers-color-scheme:dark){.a11y-widget-btn{background:#1e1e1e;color:#f0f0f0;border-color:#999}}" +
      ':root[data-theme="light"] .a11y-widget-btn{background:#fff;color:#1a1a1a;border-color:#767676}' +
      ':root[data-theme="dark"] .a11y-widget-btn{background:#1e1e1e;color:#f0f0f0;border-color:#999}' +
      ".a11y-widget-btn:hover,.a11y-widget-btn:focus-visible{border-color:#3355dd}" +
      ".a11y-widget-dialog{font:1rem/1.5 system-ui,-apple-system,\"Segoe UI\",sans-serif;color:#1a1a1a;" +
      "background:#fff;border:1px solid #767676;border-radius:.5rem;padding:1.25rem;max-width:20rem}" +
      ".a11y-widget-dialog::backdrop{background:rgba(0,0,0,.4)}" +
      "@media (prefers-color-scheme:dark){.a11y-widget-dialog{background:#1e1e1e;color:#f0f0f0;border-color:#999}}" +
      ':root[data-theme="light"] .a11y-widget-dialog{background:#fff;color:#1a1a1a;border-color:#767676}' +
      ':root[data-theme="dark"] .a11y-widget-dialog{background:#1e1e1e;color:#f0f0f0;border-color:#999}' +
      ".a11y-widget-form h2{margin-top:0;font-size:1.1rem}" +
      ".a11y-widget-form fieldset{border:1px solid currentColor;border-radius:.375rem;margin:0 0 1rem;padding:.5rem .75rem}" +
      ".a11y-widget-form label{display:block;padding:.15rem 0}" +
      ".a11y-widget-form button{font:inherit;padding:.4rem 1rem;border-radius:999px;cursor:pointer}";
    document.head.appendChild(style);

    var button = document.createElement("button");
    button.type = "button";
    button.className = "a11y-widget-btn";
    button.setAttribute("aria-haspopup", "dialog");
    button.textContent = "Accessibility";

    var dialog = document.createElement("dialog");
    dialog.className = "a11y-widget-dialog";
    dialog.setAttribute("aria-label", "Accessibility settings");
    dialog.innerHTML =
      '<form method="dialog" class="a11y-widget-form">' +
      "<h2>Accessibility settings</h2>" +
      "<fieldset>" +
      "<legend>Theme</legend>" +
      '<label><input type="radio" name="a11y-theme" value="system"> System</label>' +
      '<label><input type="radio" name="a11y-theme" value="light"> Light</label>' +
      '<label><input type="radio" name="a11y-theme" value="dark"> Dark</label>' +
      "</fieldset>" +
      "<fieldset>" +
      "<legend>Text size</legend>" +
      '<label><input type="radio" name="a11y-scale" value="small"> Small</label>' +
      '<label><input type="radio" name="a11y-scale" value="normal"> Normal</label>' +
      '<label><input type="radio" name="a11y-scale" value="large"> Large</label>' +
      '<label><input type="radio" name="a11y-scale" value="x-large"> Extra large</label>' +
      "</fieldset>" +
      '<button type="submit">Done</button>' +
      "</form>";

    document.body.appendChild(button);
    document.body.appendChild(dialog);

    function syncControls() {
      var theme = readStorage(THEME_KEY) || "system";
      var scale = readStorage(SCALE_KEY) || "normal";
      var themeInput = dialog.querySelector('input[name="a11y-theme"][value="' + theme + '"]');
      if (themeInput) themeInput.checked = true;
      var scaleInput = dialog.querySelector('input[name="a11y-scale"][value="' + scale + '"]');
      if (scaleInput) scaleInput.checked = true;
    }

    button.addEventListener("click", function () {
      syncControls();
      dialog.showModal();
    });

    dialog.addEventListener("change", function (event) {
      var target = event.target;
      if (target.name === "a11y-theme") {
        applyTheme(target.value);
        writeStorage(THEME_KEY, target.value);
      } else if (target.name === "a11y-scale") {
        applyFontScale(target.value);
        writeStorage(SCALE_KEY, target.value);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildWidget);
  } else {
    buildWidget();
  }
})();
