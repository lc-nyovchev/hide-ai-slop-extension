import { EngineUtils, MESSAGE_CONSTANTS } from './utils/hide-ai-slop-extension-utils.js'
import { ThemeUtils } from './utils/hide-ai-slop-extension-ui-utils.js'

Promise.resolve(new EngineUtils(chrome)).then((engineUtils) => {
	const themeUtils = new ThemeUtils(engineUtils)
	themeUtils
		.setIconAndTitle()
		.catch(console.error)
	const onContentScriptMessage = async (message, sender) => {
		if (sender.id === engineUtils.runtime().id) {
			if (message.type === MESSAGE_CONSTANTS.HIDE_AI_SLOP_MESSAGE) {
				const website = message.website
				const points = message.removals
				const existingPoints = await themeUtils.getRemovalsForWebsite(website)
				await themeUtils.setSlopRemovalsForWebsite(website, existingPoints + points)
			} else if (message.type === MESSAGE_CONSTANTS.HIDE_AI_SLOP_TOGGLE_MESSAGE) {
				await themeUtils.setIconAndTitle()
			}
		}
	}
	engineUtils.runtime().onMessage.addListener(onContentScriptMessage)
})
