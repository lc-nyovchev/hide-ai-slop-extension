const CONSTANTS = {
	DEFAULT_ICON_PATH: 'icons/48x-hide-ai-slop-extension.png',
	DISABLED_ICON_PATH: 'icons/128x-hide-ai-slop-extension-disabled.png',
	HIDE_AI_SLOP_BLOCKING_ENABLED_KEY: 'HIDE_AI_SLOP_BLOCKING_ENABLED',
	DEFAULT_TITLE: 'Hide AI Slop',
	DISABLED_TITLE: 'Hide AI Slop (Disabled)'
}
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
		return await chrome.storage.sync.set({ [website]: removals })
	}

	isEnabled(store) {
		if (typeof store[CONSTANTS.HIDE_AI_SLOP_BLOCKING_ENABLED_KEY] === 'undefined') {
			return true 
		} else {
			return store[CONSTANTS.HIDE_AI_SLOP_BLOCKING_ENABLED_KEY]
		}
	}

	getIconPath(enabled) {
		return enabled ? chrome.runtime.getURL(CONSTANTS.DEFAULT_ICON_PATH) : chrome.runtime.getURL(CONSTANTS.DISABLED_ICON_PATH)
	}

	async setIconAndTitle() {
		const store = await chrome.storage.sync.get()
		const enabled = this.isEnabled(store)
		chrome.action.setIcon({path: this.getIconPath(enabled)})
		chrome.action.setTitle({title: enabled ? CONSTANTS.DEFAULT_TITLE : CONSTANTS.DISABLED_TITLE})
	}
}

aiSlopRemovalsStorage = new AISlopRemovalsStorage()
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
