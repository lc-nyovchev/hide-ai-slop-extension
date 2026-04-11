import { STORAGE_CONSTANTS, UI_CONSTANTS, EngineUtils, MESSAGE_CONSTANTS } from './hide-ai-slop-extension-utils.js'

const { h2, h3, div, i, table, thead, tbody, tr, td, th, input } = van.tags

export class ThemeUtils {
	constructor(engineUtils = new EngineUtils(chrome)) {
		this.engineUtils = engineUtils
	}
	async setTheme(theme) {
		if (theme !== UI_CONSTANTS.COLOR_PALETTES.DARK && theme !== UI_CONSTANTS.COLOR_PALETTES.LIGHT) {
			const msg = `Supported themes are only ${UI_CONSTANTS.COLOR_PALETTES.DARK} and ${UI_CONSTANTS.COLOR_PALETTES.LIGHT}`
			console.error(msg)
			throw new Error(msg)
		}
		return await this.engineUtils.storageSet({ [STORAGE_CONSTANTS.SLOP_BLOCKING_THEME.KEY]: theme })
	}
	async getTheme() {
		const store = await this.engineUtils.storageGet()
		const currentTheme = store[STORAGE_CONSTANTS.SLOP_BLOCKING_THEME.KEY]
		if (currentTheme !== UI_CONSTANTS.COLOR_PALETTES.DARK && currentTheme !== UI_CONSTANTS.COLOR_PALETTES.LIGHT) {
			return STORAGE_CONSTANTS.SLOP_BLOCKING_THEME.DEFAULT_VALUE
		}
		return currentTheme
	}
	async setSlopBlockingEnabled(enabled) {
		await this.engineUtils.storageSet({ [STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.KEY]: enabled })
		this.engineUtils.runtime().sendMessage({
			type: MESSAGE_CONSTANTS.HIDE_AI_SLOP_TOGGLE_MESSAGE,
			enabled: enabled
		})
	}
	async isSlopBlockingEnabled() {
		const store = await this.engineUtils.storageGet()
		const isEnabled = store[STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.KEY]
		if (typeof isEnabled === 'undefined') {
			return STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.DEFAULT_VALUE
		}
		return isEnabled
	}
	async getDedication() {
		const store = await this.engineUtils.storageGet()
		const dedication = store[STORAGE_CONSTANTS.SLOP_BLOCKING_DEDICATION.KEY]
		if (typeof dedication === 'undefined') {
			return STORAGE_CONSTANTS.SLOP_BLOCKING_DEDICATION.DEFAULT_VALUE
		}
		return dedication
	}
	async setDedication(dedication) {
		return await this.engineUtils.storageSet({ [STORAGE_CONSTANTS.SLOP_BLOCKING_DEDICATION.KEY]: dedication })
	}
	async getRemovals() {
		const points = await this.engineUtils.storageGet()
		delete points[STORAGE_CONSTANTS.SLOP_BLOCKING_THEME.KEY]
		delete points[STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.KEY]
		delete points[STORAGE_CONSTANTS.SLOP_BLOCKING_DEDICATION.KEY]
		return Object.fromEntries(
			Object
				.entries(points)
				.map(([key, value]) => {
					const points = parseInt(value, 10)
					if (points) {
						return [key, points]
					} else {
						return [key, 0]
					}
				}))
	}
	async getRemovalsForWebsite(website) {
		const points = await this.getRemovals()
		const removalsForWebsite = points[website]
		return removalsForWebsite ? removalsForWebsite : 0
	}
	async setSlopRemovalsForWebsite(website, removals) {
		console.debug(`Slop removals for ${website} set to ${removals}`)
		return await this.engineUtils.storageSet({[website]: removals})
	}
	async removeWebsite(website) {
		return this.engineUtils.storageRemove(website)
	}
	isEnabled(store) {
		if (typeof store[STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.KEY] === 'undefined') {
			return STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.DEFAULT_VALUE
		} else {
			return store[STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.KEY]
		}
	}
	getIconPath(enabled) {
		return enabled ? this.engineUtils.runtime().getURL(UI_CONSTANTS.DEFAULT_ICON_PATH) : this.engineUtils.runtime().getURL(UI_CONSTANTS.DISABLED_ICON_PATH)
	}
	async setIconAndTitle() {
		const store = await this.engineUtils.storageGet()
		const enabled = this.isEnabled(store)
		this.engineUtils.action().setIcon({path: this.getIconPath(enabled)})
		this.engineUtils.action().setTitle({title: enabled ? UI_CONSTANTS.DEFAULT_TITLE : UI_CONSTANTS.DISABLED_TITLE})
	}
}



export class InterfaceBuilder {
	constructor(
		enabled = STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.DEFAULT_VALUE,
		colorPalette = STORAGE_CONSTANTS.SLOP_BLOCKING_THEME.DEFAULT_VALUE,
		dedication = STORAGE_CONSTANTS.SLOP_BLOCKING_DEDICATION.DEFAULT_VALUE,
		removals = {},
		refreshInterval = 5000,
		themeUtils = new ThemeUtils()
	) {
		this.refreshInterval = refreshInterval
		this.themeUtils = themeUtils
		this.state = vanX.reactive({
			enabled: enabled,
			removals: removals,
			colorPalette: colorPalette,
			dedication: dedication
		})
	}
	async getRemovals() {
		return this.themeUtils.getRemovals()
	}
	async checkForChanges() {
		const newRemovals = await this.getRemovals()
		for (const website in this.state.removals) {
			if (!newRemovals.hasOwnProperty(website)) {
				delete this.state.removals[website]
			}
		}
		for (const website in newRemovals) {
			if (this.state.removals[website] !== newRemovals[website]) {
				this.state.removals[website] = newRemovals[website]
			}
		}
	}
	createContainer() {
		van.derive(() => {
			document.body.className = this.state.colorPalette
		})
		return div(
			{ class: `container` },
			this.createHeader(),
			this.createControls(this.state),
			this.createDedication(this.state),
			this.createTable(this.state.removals)
		)
	}
	createTable(removals) {
		return table(
			this.createTableHeader(),
			vanX.list(tbody, removals, (score, deleter, website) => this.createTableRow(score, deleter, website))
		)
	}
	createTableHeader() {
		return thead(
			tr(
				th(UI_CONSTANTS.TABLE_HEADERS.WEBSITE),
				th(UI_CONSTANTS.TABLE_HEADERS.SLOPS_REMOVED),
				th(UI_CONSTANTS.TABLE_HEADERS.DELETE)
			)
		)
	}
	createTableRow(nrRemovals, deleter, website) {
		return tr(
			td(website),
			td(nrRemovals),
			td(
				div(
					{
						class: 'button-container'
					},
					div(
						{
							class: 'button-inner-container',
							onclick: async () => {
								await this.themeUtils.removeWebsite(website)
								deleter()
							},
							title: UI_CONSTANTS.TABLE_ROWS_CONTROLS.DELETE_BUTTON_TITLE
						},
						i(
							{
								class: 'fa-solid fa-trash fa-xs'
							}
						)
					)
				)
			)
		)
	}
	createToggleEnabledButton(state) {
		const control = UI_CONSTANTS.CONTROLS.TOGGLE_ENABLED_BUTTON
		return div(
			{
				class: 'button-container toggle-enabled-button'
			},
			div(
				{
					class: 'button-inner-container',
					onclick: async () => {
						await this.themeUtils.setSlopBlockingEnabled(!state.enabled)
						state.enabled = !state.enabled
					},
					title: () => {
						if (state.enabled) {
							return control.TITLE_ENABLED
						} else {
							return control.TITLE_DISABLED
						}
					}
				},
				i({
					class: () => {
						if (state.enabled) {
							return 'fa-solid fa-toggle-on fa-lg'
						} else {
							return 'fa-solid fa-toggle-off fa-lg'
						}
					}
				}),
				div(
					() => {
						return state.enabled ? control.ON_TEXT : control.OFF_TEXT
					}
				)
			)
		)
	}
	createColorPaletteSwitcher(state) {
		return div(
			{
				class: 'button-container color-switcher'
			},
			div(
				{
					class: 'button-inner-container',
					onclick: async () => {
						const theme = state.colorPalette === UI_CONSTANTS.COLOR_PALETTES.LIGHT ? UI_CONSTANTS.COLOR_PALETTES.DARK : UI_CONSTANTS.COLOR_PALETTES.LIGHT
						await this.themeUtils.setTheme(theme)
						state.colorPalette = theme
					},
					title: UI_CONSTANTS.CONTROLS.CHANGE_THEME_TITLE
				},
				i({
					class: () => {
						if (state.colorPalette === UI_CONSTANTS.COLOR_PALETTES.LIGHT) {
							return 'fa-regular fa-sun fa-lg'
						} else {
							return 'fa-regular fa-moon fa-lg'
						}
					}
				})
			)
		)
	}
	createControls(state) {
		return div(
			{
				class: 'controls-container'
			},
			this.createColorPaletteSwitcher(state),
			this.createToggleEnabledButton(state)
		)
	}
	createHeader() {
		return h2(UI_CONSTANTS.DEFAULT_TITLE)
	}
	createDedication(state) {
		const editMode = van.state(false)
		return h3(
			{
				onclick: () => {
					editMode.val = !editMode.val
				}
			},
			() => {
				if (!editMode.val) {
					return div(
						{
							class: 'dedication-container',
							title: UI_CONSTANTS.CONTROLS.DEDICATION.TITLE_EDIT
						},
						state.dedication,
						i(
							{
								class: 'fa-solid fa-pencil fa-xs edit-icon'
							}
						)
					)
				} else {
					const inputElement = input(
						{
							value: () => state.dedication,
							placeholder: UI_CONSTANTS.CONTROLS.DEDICATION.PLACEHOLDER,
							onfocusout: () => {
								editMode.val = false
							},
							oninput: async (event) => {
								state.dedication = event.target.value
								await this.themeUtils.setDedication(state.dedication)
							},
							onclick: (event) => {
								event.stopPropagation()
							},
							onkeydown: (event) => {
								if (event.code === 'Enter') {
									editMode.val = false
								} else if (event.code === 'Escape') {
									event.preventDefault()
									editMode.val = false
								}
							}
						}
					)
					setTimeout(() => inputElement.focus())
					return inputElement
				}
			}
		)
	}
}

export const init = () => {
	Promise.resolve(new ThemeUtils()).then((themeUtils) => {
		Promise.all([
			themeUtils.isSlopBlockingEnabled(),
			themeUtils.getTheme(),
			themeUtils.getDedication(),
		]).then(([enabled, theme, dedication]) => {
			const interfaceBuilder = new InterfaceBuilder(enabled, theme, dedication, {}, 5000, themeUtils)
			interfaceBuilder.checkForChanges().then(() => {
				van.add(document.body, interfaceBuilder.createContainer())
			})
			setInterval(async () => {
				await interfaceBuilder.checkForChanges()
			}, interfaceBuilder.refreshInterval)
		})
	})
}

