import {EngineUtils, MESSAGE_CONSTANTS, STORAGE_CONSTANTS, UI_CONSTANTS} from "./hide-ai-slop-extension-utils.js";

class AISlopRemovalsStorage {
    async getSlopRemovals(website) {
        const store = await EngineUtils.storageGet()
        const removals = parseInt(store[website], 10)
        if (removals) {
            return removals
        }
        return 0
    }

    async setSlopRemovals(website, removals) {
        console.debug(`Slop removals for ${website} set to ${removals}`)
        return await EngineUtils.storageSet({[website]: removals})
    }

    isEnabled(store) {
        if (typeof store[STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.KEY] === 'undefined') {
            return STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.DEFAULT_VALUE
        } else {
            return store[STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.KEY]
        }
    }

    getIconPath(enabled) {
        return enabled ? EngineUtils.runtime().getURL(UI_CONSTANTS.DEFAULT_ICON_PATH) : EngineUtils.runtime().getURL(UI_CONSTANTS.DISABLED_ICON_PATH)
    }

    async setIconAndTitle() {
        const store = await EngineUtils.storageGet()
        const enabled = this.isEnabled(store)
        EngineUtils.action().setIcon({path: this.getIconPath(enabled)})
        EngineUtils.action().setTitle({title: enabled ? UI_CONSTANTS.DEFAULT_TITLE : UI_CONSTANTS.DISABLED_TITLE})
    }
}

const aiSlopRemovalsStorage = new AISlopRemovalsStorage()
aiSlopRemovalsStorage
    .setIconAndTitle()
    .catch(console.error)

const onContentScriptMessage = async (message, sender) => {
    if (sender.id === EngineUtils.runtime().id) {
        if (message.type === MESSAGE_CONSTANTS.HIDE_AI_SLOP_MESSAGE) {
            const website = message.website
            const points = message.removals
            const existingPoints = await aiSlopRemovalsStorage.getSlopRemovals(website)
            await aiSlopRemovalsStorage.setSlopRemovals(website, existingPoints + points)
        } else if (message.type === MESSAGE_CONSTANTS.HIDE_AI_SLOP_TOGGLE_MESSAGE) {
            await aiSlopRemovalsStorage.setIconAndTitle()
        }
    }
}

EngineUtils.runtime().onMessage.addListener(onContentScriptMessage)
