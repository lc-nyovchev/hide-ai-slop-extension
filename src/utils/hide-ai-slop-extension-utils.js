export const UI_CONSTANTS = {
    COLOR_PALETTES: {
        DARK: 'dark',
        LIGHT: 'light'
    },
    DEFAULT_ICON_PATH: 'src/icons/48x-hide-ai-slop-extension.png',
    DISABLED_ICON_PATH: 'src/icons/128x-hide-ai-slop-extension-disabled.png',
    DEFAULT_TITLE: 'Hide AI Slop',
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
        CHANGE_THEME_TITLE: 'Change theme',
        DEDICATION: {
            DEFAULT_DEDICATION: 'With ❤️ to Hania',
            TITLE_EDIT: 'Click to edit dedication',
            PLACEHOLDER: 'Enter dedication'
        }
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
    },
    SLOP_BLOCKING_DEDICATION: {
        KEY: 'HIDE_AI_SLOP_DEDICATION',
        DEFAULT_VALUE: UI_CONSTANTS.CONTROLS.DEDICATION.DEFAULT_DEDICATION
    }
}

export const MESSAGE_CONSTANTS = {
    HIDE_AI_SLOP_MESSAGE: 'hideAiSlop',
    HIDE_AI_SLOP_TOGGLE_MESSAGE: 'hideAiSlopToggleEnabled'
}

export class EngineUtils {
    constructor(chrome = chrome) {
        this.chrome = chrome
    }
    storageSet = async (obj) => {
        return this.chrome.storage.sync.set(obj)
    }
    storageGet = async () => {
        return this.chrome.storage.sync.get()
    }
    storageRemove = async (key) => {
        return this.chrome.storage.sync.remove(key)
    }
    runtime = () => {
        return this.chrome.runtime
    }
    action = () => {
        return this.chrome.action
    }
}