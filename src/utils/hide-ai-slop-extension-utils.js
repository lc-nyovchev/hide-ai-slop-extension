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

export class ThemeUtils {
    constructor(engineUtils = new EngineUtils(chrome)) {
        this.engineUtils = engineUtils
    }
    async setTheme(theme) {
        if (theme !== UI_CONSTANTS.COLOR_PALETTES.DARK && theme !== UI_CONSTANTS.COLOR_PALETTES.LIGHT) {
            const msg = `Supported themes are only ${UI_CONSTANTS.COLOR_PALETTES.DARK} and ${UI_CONSTANTS.COLOR_PALETTES.LIGHT}`
            console.error(msg)
            throw new Error(msg)
        }
        return await this.engineUtils.storageSet({ [STORAGE_CONSTANTS.SLOP_BLOCKING_THEME.KEY]: theme })
    }
    async getTheme() {
        const store = await this.engineUtils.storageGet()
        const currentTheme = store[STORAGE_CONSTANTS.SLOP_BLOCKING_THEME.KEY]
        if (currentTheme !== UI_CONSTANTS.COLOR_PALETTES.DARK && currentTheme !== UI_CONSTANTS.COLOR_PALETTES.LIGHT) {
            return STORAGE_CONSTANTS.SLOP_BLOCKING_THEME.DEFAULT_VALUE
        }
        return currentTheme
    }
    async setSlopBlockingEnabled(enabled) {
        await this.engineUtils.storageSet({ [STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.KEY]: enabled })
        this.engineUtils.runtime().sendMessage({
            type: MESSAGE_CONSTANTS.HIDE_AI_SLOP_TOGGLE_MESSAGE,
            enabled: enabled
        })
    }
    async isSlopBlockingEnabled() {
        const store = await this.engineUtils.storageGet()
        const isEnabled = store[STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.KEY]
        if (typeof isEnabled === 'undefined') {
            return STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.DEFAULT_VALUE
        }
        return isEnabled
    }
    async getDedication() {
        const store = await this.engineUtils.storageGet()
        const dedication = store[STORAGE_CONSTANTS.SLOP_BLOCKING_DEDICATION.KEY]
        if (typeof dedication === 'undefined') {
            return STORAGE_CONSTANTS.SLOP_BLOCKING_DEDICATION.DEFAULT_VALUE
        }
        return dedication
    }
    async setDedication(dedication) {
        return await this.engineUtils.storageSet({ [STORAGE_CONSTANTS.SLOP_BLOCKING_DEDICATION.KEY]: dedication })
    }
    async getRemovals() {
        const points = await this.engineUtils.storageGet()
        delete points[STORAGE_CONSTANTS.SLOP_BLOCKING_THEME.KEY]
        delete points[STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.KEY]
        delete points[STORAGE_CONSTANTS.SLOP_BLOCKING_DEDICATION.KEY]
        return Object.fromEntries(
            Object
                .entries(points)
                .map(([key, value]) => {
                    const points = parseInt(value, 10)
                    if (points) {
                        return [key, points]
                    } else {
                        return [key, 0]
                    }
                }))
    }
    async getRemovalsForWebsite(website) {
        const points = await this.getRemovals()
        const removalsForWebsite = points[website]
        return removalsForWebsite ? removalsForWebsite : 0
    }
    async setSlopRemovalsForWebsite(website, removals) {
        console.debug(`Slop removals for ${website} set to ${removals}`)
        return await this.engineUtils.storageSet({[website]: removals})
    }
    async removeWebsite(website) {
        return this.engineUtils.storageRemove(website)
    }
    isEnabled(store) {
        if (typeof store[STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.KEY] === 'undefined') {
            return STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.DEFAULT_VALUE
        } else {
            return store[STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.KEY]
        }
    }
    getIconPath(enabled) {
        return enabled ? this.engineUtils.runtime().getURL(UI_CONSTANTS.DEFAULT_ICON_PATH) : this.engineUtils.runtime().getURL(UI_CONSTANTS.DISABLED_ICON_PATH)
    }
    async setIconAndTitle() {
        const store = await this.engineUtils.storageGet()
        const enabled = this.isEnabled(store)
        this.engineUtils.action().setIcon({path: this.getIconPath(enabled)})
        this.engineUtils.action().setTitle({title: enabled ? UI_CONSTANTS.DEFAULT_TITLE : UI_CONSTANTS.DISABLED_TITLE})
    }
}