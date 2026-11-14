/**
 * Copy Page as Markdown Widget
 *
 * Renders a floating dropdown with three actions:
 *   1. Copy for your agent — fetches Markdown from b13/ai-bots-love-markdown endpoint, copies to clipboard
 *   2. View as Markdown — opens the .md URL in a new tab
 *   3. Open in Claude — copies Markdown, then opens Claude
 *
 * Reads configuration from data attributes on #cpm-widget.
 * No dependencies. Vanilla ES6+.
 */
(function () {
    'use strict';

    const COPIED_MS = 2000;

    // SVG icons as strings
    const ICONS = {
        copy: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
        markdown: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
        claude: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
        chevron: '<svg class="cpm-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
    };

    function init() {
        const widget = document.getElementById('cpm-widget');
        if (!widget) return;

        const config = {
            position: widget.dataset.position || 'bottom-right',
            showView: widget.dataset.showView === '1',
            showClaude: widget.dataset.showClaude === '1',
            claudeUrl: widget.dataset.claudeUrl || 'https://claude.ai/new',
            mdSuffix: widget.dataset.mdSuffix || '/ai-bots-love.md',
        };

        // Build the Markdown URL from current page URL + suffix
        const mdUrl = buildMarkdownUrl(config.mdSuffix);

        // Render widget HTML
        widget.innerHTML = buildWidgetHtml(config);

        // Bind events
        const trigger = widget.querySelector('.cpm-trigger');
        const dropdown = widget.querySelector('.cpm-dropdown');
        const label = widget.querySelector('.cpm-label');

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggle(trigger, dropdown);
        });

        document.addEventListener('click', (e) => {
            if (!widget.contains(e.target)) close(trigger, dropdown);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') close(trigger, dropdown);
        });

        // Action handlers
        widget.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;

            const action = btn.dataset.action;
            close(trigger, dropdown);

            switch (action) {
                case 'copy':
                    doCopy(mdUrl, trigger, label);
                    break;
                case 'view':
                    window.open(mdUrl, '_blank', 'noopener');
                    break;
                case 'claude':
                    doOpenInClaude(mdUrl, config.claudeUrl, trigger, label);
                    break;
            }
        });
    }

    /**
     * Construct the Markdown URL.
     * The page names it in <link rel="alternate" type="text/markdown">, which
     * b13/ai-bots-love-markdown adds; that also covers sites with their own
     * URL scheme (/page.md). Without the tag, fall back to the b13 pattern
     * {pageUrl}/ai-bots-love.md.
     */
    function buildMarkdownUrl(suffix) {
        const alternate = document.querySelector('link[rel="alternate"][type="text/markdown"]');
        if (alternate && alternate.href) {
            return alternate.href;
        }
        const loc = window.location;
        let path = loc.pathname;
        // Remove trailing slash if suffix starts with /
        if (suffix.startsWith('/') && path.endsWith('/')) {
            path = path.slice(0, -1);
        }
        return loc.origin + path + suffix + loc.search;
    }

    function buildWidgetHtml(config) {
        let options = '';

        // Copy for your agent — always shown
        options += buildOption('copy', ICONS.copy, 'Copy for your agent', 'Copy this page as Markdown for an AI agent');

        // View as Markdown
        if (config.showView) {
            options += `<div class="cpm-sep"></div>`;
            options += buildOption('view', ICONS.markdown, 'View as Markdown \u2197', 'View this page as plain text');
        }

        // Open in Claude
        if (config.showClaude) {
            options += `<div class="cpm-sep"></div>`;
            options += buildOption('claude', ICONS.claude, 'Open in Claude \u2197', 'Ask questions about this page');
        }

        return `
            <button class="cpm-trigger" aria-expanded="false" aria-haspopup="true" title="Copy this page as Markdown for an AI agent">
                ${ICONS.copy}
                <span class="cpm-label">Copy for your agent</span>
                ${ICONS.chevron}
            </button>
            <div class="cpm-dropdown" role="menu">
                ${options}
            </div>
        `;
    }

    function buildOption(action, icon, title, desc) {
        return `
            <button class="cpm-option" role="menuitem" data-action="${action}">
                ${icon}
                <span>
                    <span class="cpm-option__title">${title}</span>
                    <span class="cpm-option__desc">${desc}</span>
                </span>
            </button>
        `;
    }

    function toggle(trigger, dropdown) {
        const open = trigger.getAttribute('aria-expanded') === 'true';
        if (open) {
            close(trigger, dropdown);
        } else {
            trigger.setAttribute('aria-expanded', 'true');
            dropdown.classList.add('cpm-dropdown--visible');
        }
    }

    function close(trigger, dropdown) {
        trigger.setAttribute('aria-expanded', 'false');
        dropdown.classList.remove('cpm-dropdown--visible');
    }

    /**
     * Fetch Markdown from the b13 endpoint and copy to clipboard.
     */
    async function doCopy(mdUrl, trigger, label) {
        const original = label.textContent;

        try {
            const res = await fetch(mdUrl, {
                headers: { 'Accept': 'text/markdown' },
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const md = await res.text();
            await navigator.clipboard.writeText(md);

            showSuccess(trigger, label, 'Copied!', original);
        } catch (err) {
            console.error('[CopyPageMarkdown]', err);
            showSuccess(trigger, label, 'Failed \u2014 try View', original, true);
        }
    }

    /**
     * Open Claude with a prompt that references the Markdown URL.
     * Uses the ?q= query parameter supported by claude.ai/new.
     */
    function doOpenInClaude(mdUrl, claudeUrl, trigger, label) {
        const prompt = 'Read from ' + mdUrl + ' so I can ask questions about it.';
        const url = claudeUrl + '?q=' + encodeURIComponent(prompt);
        window.open(url, '_blank', 'noopener');
    }

    function showSuccess(trigger, label, msg, original, isError) {
        label.textContent = msg;
        if (!isError) trigger.classList.add('cpm-trigger--copied');

        setTimeout(() => {
            label.textContent = original;
            trigger.classList.remove('cpm-trigger--copied');
        }, COPIED_MS);
    }

    // Boot
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
