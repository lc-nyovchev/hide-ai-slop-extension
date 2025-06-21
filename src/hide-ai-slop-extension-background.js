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
        console.debug(`Points for ${website} set to ${removals}`)
        return await chrome.storage.sync.set({[channelName]: removals})
    }
}

aiSlopRemovalsStorage = new AISlopRemovalsStorage()

const onContentScriptMessage = async (message, sender) => {
    if (sender.id === chrome.runtime.id) {
        if (message.type === 'aiSlop') {
            const channelName = message.channelName
            const points = message.removals
            const existingPoints = await aiSlopRemovalsStorage.getPoints(channelName)
            await aiSlopRemovalsStorage.setPoints(channelName, existingPoints + points)
        }
    }
}

chrome.runtime.onMessage.addListener(onContentScriptMessage)
