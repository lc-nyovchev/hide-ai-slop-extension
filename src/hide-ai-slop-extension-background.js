import {STORAGE_CONSTANTS, UI_CONSTANTS} from "./hide-ai-slop-extension-utils.js";

class AISlopRemovalsStorage {
    async getSlopRemovals(website) {
        const store = await chrome.storage.sync.get()
        const removals = parseInt(store[website], 10)
        if (removals) {
            return removals
        }
        return 0
    }

    async setSlopRemovals(website, removals) {
        console.debug(`Slop removals for ${website} set to ${removals}`)
        return await chrome.storage.sync.set({[website]: removals})
    }

    isEnabled(store) {
        if (typeof store[STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.KEY] === 'undefined') {
            return STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.DEFAULT_VALUE
        } else {
            return store[STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.KEY]
        }
    }

    getIconPath(enabled) {
        return enabled ? chrome.runtime.getURL(UI_CONSTANTS.DEFAULT_ICON_PATH) : chrome.runtime.getURL(UI_CONSTANTS.DISABLED_ICON_PATH)
    }

    async setIconAndTitle() {
        const store = await chrome.storage.sync.get()
        const enabled = this.isEnabled(store)
        chrome.action.setIcon({path: this.getIconPath(enabled)})
        chrome.action.setTitle({title: enabled ? UI_CONSTANTS.DEFAULT_TITLE : UI_CONSTANTS.DISABLED_TITLE})
    }
}

const aiSlopRemovalsStorage = new AISlopRemovalsStorage()
aiSlopRemovalsStorage.setIconAndTitle()

const onContentScriptMessage = async (message, sender) => {
    if (sender.id === chrome.runtime.id) {
        if (message.type === 'hideAiSlop') {
            const website = message.website
            const points = message.removals
            const existingPoints = await aiSlopRemovalsStorage.getSlopRemovals(website)
            await aiSlopRemovalsStorage.setSlopRemovals(website, existingPoints + points)
        } else if (message.type === 'hideAiSlopToggleEnabled') {
            await aiSlopRemovalsStorage.setIconAndTitle()
        }
    }
}

chrome.runtime.onMessage.addListener(onContentScriptMessage)
