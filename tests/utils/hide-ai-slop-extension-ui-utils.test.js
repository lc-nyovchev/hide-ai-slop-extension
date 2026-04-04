import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InterfaceBuilder, ThemeUtils } from '../../src/utils/hide-ai-slop-extension-ui-utils.js'
import { MESSAGE_CONSTANTS, STORAGE_CONSTANTS, UI_CONSTANTS } from '../../src/utils/hide-ai-slop-extension-utils.js'
import testUtils from '../test-utils.js'

vi.hoisted(async () => {
	const van = await import('vanjs-core')
	const vanX = await import('vanjs-ext')
	globalThis.van = van.default || van
	globalThis.vanX = vanX
})

describe('ui-utils', () => {
	beforeEach((context) => {
		const engineUtils = testUtils.mockEngineUtils()
		context.themeUtils = new ThemeUtils(engineUtils)
		context.engineUtils = engineUtils
	})
	describe('ThemeUtils', () => {
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
		})
		describe('removeWebsite', () => {
			it('should call the proper internals', async ({ themeUtils, engineUtils }) => {
				const website = 'google'

				await themeUtils.removeWebsite(website)

				expect(engineUtils.storageRemove).toHaveBeenCalledWith(website)
			})
		})
	})
	/**
	 * @vitest-environment jsdom
	 */
	describe('InterfaceBuilder', () => {
		describe('createTableRow', () => {
			beforeEach(async (context) => {
				const { themeUtils } = context
				context.interfaceBuilder = new InterfaceBuilder(true, 'dark', 'With ❤️ to Hania', {}, 5000, themeUtils)
			})
			it('should create a table row with the correct data and handlers', async ({ interfaceBuilder }) => {
				const nrRemovals = 42
				const website = 'youtube'
				const deleter = vi.fn()

				const row = interfaceBuilder.createTableRow(nrRemovals, deleter, website)

				expect(row.outerHTML).toMatchInlineSnapshot(testUtils.sanitizeHtml(`
                    <tr>
                      <td>${website}</td>
                      <td>${nrRemovals}</td>
                      <td>
                        <div class="button-container">
                          <div class="button-inner-container" title="${UI_CONSTANTS.TABLE_ROWS_CONTROLS.DELETE_BUTTON_TITLE}">
                            <i class="fa-solid fa-trash fa-xs"></i>
                          </div>
                        </div>
                      </td>
                    </tr>
                  `))
			})
		})
	})
})


