const { h1, h3, table, div, tr, td, th, text, i } = van.tags

const CONSTANTS = {
	COLOR_PALETTES: {
		DARK: 'dark',
		LIGHT: 'light',
		DEFAULT: 'dark'
	},
	COLOR_PALETTES_THEME_STORE_KEY: 'HIDE_AI_SLOP_THEME',
	HEADER_CONSTANT: 'HIDE_AI_SLOP_EXTENSION_HEADER'
}

const ThemeUtils = {
	async setTheme(theme) {
		if (theme !== CONSTANTS.COLOR_PALETTES.DARK && theme !== CONSTANTS.COLOR_PALETTES.LIGHT) {
			console.error(`Supported themes are only ${CONSTANTS.COLOR_PALETTES.DARK} and ${CONSTANTS.COLOR_PALETTES.LIGHT}`)
		}
		return await chrome.storage.sync.set({[CONSTANTS.COLOR_PALETTES_THEME_STORE_KEY]: theme})
	},
	async getTheme() {
		const store = await chrome.storage.sync.get()
		const currentTheme = store[CONSTANTS.COLOR_PALETTES_THEME_STORE_KEY]
		if ((currentTheme !== CONSTANTS.COLOR_PALETTES.DARK && currentTheme !== CONSTANTS.COLOR_PALETTES.LIGHT)) {
			return CONSTANTS.COLOR_PALETTES.DEFAULT
		} else {
			return currentTheme
		}
	}
}

class InterfaceElementsBuilder {
	constructor(colorPalette = CONSTANTS.COLOR_PALETTES.DEFAULT, removals = {}, refreshInterval = 5000) {
		this.refreshInterval = refreshInterval
		this.state = vanX.reactive({
			removals: Object.assign(removals, {[CONSTANTS.HEADER_CONSTANT]: 420}),
			colorPalette: colorPalette
		})
	}

	async getRemovals() {
		const points = await chrome.storage.sync.get()
		delete points[CONSTANTS.COLOR_PALETTES_THEME_STORE_KEY]
		return points
	}

	async checkForChanges() {
		const newRemovals = await this.getRemovals()
		for (const website in newRemovals) {
			if (!this.state.removals.hasOwnProperty(website)) {
				this.state.removals[website] = newRemovals[website]
			}
		}
	}

	createContainer() {
		return div(
			{class: () => `container ${this.state.colorPalette}`},
			this.createHeader(),
			this.createDedication(),
			this.createColorPaletteSwitcher(this.state),
			this.createTable(this.state.removals)
		)
	}

	createTableHeader() {
		return tr(
			th('Website'),
			th('Slops Removed'),
			th('Delete')
		)
	}

	createTable(removals) {
		return vanX.list(
			() => table({class: 'removals-values'}),
			removals,
			(score, deleter, website) => this.createTableRow(score, deleter, website)
		)
	}

	createTableRow(score, deleter, website) {
		if (website === CONSTANTS.HEADER_CONSTANT) {
			return this.createTableHeader()
		}
		return tr(
			td(website),
			td(score),
			td(
				div({
						class: 'clear-button',
						onclick: async () => {
							await chrome.storage.sync.remove(website)
							deleter()
						}
					},
					i({class: 'fa-solid fa-trash fa-xs', title: 'Delete'})
				)
			)
		)
	}

	createColorPaletteSwitcher(state) {
		return div(
			{
				class: 'clear-button color-switcher',
				onclick: async () => {
					const theme = state.colorPalette === CONSTANTS.COLOR_PALETTES.LIGHT ? CONSTANTS.COLOR_PALETTES.DARK : CONSTANTS.COLOR_PALETTES.LIGHT
					await ThemeUtils.setTheme(theme)
					state.colorPalette = theme
				},
				title: 'Change theme'
			},
			i({
				class: () => {
					if (state.colorPalette === CONSTANTS.COLOR_PALETTES.LIGHT) {
						return 'fa-regular fa-sun fa-lg'
					} else {
						return 'fa-regular fa-moon fa-lg'
					}
				}
			}),
		)
	}

	createHeader() {
		return h1('Hide AI Slop')
	}

	createDedication() {
		return h3('With ❤️ to Hania')
	}
}

ThemeUtils.getTheme().then((theme) => {
	const interfaceElementsBuilder = new InterfaceElementsBuilder(theme)
	interfaceElementsBuilder.checkForChanges().then(() => {
		van.add(document.body, interfaceElementsBuilder.createContainer())
	})

	setInterval(async () => {
		await interfaceElementsBuilder.checkForChanges()
	}, interfaceElementsBuilder.refreshInterval)
})