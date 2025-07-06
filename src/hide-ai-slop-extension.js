class SlopHiderUtils {
    async waitForElement(selector) {
        return new Promise((resolve) => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector))
            }
            const observer = new MutationObserver(() => {
                if (document.querySelector(selector)) {
                    observer.disconnect()
                    resolve(document.querySelector(selector))
                }
            })
            observer.observe(document.body, {childList: true, subtree: true})
        })
    }
}

class WebsiteSelectorMap {
    constructor() {
        this.map = {
            youtube: '#expandable-metadata',
            google: 'div[data-mcpr]'
        }
    }
}

class SlopHider {
    constructor(website) {
        this.websiteSelectorMap = new WebsiteSelectorMap()
        this.website = website
        this.slopSelector = this.websiteSelectorMap.map[website]
        this.slopHiderUtils = new SlopHiderUtils()
    }

    removeSlop(slop) {
        console.log('Deleting slop')
        slop.remove()
    }

    prepareSlopRemovalMessage() {
        return {
            type: 'hideAiSlop',
            removals: 1,
            website: this.website
        }
    }

    hasContent(slop) {
        return slop && slop.innerHTML && slop.innerHTML.trim() !== ""
    }

    async startObserving() {
        const slop = await this.slopHiderUtils.waitForElement(this.slopSelector)
        if (this.hasContent(slop)) {
            this.removeSlop(slop)
            chrome.runtime.sendMessage(this.prepareSlopRemovalMessage())
        }
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this.startObserving())
            }, 500)
        });
    }
}

const getSlopHider = () => {
    const host = window.location.hostname
    const isYouTube = /(^|\.)youtube\.com$/.test(host) || host === 'm.youtube.com'
    const isGoogle = /\.google\./.test(host)
    if (isYouTube) {
        return new SlopHider('youtube')
    } else if (isGoogle) {
        return new SlopHider('google')
    } else {
        return null
    }
}

const slopHider = getSlopHider()
if (slopHider) {
    slopHider.startObserving();
}
