export const UI_CONSTANTS = {
    COLOR_PALETTES: {
        DARK: 'dark',
        LIGHT: 'light'
    },
    DEFAULT_ICON_PATH: 'src/icons/48x-hide-ai-slop-extension.png',
    DISABLED_ICON_PATH: 'src/icons/128x-hide-ai-slop-extension-disabled.png',
    DEFAULT_TITLE: 'Hide AI Slop',
    DEFAULT_DEDICATION: 'With ❤️ to Hania',
    DISABLED_TITLE: 'Hide AI Slop (Disabled)',
    TABLE_HEADERS: {
        WEBSITE: 'Website',
        SLOPS_REMOVED: 'Slops Removed',
        DELETE: 'Delete'
    },
    TABLE_ROWS_CONTROLS: {
        DELETE_BUTTON_TITLE: 'Delete'
    },
    CONTROLS: {
        TOGGLE_ENABLED_BUTTON: {
            TITLE_ENABLED: 'Disable hiding slop',
            TITLE_DISABLED: 'Enable hiding slop',
            ON_TEXT: 'On',
            OFF_TEXT: 'Off'
        },
        CHANGE_THEME_TITLE: 'Change theme'
    }
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

export const MESSAGE_CONSTANTS = {
    HIDE_AI_SLOP_MESSAGE: 'hideAiSlop',
    HIDE_AI_SLOP_TOGGLE_MESSAGE: 'hideAiSlopToggleEnabled'
}

export const EngineUtils = {
    storageSet: async (obj) => {
        return chrome.storage.sync.set(obj)
    },
    storageGet: async () => {
        return chrome.storage.sync.get()
    },
    storageRemove: async (key) => {
        return chrome.storage.sync.remove(key)
    },
    runtime: () => {
        return chrome.runtime
    },
    action: () => {
        return chrome.action
    }
}