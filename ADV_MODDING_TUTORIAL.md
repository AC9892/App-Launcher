# Advanced Modding Tutorial

This guide is for the Advanced Editors in Home Launcher:

- Custom Effect: CSS only.
- Embedded HTML: adds custom markup into the launcher.
- Embedded JavaScript: runs trusted custom scripts inside the launcher.

Keep JavaScript small and only run code you trust.

## Main CSS Classes

Use these in the Custom Effect CSS editor.

| Selector | What it controls |
| --- | --- |
| `body` | Whole app page, background effects, global overlays. |
| `.app-shell` | Main app frame. |
| `.panel` | Main view panels. |
| `.panel-header` | Top title row and action buttons. |
| `.launcher-groups` | Container for all app groups. |
| `.quick-groups` | Pinned, recent, and most-used rows. |
| `.quick-group` | One quick group section. |
| `.launcher-group` | One normal app group section. |
| `.group-header` | Group title and app count. |
| `.launcher-grid` | Grid that holds app cards. |
| `.launcher-card` | One launchable app card. |
| `.launcher-card-icon` | App icon, image, or initials. |
| `.launcher-card-actions` | Pin and Edit buttons on a card. |
| `.launcher-card-meta` | Row that holds labels and tags. |
| `.launcher-pill` | Kind, config file, and tag labels. |
| `.warning-pill` | Warning label on a card. |
| `.dragging` | Card being dragged during reorder. |
| `.custom-html-root` | Where Embedded HTML is inserted. |
| `.status-bar` | Bottom status text. |

## Useful Theme Variables

These are the safest variables to use in custom CSS because they follow the current theme.

| Variable | What it controls |
| --- | --- |
| `--page-background` | Whole page background. |
| `--primary-background` | Main panel background. |
| `--launcher-card-background` | App card background. |
| `--surface` | Normal surface color. |
| `--surface-soft` | Softer panel color. |
| `--surface-strong` | Stronger panel color. |
| `--text` | Main text color. |
| `--muted` | Secondary text color. |
| `--accent` | Main accent color. |
| `--accent-strong` | Brighter accent color. |
| `--line` | Normal border color. |
| `--line-strong` | Strong border color. |
| `--ok` | Success color. |
| `--warn` | Warning color. |
| `--error` | Error color. |
| `--font-body` | Main font. |
| `--font-display` | Header/title font. |

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
