class SlopHiderUtils {
	async waitForElement(selectorFunc) {
		return new Promise((resolve) => {
			if (selectorFunc()) {
				return resolve(selectorFunc())
			}
			const observer = new MutationObserver(() => {
				if (selectorFunc()) {
					observer.disconnect()
					resolve(selectorFunc())
				}
			})
			observer.observe(document.body, { childList: true, subtree: true })
		})
	}
}

class WebsiteSelectorMap {
	constructor() {
		this.map = {
			youtube: () => {
				return document.querySelector('#expandable-metadata')
			},
			google: () => {
				return document.querySelector('div[data-mcpr]')
			},
			gmail: () => {
				const geminiLink = document.querySelector('a[href^="https://support.google.com/mail?p=gemini-summary-card"]')
				if (geminiLink && geminiLink.parentElement && geminiLink.parentElement.parentElement && geminiLink.parentElement.parentElement.parentElement) {
					return geminiLink.parentElement.parentElement.parentElement
				}
				const tryGeminiButton = document.querySelectorAll('span[data-is-tooltip-wrapper]')[0]
				if (tryGeminiButton && tryGeminiButton.parentElement) {
					return tryGeminiButton.parentElement
				}
			}
		}
	}
}

class SlopHider {
	constructor(website) {
		this.websiteSelectorMap = new WebsiteSelectorMap()
		this.website = website
		this.slopSelectorFunc = this.websiteSelectorMap.map[website]
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
		return slop && slop.innerHTML && slop.innerHTML.trim() !== ''
	}

	async startObserving() {
		const slop = await this.slopHiderUtils.waitForElement(this.slopSelectorFunc)
		if (this.hasContent(slop)) {
			this.removeSlop(slop)
			chrome.runtime.sendMessage(this.prepareSlopRemovalMessage())
		}
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve(this.startObserving())
			}, 500)
		})
	}
}

const getSlopHider = () => {
	const host = window.location.hostname
	const isYouTube = /(^|\.)youtube\.com$/.test(host) || host === 'm.youtube.com'
	const isGoogle = /\.google\./.test(host)
	const isGmail = /mail.google.com/.test(host)
	if (isYouTube) {
		return new SlopHider('youtube')
	} else if (isGoogle) {
		if (isGmail) {
			return new SlopHider('gmail')
		} else {
			return new SlopHider('google')
		}
	} else {
		return null
	}
}

const slopHider = getSlopHider()
if (slopHider) {
	slopHider.startObserving()
}
