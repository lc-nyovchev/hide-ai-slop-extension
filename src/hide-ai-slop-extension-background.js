class AISlopRemovalsStorage {

    async getSlopRemovals(website) {
        const scoreObj = await chrome.storage.sync.get()
        const removals = parseInt(scoreObj[website], 10)
        if (removals) {
            return removals
        }
        return 0
    }

    async setSlopRemovals(website, removals) {
        console.debug(`Slop removals for ${website} set to ${removals}`)
        return await chrome.storage.sync.set({[website]: removals})
    }
}

aiSlopRemovalsStorage = new AISlopRemovalsStorage()

const onContentScriptMessage = async (message, sender) => {
    if (sender.id === chrome.runtime.id) {
        if (message.type === 'hideAiSlop') {
            const website = message.website
            const points = message.removals
            const existingPoints = await aiSlopRemovalsStorage.getSlopRemovals(website)
            await aiSlopRemovalsStorage.setSlopRemovals(website, existingPoints + points)
        }
    }
}

chrome.runtime.onMessage.addListener(onContentScriptMessage)
