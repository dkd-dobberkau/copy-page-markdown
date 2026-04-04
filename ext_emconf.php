<?php

$EM_CONF[$_EXTKEY] = [
    'title' => 'Copy Page as Markdown',
    'description' => 'Frontend widget: Copy page as Markdown for LLMs, View as Markdown, Open in Claude. Uses b13/ai-bots-love-markdown as Markdown backend.',
    'category' => 'fe',
    'author' => 'dkd Internet Service GmbH',
    'author_email' => 'info@dkd.de',
    'author_company' => 'dkd Internet Service GmbH',
    'state' => 'beta',
    'version' => '1.0.0',
    'constraints' => [
        'depends' => [
            'typo3' => '13.4.0-14.99.99',
            'ai_bots_love_markdown' => '0.2.0-0.99.99',
        ],
        'conflicts' => [],
        'suggests' => [],
    ],
];
