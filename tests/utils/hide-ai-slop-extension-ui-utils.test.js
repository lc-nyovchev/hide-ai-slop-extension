/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InterfaceBuilder } from '../../src/utils/hide-ai-slop-extension-ui-utils.js'
import { ThemeUtils, UI_CONSTANTS } from '../../src/utils/hide-ai-slop-extension-utils.js'
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
	describe('InterfaceBuilder', () => {
		beforeEach(async (context) => {
			const { themeUtils } = context
			context.interfaceBuilder = new InterfaceBuilder(true, 'dark', 'With ❤️ to Hania', {}, 5000, themeUtils)
		})
		describe('createTableHeader', () => {
			it('should generate the proper header', async ({ interfaceBuilder }) => {
				const header = testUtils.mockVanJSRender(interfaceBuilder.createTableHeader())

				expect(header.outerHTML).toMatchInlineSnapshot(testUtils.sanitizeHtml(`
					<thead>
						<tr>
							<th>${UI_CONSTANTS.TABLE_HEADERS.WEBSITE}</th>
							<th>${UI_CONSTANTS.TABLE_HEADERS.SLOPS_REMOVED}</th>
							<th>${UI_CONSTANTS.TABLE_HEADERS.DELETE}</th>
						</tr>
					</thead>
				`))
			})
		})
		describe('createTableRow', () => {
			it('should create a table row with the correct data and handlers', async ({ interfaceBuilder }) => {
				const nrRemovals = 42
				const website = 'youtube'
				const deleter = vi.fn()

				const row = testUtils.mockVanJSRender(interfaceBuilder.createTableRow(nrRemovals, deleter, website))

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
			it('should remove the website on click of the delete button', async ({ interfaceBuilder, themeUtils }) => {
				const nrRemovals = 42
				const website = 'youtube'
				const deleter = vi.fn()
				const removeWebsiteSpy = vi.spyOn(themeUtils, 'removeWebsite')

				const deleteButton = testUtils
					.mockVanJSRender(
						interfaceBuilder.createTableRow(nrRemovals, deleter, website)
					)
					.querySelector('.button-inner-container')

				deleteButton.click()

				await testUtils.verifyAsync(() => {
					expect(deleter).toHaveBeenCalled()
					expect(removeWebsiteSpy).toHaveBeenCalledWith(website)
				})
			})
		})
		describe('createHeader', () => {
			it('should create the proper header', async ({ interfaceBuilder }) => {
				const header = testUtils.mockVanJSRender(interfaceBuilder.createHeader())

				expect(header.outerHTML).toMatchInlineSnapshot(testUtils.sanitizeHtml(`
					<h2>
						${UI_CONSTANTS.DEFAULT_TITLE}
					</h2>
				`))
			})
		})
		describe('createToggleEnabledButton', () => {
			beforeEach(async ({ themeUtils }) => {
				vi.spyOn(themeUtils, 'setSlopBlockingEnabled')
			})
			it('should create the proper button when its enabled', async ({ interfaceBuilder }) => {
				const toggleEnabledButton = testUtils.mockVanJSRender(
					interfaceBuilder.createToggleEnabledButton(vanX.reactive({ enabled: true }))
				)

				expect(toggleEnabledButton.outerHTML).toMatchInlineSnapshot(testUtils.sanitizeHtml(`
					<div class="button-container toggle-enabled-button">
						<div class="button-inner-container" title="${UI_CONSTANTS.CONTROLS.TOGGLE_ENABLED_BUTTON.TITLE_ENABLED}">
							<i class="fa-solid fa-toggle-on fa-lg"></i>
							<div>
								${UI_CONSTANTS.CONTROLS.TOGGLE_ENABLED_BUTTON.ON_TEXT}
							</div>
						</div>
					</div>
				`))
			})
			it('should create the proper button when its disabled', async ({ interfaceBuilder }) => {
				const toggleEnabledButton = testUtils.mockVanJSRender(
					interfaceBuilder.createToggleEnabledButton(vanX.reactive({ enabled: false }))
				)

				expect(toggleEnabledButton.outerHTML).toMatchInlineSnapshot(testUtils.sanitizeHtml(`
					<div class="button-container toggle-enabled-button">
						<div class="button-inner-container" title="${UI_CONSTANTS.CONTROLS.TOGGLE_ENABLED_BUTTON.TITLE_DISABLED}">
							<i class="fa-solid fa-toggle-off fa-lg"></i>
							<div>
								${UI_CONSTANTS.CONTROLS.TOGGLE_ENABLED_BUTTON.OFF_TEXT}
							</div>
						</div>
					</div>
				`))
			})
			it('should create handle click and change state', async ({ interfaceBuilder, themeUtils }) => {
				const state = vanX.reactive({
					enabled: true
				})

				const toggleEnabledButton = testUtils.mockVanJSRender(interfaceBuilder.createToggleEnabledButton(state))

				toggleEnabledButton
					.querySelector('.button-inner-container')
					.click()

				await testUtils.verifyAsync(async () => {
					expect(state.enabled).toBe(false)
					expect(themeUtils.setSlopBlockingEnabled).toHaveBeenCalledWith(false)
					expect(toggleEnabledButton.outerHTML).toMatchInlineSnapshot(testUtils.sanitizeHtml(`
						<div class="button-container toggle-enabled-button">
							<div class="button-inner-container" title="${UI_CONSTANTS.CONTROLS.TOGGLE_ENABLED_BUTTON.TITLE_DISABLED}">
								<i class="fa-solid fa-toggle-off fa-lg"></i>
								<div>
									${UI_CONSTANTS.CONTROLS.TOGGLE_ENABLED_BUTTON.OFF_TEXT}
								</div>
							</div>
						</div>
					`))
				})
			})
		})
		describe('createColorPaletteSwitcher', () => {
			beforeEach(async ({ themeUtils }) => {
				vi.spyOn(themeUtils, 'setTheme')
			})
			it('should have the dark mode theme when state has it set', async ({ interfaceBuilder }) => {
				const state = vanX.reactive({
					colorPalette: UI_CONSTANTS.COLOR_PALETTES.DARK
				})
				const colorPaletteSwitcher = testUtils.mockVanJSRender(interfaceBuilder.createColorPaletteSwitcher(state))

				expect(colorPaletteSwitcher.outerHTML).toMatchInlineSnapshot(testUtils.sanitizeHtml(`
					<div class="button-container color-switcher">
						<div class="button-inner-container" title="${UI_CONSTANTS.CONTROLS.CHANGE_THEME_TITLE}">
							<i class="fa-regular fa-moon fa-lg"></i>
						</div>
					</div>
				`))
			})
			it('should have the light mode theme when state has it as set', async ({ interfaceBuilder }) => {
				const state = vanX.reactive({
					colorPalette: UI_CONSTANTS.COLOR_PALETTES.LIGHT
				})
				const colorPaletteSwitcher = testUtils.mockVanJSRender(interfaceBuilder.createColorPaletteSwitcher(state))

				expect(colorPaletteSwitcher.outerHTML).toMatchInlineSnapshot(testUtils.sanitizeHtml(`
					<div class="button-container color-switcher">
						<div class="button-inner-container" title="${UI_CONSTANTS.CONTROLS.CHANGE_THEME_TITLE}">
							<i class="fa-regular fa-sun fa-lg"></i>
						</div>
					</div>
				`))
			})
			it('should toggle between dark and light properly', async ({ themeUtils, interfaceBuilder }) => {
				const state = vanX.reactive({
					colorPalette: UI_CONSTANTS.COLOR_PALETTES.DARK
				})
				const colorPaletteSwitcher = testUtils.mockVanJSRender(interfaceBuilder.createColorPaletteSwitcher(state))

				colorPaletteSwitcher
					.querySelector('.button-inner-container')
					.click()

				await testUtils.verifyAsync(async () => {
					expect(state.colorPalette).toBe(UI_CONSTANTS.COLOR_PALETTES.LIGHT)
					expect(themeUtils.setTheme).toHaveBeenCalledWith(UI_CONSTANTS.COLOR_PALETTES.LIGHT)
					expect(colorPaletteSwitcher.outerHTML).toMatchInlineSnapshot(testUtils.sanitizeHtml(`
						<div class="button-container color-switcher">
							<div class="button-inner-container" title="${UI_CONSTANTS.CONTROLS.CHANGE_THEME_TITLE}">
								<i class="fa-regular fa-sun fa-lg"></i>
							</div>
						</div>
					`))
				})
			})
		})
	})
})


