# EXT:copy_page_markdown — Copy Page as Markdown for LLMs

A TYPO3 extension that adds a floating "Copy page" widget to your frontend — inspired by the [Claude Code Docs](https://code.claude.com) UI.

Uses [b13/ai-bots-love-markdown](https://github.com/b13/ai-bots-love-markdown) as the Markdown backend. This extension adds the **user-facing frontend widget** on top.

## What it does

Three actions in a compact floating dropdown:

- **Copy page** — Fetches the page as Markdown from the b13 endpoint and copies it to clipboard
- **View as Markdown** — Opens the `.md` URL in a new tab
- **Open in Claude** — Copies the Markdown, then opens Claude in a new tab so the user can paste and ask questions

Zero editorial overhead. No new backend fields. No maintenance. Just a button.

## Requirements

- TYPO3 v13.4+ or v14
- PHP 8.2+
- `b13/ai-bots-love-markdown` ^0.2 (installed as dependency)

## Installation

```bash
composer require dkd/copy-page-markdown
vendor/bin/typo3 extension:setup
vendor/bin/typo3 cache:flush
```

DDEV:

```bash
ddev composer require dkd/copy-page-markdown
ddev typo3 extension:setup
ddev typo3 cache:flush
```

### Activate Site Sets

Go to **Site Management → Sites**, edit your site, and under **Sets** add:

1. **AI Bots Love Markdown** (`b13/ai-bots-love-markdown`) — if not already added
2. **Copy Page as Markdown Widget** (`dkd/copy-page-markdown`)

Save and clear caches.

## Configuration

All settings under **Site Management → Settings**:

| Setting | Default | Description |
|---|---|---|
| `enabled` | `true` | Show/hide the widget |
| `position` | `bottom-right` | `bottom-right`, `bottom-left`, `top-right`, `top-left` |
| `showViewMarkdown` | `true` | Show "View as Markdown" option |
| `showOpenInClaude` | `true` | Show "Open in Claude" option |
| `claudeBaseUrl` | `https://claude.ai/new` | URL for the Claude deeplink |
| `markdownSuffix` | `/ai-bots-love.md` | URL suffix used by b13's extension |

## How it works

1. **b13/ai-bots-love-markdown** does the heavy lifting: it renders TYPO3 pages normally, then a PSR-15 middleware intercepts the response, extracts `<main>` content, converts HTML to Markdown via `league/html-to-markdown`, and adds YAML front matter with page metadata.

2. **This extension** adds a floating widget (one CSS file, one JS file, one TypoScript snippet) that fetches from that endpoint via `fetch()` and writes to the clipboard via `navigator.clipboard.writeText()`.

No PHP code needed in this extension — it's pure frontend. The TypoScript injects a `<div>` with data attributes, and the JavaScript builds the widget from there.

### Architecture

```
┌──────────────────────────┐
│  Visitor clicks "Copy"   │
└────────┬─────────────────┘
         │ fetch()
         ▼
┌──────────────────────────┐
│  b13/ai-bots-love-markdown│
│  /my-page/ai-bots-love.md│
│                          │
│  Middleware:              │
│  1. Render page normally │
│  2. Extract <main>       │
│  3. HTML → Markdown      │
│  4. Add YAML front matter│
│  5. Return text/markdown │
└────────┬─────────────────┘
         │ text/markdown
         ▼
┌──────────────────────────┐
│  navigator.clipboard     │
│  .writeText(markdown)    │
│                          │
│  → "Copied!" feedback    │
└──────────────────────────┘
```

## Features

- **Dark mode** — Adapts automatically via `prefers-color-scheme`
- **Responsive** — Label collapses on small screens, just shows the icon
- **Accessible** — ARIA attributes, keyboard nav (Escape to close)
- **Configurable** — Position, visibility of each option, Claude URL
- **Multilingual** — Ships with EN and DE labels

## File structure

```
copy_page_markdown/
├── Configuration/
│   ├── Services.yaml
│   └── Sets/CopyPageMarkdown/
│       ├── config.yaml
│       ├── constants.typoscript
│       ├── settings.definitions.yaml
│       ├── settings.yaml
│       └── setup.typoscript
├── Resources/
│   ├── Private/Language/
│   │   ├── locallang.xlf
│   │   └── de.locallang.xlf
│   └── Public/
│       ├── Css/CopyPageWidget.css
│       └── JavaScript/CopyPageWidget.js
├── composer.json
├── ext_emconf.php
└── README.md
```

No PHP classes. No middleware. No controllers. Pure frontend.

## Roadmap

- [ ] Page property to disable widget per page (TCA override, `tx_copypagemarkdown_hide`)
- [ ] Keyboard shortcut (Ctrl/Cmd+Shift+M)
- [ ] Token count estimation in dropdown
- [ ] "Open in ChatGPT" as additional option
- [ ] Configurable LLM deeplinks (Claude, ChatGPT, Gemini, etc.)
- [ ] Content Security Policy nonce support

## Why this exists

The [b13 blog post](https://b13.com/blog/the-internet-is-no-longer-just-for-humans-ai-bots-love-markdown) makes the case for serving TYPO3 content as Markdown for AI systems. Their extension handles the server-to-crawler side. This extension handles the **human-to-LLM** workflow — the person sitting in front of the screen who wants to paste a page into Claude.

## License

GPL-2.0-or-later

## Credits

- **Markdown backend**: [b13/ai-bots-love-markdown](https://github.com/b13/ai-bots-love-markdown) by b13 GmbH
- **Widget**: [dkd Internet Service GmbH](https://www.dkd.de), Frankfurt am Main
