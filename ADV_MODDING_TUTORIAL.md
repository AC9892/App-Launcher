# Advanced Modding Tutorial

This guide is for the Advanced Editors in App Launcher:

- Custom Effect: CSS only.
- Embedded HTML: adds custom markup into the launcher.
- Embedded JavaScript: runs trusted custom scripts inside the launcher.

Keep JavaScript small and only run code you trust.

Advanced editors include autosave, imports, pop-out windows, line numbers, word wrap, and syntax highlighting for CSS, HTML, and JavaScript.

## Class And Variable Reference

See `ADV_EDITOR_CLASSES.md` for the full selector reference, body state classes, theme variables, editor token classes, modal classes, and modding safety notes.

## CSS Examples

### Make app cards stand out

```css
.launcher-card {
  background: linear-gradient(135deg, var(--launcher-card-background), #111820);
  border-color: var(--accent);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.28);
}

.launcher-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent-strong);
}
```

### Change icon styling

```css
.launcher-card-icon {
  border: 1px solid var(--accent);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}
```

### Change tag pills

```css
.launcher-pill {
  color: var(--accent-strong);
  border-color: var(--accent);
  background: rgba(122, 162, 255, 0.08);
}
```

### Add a custom screen effect

```css
body::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    radial-gradient(circle at top right, rgba(122, 162, 255, 0.16), transparent 42%),
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: auto, 100% 4px;
}
```

### Hide metadata pills

```css
.launcher-card-meta {
  display: none;
}
```

### Restyle the card delete button

```css
.launcher-card-delete {
  border-color: var(--error);
  color: var(--error);
  background: rgba(241, 141, 124, 0.12);
}
```

## Embedded HTML Examples

Embedded HTML is inserted into `.custom-html-root`.

### Add a small mod badge

```html
<div class="mod-badge">Custom mod active</div>
```

Use CSS to style it:

```css
.mod-badge {
  position: fixed;
  right: 18px;
  bottom: 44px;
  z-index: 5;
  padding: 8px 10px;
  border: 1px solid var(--line-strong);
  border-radius: 8px;
  background: var(--surface-strong);
  color: var(--text);
  font: 0.82rem/1 var(--font-body);
}
```

## Embedded JavaScript Examples

Embedded JavaScript can inspect and change the launcher page.

### Count visible app cards

```js
const cards = document.querySelectorAll(".launcher-card");
document.body.dataset.modCardCount = String(cards.length);
```

### Add a class to cards with warning pills

```js
document.querySelectorAll(".launcher-card").forEach((card) => {
  if (card.querySelector(".warning-pill")) {
    card.classList.add("has-warning");
  }
});
```

Then style it in CSS:

```css
.launcher-card.has-warning {
  border-color: var(--warn);
}
```

### Add a simple clock badge

HTML:

```html
<div id="mod-clock" class="mod-clock"></div>
```

CSS:

```css
.mod-clock {
  position: fixed;
  left: 18px;
  bottom: 44px;
  z-index: 5;
  color: var(--muted);
  font: 0.82rem/1 var(--font-body);
}
```

JavaScript:

```js
const clock = document.querySelector("#mod-clock");

function updateClock() {
  if (clock) {
    clock.textContent = new Date().toLocaleTimeString();
  }
}

updateClock();
setInterval(updateClock, 1000);
```

## Practical Notes

- Use `var(--accent)` and other theme variables when possible so mods still match theme presets.
- Use `pointer-events: none` on visual overlays so they do not block app cards.
- Keep overlays on a low `z-index` unless they must sit above the launcher.
- Use `.custom-html-root` for HTML widgets.
- Use `document.querySelector` and `document.querySelectorAll` for JavaScript mods.
- Avoid deleting built-in elements with JavaScript unless you know you can recover them.
- The app uses `Confg/AppIcon.ico` first and `Confg/AppIcon.png` second for runtime window and tray icons.
- The real `.exe` icon is a packaging concern and usually needs a proper `.ico` file.
