export const UI_CONSTANTS = {
    COLOR_PALETTES: {
        DARK: 'dark',
        LIGHT: 'light'
    },
    HEADER_CONSTANT: 'HIDE_AI_SLOP_EXTENSION_HEADER',
    DEFAULT_ICON_PATH: 'src/icons/48x-hide-ai-slop-extension.png',
    DISABLED_ICON_PATH: 'src/icons/128x-hide-ai-slop-extension-disabled.png',
    DEFAULT_TITLE: 'Hide AI Slop',
    DISABLED_TITLE: 'Hide AI Slop (Disabled)'
}

export const STORAGE_CONSTANTS = {
    SLOP_BLOCKING_ENABLED: {
        KEY: 'HIDE_AI_SLOP_BLOCKING_ENABLED',
        DEFAULT_VALUE: true
    },
    SLOP_BLOCKING_THEME: {
        KEY: 'HIDE_AI_SLOP_THEME',
        DEFAULT_VALUE: UI_CONSTANTS.COLOR_PALETTES.DARK
    }
}