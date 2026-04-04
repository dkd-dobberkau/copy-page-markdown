# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TYPO3 extension (`dkd/copy-page-markdown`) that adds a floating frontend widget for copying TYPO3 pages as Markdown for LLMs. Pure frontend — no PHP classes, no middleware, no controllers.

Depends on `b13/ai-bots-love-markdown` (^0.2) which provides the Markdown endpoint. This extension only adds the user-facing widget on top.

## Requirements

- TYPO3 v13.4+ or v14
- PHP 8.2+
- `b13/ai-bots-love-markdown` installed and its Site Set activated

## Installation

```bash
composer require dkd/copy-page-markdown
vendor/bin/typo3 extension:setup
vendor/bin/typo3 cache:flush
```

Both Site Sets must be activated: `b13/ai-bots-love-markdown` and `dkd/copy-page-markdown`.

## Architecture

The extension has **zero PHP code**. It works entirely through TypoScript + vanilla JS + CSS:

1. **TypoScript** (`setup.typoscript`) injects a `<div id="cpm-widget">` with data attributes into the page footer, along with the CSS/JS assets. All controlled by TypoScript constants from `constants.typoscript`.
2. **JavaScript** (`Resources/Public/JavaScript/CopyPageWidget.js`) — vanilla ES6+ IIFE, no dependencies. Reads config from the widget's data attributes, builds the dropdown UI dynamically, handles fetch + clipboard API.
3. **CSS** (`Resources/Public/Css/CopyPageWidget.css`) — self-contained with CSS custom properties. Supports dark mode via `prefers-color-scheme`, responsive collapse on small screens.

The Markdown URL is constructed at runtime: `{current page URL} + {markdownSuffix}` (default `/ai-bots-love.md`). The JS fetches from b13's endpoint and copies the response to clipboard.

## Configuration

Settings are defined via TYPO3 Site Sets (`Configuration/Sets/CopyPageMarkdown/`):
- `settings.definitions.yaml` — defines available settings with types and defaults
- `settings.yaml` — default values
- `constants.typoscript` — maps settings to TypoScript constants

Key settings: `enabled`, `position`, `showViewMarkdown`, `showOpenInClaude`, `claudeBaseUrl`, `markdownSuffix`.

## CSS Class Prefix

All CSS classes and custom properties use the `cpm-` prefix to avoid conflicts with site styles.

## Translations

XLIFF files in `Resources/Private/Language/` — English (source) and German. Note: the JS currently hardcodes English label strings rather than using these XLIFF translations.

## Roadmap

See README.md for planned features including per-page disable via TCA, keyboard shortcuts, token estimation, and additional LLM deeplinks.
