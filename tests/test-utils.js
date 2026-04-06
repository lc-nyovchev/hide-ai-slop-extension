import { expect, vi } from "vitest"
import { EngineUtils } from "../src/utils/hide-ai-slop-extension-utils.js"

export default {
	namedMock: name => vi.fn().mockName(name),
	mockChrome() {
		return {
			storage: {
				sync: {
					set: this.namedMock('set'),
					get: this.namedMock('get'),
					remove: this.namedMock('remove')
				}
			},
			runtime: {
				sendMessage: this.namedMock('sendMessage')
			},
			action: this.namedMock('action')
		}
	},
	mockEngineUtils() {
		const mockEngineUtils = new EngineUtils(this.mockChrome())
		Object.keys(mockEngineUtils).forEach(key => {
			const value = mockEngineUtils[key]
			if (typeof value === 'function') {
				vi.spyOn(mockEngineUtils, key)
			}
		})
		return mockEngineUtils
	},
	sanitizeHtml(html) {
		return `"${html.replace(/>\s+</g, '><').trim()}"`
	},
	async verifyAsync(func) {
		await new Promise(resolve => setTimeout(resolve, 0))
		return func()
	}
}