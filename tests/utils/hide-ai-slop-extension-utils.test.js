import { beforeEach, describe, expect, it } from 'vitest'
import testUtils from '../test-utils.js'
import { EngineUtils, MESSAGE_CONSTANTS, STORAGE_CONSTANTS, ThemeUtils, UI_CONSTANTS } from '../../src/utils/hide-ai-slop-extension-utils.js'

describe('UI_CONSTANTS', () => {
	it('should have correct color palettes', () => {
		expect(UI_CONSTANTS.COLOR_PALETTES.DARK).toBe('dark')
		expect(UI_CONSTANTS.COLOR_PALETTES.LIGHT).toBe('light')
	})
	it('should have correct default icon path', () => {
		expect(UI_CONSTANTS.DEFAULT_ICON_PATH).toBe('src/icons/48x-hide-ai-slop-extension.png')
	})
	it('should have correct disabled icon path', () => {
		expect(UI_CONSTANTS.DISABLED_ICON_PATH).toBe('src/icons/128x-hide-ai-slop-extension-disabled.png')
	})
	it('should have correct default title', () => {
		expect(UI_CONSTANTS.DEFAULT_TITLE).toBe('Hide AI Slop')
	})
	it('should have correct disabled title', () => {
		expect(UI_CONSTANTS.DISABLED_TITLE).toBe('Hide AI Slop (Disabled)')
	})
	it('should have correct table headers', () => {
		expect(UI_CONSTANTS.TABLE_HEADERS.WEBSITE).toBe('Website')
		expect(UI_CONSTANTS.TABLE_HEADERS.SLOPS_REMOVED).toBe('Slops Removed')
		expect(UI_CONSTANTS.TABLE_HEADERS.DELETE).toBe('Delete')
	})
	it('should have correct table rows controls', () => {
		expect(UI_CONSTANTS.TABLE_ROWS_CONTROLS.DELETE_BUTTON_TITLE).toBe('Delete')
	})
	describe('should have correct controls labels', () => {
		it('for the toggle enabled button', () => {
			expect(UI_CONSTANTS.CONTROLS.TOGGLE_ENABLED_BUTTON.TITLE_ENABLED).toBe('Disable hiding slop')
			expect(UI_CONSTANTS.CONTROLS.TOGGLE_ENABLED_BUTTON.TITLE_DISABLED).toBe('Enable hiding slop')
			expect(UI_CONSTANTS.CONTROLS.TOGGLE_ENABLED_BUTTON.ON_TEXT).toBe('On')
			expect(UI_CONSTANTS.CONTROLS.TOGGLE_ENABLED_BUTTON.OFF_TEXT).toBe('Off')
		})
		it('for the change theme title', () => {
			expect(UI_CONSTANTS.CONTROLS.CHANGE_THEME_TITLE).toBe('Change theme')
		})
		it('for the dedication', () => {
			expect(UI_CONSTANTS.CONTROLS.DEDICATION.DEFAULT_DEDICATION).toBe('With ❤️ to Hania')
			expect(UI_CONSTANTS.CONTROLS.DEDICATION.TITLE_EDIT).toBe('Click to edit dedication')
			expect(UI_CONSTANTS.CONTROLS.DEDICATION.PLACEHOLDER).toBe('Enter dedication')
		})
	})
})

describe('STORAGE_CONSTANTS', () => {
	describe('SLOP_BLOCKING_ENABLED', () => {
		it('should have correct key', () => {
			expect(STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.KEY).toBe('HIDE_AI_SLOP_BLOCKING_ENABLED')
		})
		it('should have correct default value', () => {
			expect(STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.DEFAULT_VALUE).toBe(true)
		})
	})
	describe('SLOP_BLOCKING_THEME', () => {
		it('should have correct key', () => {
			expect(STORAGE_CONSTANTS.SLOP_BLOCKING_THEME.KEY).toBe('HIDE_AI_SLOP_THEME')
		})
		it('should have correct default value', () => {
			expect(STORAGE_CONSTANTS.SLOP_BLOCKING_THEME.DEFAULT_VALUE).toBe(UI_CONSTANTS.COLOR_PALETTES.DARK)
		})
	})
})

describe('MESSAGE_CONSTANTS', () => {
	it('should have correct key for slop counting message', () => {
		expect(MESSAGE_CONSTANTS.HIDE_AI_SLOP_MESSAGE).toBe('hideAiSlop')
	})
	it('should have correct key for toggle message', () => {
		expect(MESSAGE_CONSTANTS.HIDE_AI_SLOP_TOGGLE_MESSAGE).toBe('hideAiSlopToggleEnabled')
	})
})

describe('EngineUtils', () => {
	beforeEach((context) => {
		const chrome = testUtils.mockChrome()
		const engineUtils = new EngineUtils(chrome)
		context.chrome = chrome
		context.engineUtils = engineUtils
	})
	it('storageSet should call the proper internals', async ({ engineUtils, chrome }) => {
		const value = { key: 'value' }

		await engineUtils.storageSet(value)

		expect(chrome.storage.sync.set).toHaveBeenCalledWith(value)
	})
	describe('storageGet', () => {
		it('should call the proper internals', async ({ engineUtils, chrome }) => {
			await engineUtils.storageGet()

			expect(chrome.storage.sync.get).toHaveBeenCalled()
		})
		it('should return the correct value', async ({ engineUtils, chrome }) => {
			const expectedResult = { youtube: '420', google: '1337', gmail: '1911' }
			chrome.storage.sync.get.mockResolvedValueOnce(expectedResult)

			const storage = await engineUtils.storageGet()

			expect(storage).toEqual(expectedResult)
		})
	})
	it('storageRemove call the proper internals', async ({ engineUtils, chrome }) => {
		await engineUtils.storageRemove('google')

		expect(chrome.storage.sync.remove).toHaveBeenCalledWith('google')
	})
	it('runtime call the proper internals', ({ engineUtils, chrome }) => {
		expect(engineUtils.runtime()).toBe(chrome.runtime)
	})
	it('action call the proper internals', ({ engineUtils, chrome }) => {
		expect(engineUtils.action()).toBe(chrome.action)
	})
})

describe('ThemeUtils', () => {
	beforeEach((context) => {
		const engineUtils = testUtils.mockEngineUtils()
		context.themeUtils = new ThemeUtils(engineUtils)
		context.engineUtils = engineUtils
	})
	describe('setTheme', () => {
		it('should call the proper internals for dark', async ({ themeUtils, engineUtils }) => {
			await themeUtils.setTheme('dark')

			expect(engineUtils.storageSet).toHaveBeenCalledWith({ [STORAGE_CONSTANTS.SLOP_BLOCKING_THEME.KEY]: 'dark' })
		})
		it('should call the proper internals for light', async ({ themeUtils, engineUtils }) => {
			await themeUtils.setTheme('light')

			expect(engineUtils.storageSet).toHaveBeenCalledWith({ [STORAGE_CONSTANTS.SLOP_BLOCKING_THEME.KEY]: 'light' })
		})
		it('should throw error on unsupported theme', async ({ themeUtils, engineUtils }) => {
			await expect(themeUtils.setTheme('unsupported theme'))
				.rejects
				.toThrow('Supported themes are only dark and light')
			expect(engineUtils.storageSet).not.toHaveBeenCalled()
		})
	})
	describe('getTheme', () => {
		it('should return the dark theme by default', async ({ themeUtils, engineUtils }) => {
			engineUtils.storageGet.mockResolvedValueOnce({})

			const theme = await themeUtils.getTheme()

			expect(theme).toBe('dark')
			expect(engineUtils.storageGet).toHaveBeenCalled()
		})
		it('should return the correct theme if set', async ({ themeUtils, engineUtils }) => {
			engineUtils.storageGet.mockResolvedValueOnce({ [STORAGE_CONSTANTS.SLOP_BLOCKING_THEME.KEY]: 'light' })

			const theme = await themeUtils.getTheme()

			expect(theme).toBe('light')
			expect(engineUtils.storageGet).toHaveBeenCalled()
		})
	})
	describe('setSlopBlockingEnabled', () => {
		it('should call the proper internals', async ({ themeUtils, engineUtils }) => {
			await themeUtils.setSlopBlockingEnabled(true)

			expect(engineUtils.storageSet).toHaveBeenCalledWith({ [STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.KEY]: true })
			expect(engineUtils.runtime).toHaveBeenCalled()
			expect(engineUtils.runtime().sendMessage).toHaveBeenCalledWith({
				type: MESSAGE_CONSTANTS.HIDE_AI_SLOP_TOGGLE_MESSAGE,
				enabled: true
			})
		})
	})
	describe('isSlopBlockingEnabled', () => {
		it('should be enabled by default on empty store', async ({ themeUtils, engineUtils }) => {
			engineUtils.storageGet.mockResolvedValueOnce({})

			const isEnabled = await themeUtils.isSlopBlockingEnabled()

			expect(isEnabled).toBe(STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.DEFAULT_VALUE)
			expect(engineUtils.storageGet).toHaveBeenCalled()
		})
		it('should be enabled by default on missing key', async ({ themeUtils, engineUtils }) => {
			engineUtils.storageGet.mockResolvedValueOnce({ 'unrelatedKey': true })

			const isEnabled = await themeUtils.isSlopBlockingEnabled()

			expect(isEnabled).toBe(STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.DEFAULT_VALUE)
			expect(engineUtils.storageGet).toHaveBeenCalled()
		})
		it('should get the value out of the store', async ({ themeUtils, engineUtils }) => {
			engineUtils.storageGet.mockResolvedValueOnce({ [STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.KEY]: false })

			const isEnabled = await themeUtils.isSlopBlockingEnabled()

			expect(isEnabled).toBe(false)
			expect(engineUtils.storageGet).toHaveBeenCalled()
		})
	})
	describe('getDedication', () => {
		it('should return the default dedication on empty store', async ({ themeUtils, engineUtils }) => {
			engineUtils.storageGet.mockResolvedValueOnce({})

			const dedication = await themeUtils.getDedication()

			expect(dedication).toBe(STORAGE_CONSTANTS.SLOP_BLOCKING_DEDICATION.DEFAULT_VALUE)
			expect(engineUtils.storageGet).toHaveBeenCalled()
		})
		it('should return the default dedication on missing key', async ({ themeUtils, engineUtils }) => {
			engineUtils.storageGet.mockResolvedValueOnce({ 'unrelatedKey': 'such value' })

			const dedication = await themeUtils.getDedication()

			expect(dedication).toBe(STORAGE_CONSTANTS.SLOP_BLOCKING_DEDICATION.DEFAULT_VALUE)
			expect(engineUtils.storageGet).toHaveBeenCalled()
		})
		it('should return the default dedication on missing key', async ({ themeUtils, engineUtils }) => {
			const overriddenDedication = 'Even more ❤️💕💘 for Hania'
			engineUtils.storageGet.mockResolvedValueOnce({ [STORAGE_CONSTANTS.SLOP_BLOCKING_DEDICATION.KEY]: overriddenDedication })

			const dedication = await themeUtils.getDedication()

			expect(dedication).toBe(overriddenDedication)
			expect(engineUtils.storageGet).toHaveBeenCalled()
		})
	})
	describe('setDedication', () => {
		it('should call the proper internals', async ({ themeUtils, engineUtils }) => {
			const overriddenDedication = 'A tremendous amount of 💖💞 and 🤗 for Hania'

			await themeUtils.setDedication(overriddenDedication)

			expect(engineUtils.storageSet).toHaveBeenCalledWith({ [STORAGE_CONSTANTS.SLOP_BLOCKING_DEDICATION.KEY]: overriddenDedication })
		})
	})
	describe('getRemovals', () => {
		it('should return the default value on empty store', async ({ themeUtils, engineUtils }) => {
			engineUtils.storageGet.mockResolvedValueOnce({})

			const removals = await themeUtils.getRemovals()

			expect(removals).toStrictEqual({})
			expect(engineUtils.storageGet).toHaveBeenCalled()
		})
		it('should prune the website key', async ({ themeUtils, engineUtils }) => {
			engineUtils.storageGet.mockResolvedValueOnce({
				[STORAGE_CONSTANTS.SLOP_BLOCKING_THEME.KEY]: 'dark',
				'google': 420,
				'youtube': 1337,
				[STORAGE_CONSTANTS.SLOP_BLOCKING_DEDICATION.KEY]: 'With 💖💞 love to Hania',
				[STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.KEY]: false
			})

			const removals = await themeUtils.getRemovals()

			expect(removals).toStrictEqual({ 'google': 420, 'youtube': 1337 })
			expect(engineUtils.storageGet).toHaveBeenCalled()
		})
		it('should handle str keys as well', async ({ themeUtils, engineUtils }) => {
			engineUtils.storageGet.mockResolvedValueOnce({ 'google': '420' })

			const removals = await themeUtils.getRemovals()

			expect(removals).toStrictEqual({ 'google': 420 })
			expect(engineUtils.storageGet).toHaveBeenCalled()
		})
	})
	describe('removeWebsite', () => {
		it('should call the proper internals', async ({ themeUtils, engineUtils }) => {
			const website = 'google'

			await themeUtils.removeWebsite(website)

			expect(engineUtils.storageRemove).toHaveBeenCalledWith(website)
		})
	})
})