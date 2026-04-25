# Advanced Editor Classes And Variables

This file is the reference sheet for modders using App Launcher's Advanced Editors.

Use `ADV_MODDING_TUTORIAL.md` for examples. Use this file when you need selectors, body state classes, theme variables, and token classes.

`Applauncher Expo` may test new selectors or body classes before they are part of the stable release. Stable/release selectors should be confirmed in `AppLauncher Bak`.

## Theme Variables

These are the safest variables to use in custom CSS because they follow the active theme.

| Variable | What it controls |
| --- | --- |
| `--bg` | Base dark background. |
| `--page-background` | Whole page background. |
| `--primary-background` | Primary button and main panel background. |
| `--launcher-card-background` | App card background. |
| `--surface` | Normal surface color. |
| `--surface-soft` | Softer panel color. |
| `--surface-strong` | Stronger panel color. |
| `--line` | Normal border color. |
| `--line-strong` | Stronger border color. |
| `--text` | Main text color. |
| `--muted` | Secondary text color. |
| `--accent` | Main accent color. |
| `--accent-strong` | Brighter accent color. |
| `--ok` | Success color. |
| `--warn` | Warning color. |
| `--error` | Error/destructive color. |
| `--radius-lg` | Large border radius. |
| `--radius-md` | Medium border radius. |
| `--shadow` | Shared shadow value. |
| `--font-body` | Main app font. |
| `--font-display` | Header/title font. |

## Body State Classes

These classes are applied to `body` when modes/effects are active.

| Selector | Meaning |
| --- | --- |
| `body.app-vertical` | App is in vertical window mode. |
| `body.app-horizontal` | App is in horizontal window mode. |
| `body.cards-vertical` | Launcher cards use vertical grid layout. |
| `body.cards-horizontal` | Launcher cards use horizontal row layout. |
| `body.plain-primary-buttons` | Primary button highlight styling is disabled in Advanced Settings. |
| `body.effect-grid` | Subtle Grid effect is active. |
| `body.effect-scanlines` | Scanlines effect is active. |
| `body.effect-glow` | Glow effect is active. |
| `body.effect-glass` | Glass effect is active. |

## App Shell

| Selector | What it controls |
| --- | --- |
| `body` | Whole app page, background effects, global overlays. |
| `body::before` | Built-in theme effect layer. |
| `.app-shell` | Main app frame. |
| `.app-header` | Top app header. |
| `.app-header-tools` | Header tool area holding the Advanced Settings icon and badges. |
| `.icon-button` | Compact icon-sized button. |
| `.header-icon-button` | Borderless header icon button used for Advanced Settings. |
| `.app-view` | Main view containers. |
| `.panel` | Shared panel styling. |
| `.panel-header` | Top section header. |
| `.actions` | Header action button row. |
| `.status-bar` | Bottom app status bar. |
| `.hidden` | Utility class used to hide UI. |

## Launcher Views

| Selector | What it controls |
| --- | --- |
| `#launcher-view` | Main app launcher view. |
| `#advanced-settings-view` | Advanced Settings view. |
| `#customize-view` | Customize UI view. |
| `#advanced-editors-view` | Advanced Editors view. |
| `#toggle-advanced-settings-compact` | Header icon button that opens Advanced Settings. |
| `#advanced-settings-back-to-launcher` | Advanced Settings back button. |
| `#advanced-settings-open-customize` | Advanced Settings shortcut to Customize UI. |
| `#advanced-settings-open-editors` | Advanced Settings shortcut to Advanced Editors. |
| `#launcher-groups` | Normal app groups container. |
| `#quick-groups` | Pinned, recent, and most-used groups container. |
| `.launcher-groups` | Container for all normal app groups. |
| `.quick-groups` | Container for all quick groups. |
| `.launcher-group` | One normal app group section. |
| `.quick-group` | One quick group section. |
| `.group-header` | Group title and app count column. |
| `.group-header h3` | Group title text. |
| `.launcher-grid` | App card row/grid inside a group. |
| `.launcher-tools` | Search/filter toolbar. |
| `#app-search` | Search box. |
| `#tag-filter` | Tag filter dropdown. |
| `#clear-search` | Clear search button. |
| `.empty-state` | Empty or no-results panel. |
| `.result-card` | Validation/import/export result card. |
| `.note-card` | Informational note card. |
| `.config-path` | Config path text under the launcher title. |
| `.config-path-hidden` | Hidden config path state; preserves layout while hiding text. |

## App Cards

| Selector | What it controls |
| --- | --- |
| `.launcher-card` | Full app card. |
| `.launcher-card:hover` | Card hover state. |
| `.launcher-card.dragging` | Card while drag-reordering. |
| `.launcher-card-icon` | Icon/initials container. |
| `.launcher-card-icon.has-image` | Icon container when image is loaded. |
| `.launcher-card-icon img` | Actual icon image. |
| `.launcher-card strong` | App title. |
| `.launcher-card p` | App description. |
| `.launcher-card-actions` | Top-right card actions. |
| `.launcher-card-bottom-actions` | Bottom-right card actions. |
| `.launcher-card-favorite` | Pin button. |
| `.launcher-card-edit` | Edit button. |
| `.launcher-card-delete` | Delete button. |
| `.launcher-card-meta` | Pills/tags row. |
| `.launcher-pill` | Kind, config file, and tag labels. |
| `.warning-pill` | Warning label on a card. |

## Forms And Settings

| Selector | What it controls |
| --- | --- |
| `.settings-panel` | Settings container. |
| `.settings-actions` | Settings button row. |
| `.plain-primary-buttons .primary` | Normal-button styling applied to primary buttons when highlights are disabled. |
| `.add-app-panel` | Add/edit app form. |
| `.add-app-header` | Add/edit form header. |
| `.form-grid` | Form field grid. |
| `.form-actions` | Form button row. |
| `.field` | Standard labeled input wrapper. |
| `.checkbox-field` | Checkbox/toggle wrapper. |
| `.target-row` | Input plus browse button row. |
| `.wide-field` | Form field spanning wider layout. |
| `.compact-field` | Compact settings field. |
| `.command-fields` | Command-only form fields. |
| `.danger-button` | Destructive button styling. |
| `#app-kind` | App kind dropdown used by the add/edit form. |
| `#run-as-admin-field` | Run as administrator checkbox row. |
| `#delete-app` | Delete button in the edit form. |
| `#hide-to-tray` | Immediate hide-to-tray button. |
| `#app-orientation` | Main app orientation dropdown in Settings. |
| `#card-layout` | Launcher card flow/layout dropdown in Settings. |
| `#launch-on-startup` | Startup launch checkbox in Settings. |
| `#minimize-to-tray` | Minimize-to-tray checkbox in Settings. |
| `#advanced-customization` | Toggle that unlocks embedded HTML and JavaScript editors. |
| `#delete-confirmation` | Delete-confirmation checkbox in Settings. |
| `#import-font` | Button that imports a custom font file. |
| `#reset-font` | Button that clears the imported custom font. |
| `#close-to-tray` | Advanced Settings checkbox controlling whether X hides to tray. |
| `#show-config-path` | Advanced Settings checkbox controlling config path visibility. |
| `#highlight-primary-buttons` | Advanced Settings checkbox controlling primary button highlight styling. |

## Customize UI

| Selector | What it controls |
| --- | --- |
| `.customize-panel` | Main customize panel. |
| `.customize-grid` | Theme color control grid. |
| `.color-field` | Color input field. |
| `.theme-toggle` | Theme checkbox row. |
| `#theme-preset` | Theme preset dropdown. |
| `#theme-effect` | Visual effect dropdown. |
| `#theme-background` | Background color input. |
| `#theme-surface` | Surface color input. |
| `#theme-card` | Card color input. |
| `#theme-text` | Text color input. |
| `#theme-accent` | Accent color input. |

## Advanced Editors

| Selector | What it controls |
| --- | --- |
| `.advanced-editors-view` | Full Advanced Editors view. |
| `.advanced-editors-grid` | Advanced editor two-column layout. |
| `.custom-effect-panel` | CSS effect editor panel. |
| `.custom-code-panel` | HTML/JS editor panel. |
| `.code-editor-shell` | Editor frame. |
| `.line-numbers` | Editor line number column. |
| `.code-highlight` | Syntax-highlight overlay. |
| `.custom-html-root` | Where embedded HTML is inserted. |
| `#custom-effect-css` | Custom CSS/effect editor. |
| `#custom-html-code` | Embedded HTML editor. |
| `#custom-js-code` | Embedded JavaScript editor. |

## Syntax Highlight Classes

These style the Advanced Editor syntax colors.

| Selector | What it controls |
| --- | --- |
| `.token-comment` | Code comment color. |
| `.token-string` | Code string color. |
| `.token-keyword` | Code keyword color. |
| `.token-number` | Code number color. |
| `.token-tag` | HTML tag color. |
| `.token-property` | CSS property color. |
| `.token-color` | CSS color token color. |

## Modals

| Selector | What it controls |
| --- | --- |
| `.modal-backdrop` | Full-screen modal backdrop. |
| `.confirm-modal` | Confirmation popup box. |
| `.confirm-icon` | Popup icon area. |
| `.confirm-content` | Popup text content. |
| `.confirm-detail` | Popup detail/code block. |
| `.confirm-actions` | Popup button row. |
| `#target-kind-modal` | Compact target-choice modal used by the Folder/File browse flow. |
| `.compact-choice-modal` | Smaller confirmation-style modal for browse target selection. |
| `.compact-choice-actions` | Three-button action row inside the browse target modal. |
| `#target-kind-title` | Browse target modal title. |
| `#target-kind-message` | Browse target modal helper text. |
| `#target-kind-file` | Browse target modal button for file selection. |
| `#target-kind-folder` | Browse target modal button for folder selection. |
| `#target-kind-cancel` | Browse target modal cancel button. |

## Useful Data And IDs

These are useful from Embedded JavaScript.

| Selector or API | Use |
| --- | --- |
| `document.querySelector(".launcher-card")` | Read the first card. |
| `document.querySelectorAll(".launcher-card")` | Read all visible cards. |
| `.launcher-card[data-entry-id]` | Card element with its entry id. |
| `document.body.dataset` | Store simple mod state on the body. |
| `.custom-html-root` | Add/find embedded HTML widgets. |
| `localStorage.homeLauncherSettings` | Saved app settings such as orientation, close-to-tray, config path visibility, and button highlight mode. |

## Avoid Styling These Too Aggressively

- Avoid setting `display: none` on `.app-shell`, `.panel`, `.launcher-groups`, or `.launcher-grid`.
- Avoid changing `position` on `.launcher-card` unless you test drag-and-drop.
- Avoid adding overlays without `pointer-events: none`; they can block app clicks.
- Avoid removing `.hidden`; the app uses it to switch views and panels.
- Avoid JavaScript that deletes built-in controls unless you know how to restore them.
- Avoid overriding `z-index` globally; custom overlays should use the smallest value that works.
