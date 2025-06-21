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

class SlopHider {
    constructor() {
        this.slopId = '#expandable-metadata'
        this.slopHiderUtils = new SlopHiderUtils()
    }

    removeSlop(slop) {
        console.log('Deleting slop')
        slop.remove()
    }

    async startObserving() {
        console.log('Started listening for slop to hide')
        const slop = await this.slopHiderUtils.waitForElement(this.slopId)
        this.removeSlop(slop)
        return new Promise((resolve) => {
            resolve(this.startObserving())
        })
    }
}

const slopHider = new SlopHider()
slopHider.startObserving();