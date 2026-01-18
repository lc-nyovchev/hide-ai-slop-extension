import {STORAGE_CONSTANTS, UI_CONSTANTS} from './hide-ai-slop-extension-utils.js'

const {h2, h3, table, div, tr, td, th, i} = van.tags

const ThemeUtils = {
    async setTheme(theme) {
        if (theme !== UI_CONSTANTS.COLOR_PALETTES.DARK && theme !== UI_CONSTANTS.COLOR_PALETTES.LIGHT) {
            console.error(`Supported themes are only ${UI_CONSTANTS.COLOR_PALETTES.DARK} and ${UI_CONSTANTS.COLOR_PALETTES.LIGHT}`)
        }
        return await chrome.storage.sync.set({[STORAGE_CONSTANTS.SLOP_BLOCKING_THEME.KEY]: theme})
    },
    async getTheme() {
        const store = await chrome.storage.sync.get()
        const currentTheme = store[STORAGE_CONSTANTS.SLOP_BLOCKING_THEME.KEY]
        if (currentTheme !== UI_CONSTANTS.COLOR_PALETTES.DARK && currentTheme !== UI_CONSTANTS.COLOR_PALETTES.LIGHT) {
            return STORAGE_CONSTANTS.SLOP_BLOCKING_THEME.DEFAULT_VALUE
        } else {
            return currentTheme
        }
    },
    async setSlopBlockingEnabled(enabled) {
        await chrome.storage.sync.set({[STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.KEY]: enabled})
        chrome.runtime.sendMessage({
            type: 'hideAiSlopToggleEnabled',
            enabled: enabled
        })
    },
    async isSlopBlockingEnabled() {
        const store = await chrome.storage.sync.get()
        const isEnabled = store[STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.KEY]
        if (typeof isEnabled === 'undefined') {
            return STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.DEFAULT_VALUE
        }
        return isEnabled
    }
}

class InterfaceElementsBuilder {
    constructor(
        enabled = STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.DEFAULT_VALUE,
        colorPalette = STORAGE_CONSTANTS.SLOP_BLOCKING_THEME.DEFAULT_VALUE,
        removals = {},
        refreshInterval = 5000
    ) {
        this.refreshInterval = refreshInterval
        this.state = vanX.reactive({
            enabled: enabled,
            removals: Object.assign(removals, {[UI_CONSTANTS.HEADER_CONSTANT]: 420}),
            colorPalette: colorPalette
        })
    }

    async getRemovals() {
        const points = await chrome.storage.sync.get()
        delete points[STORAGE_CONSTANTS.SLOP_BLOCKING_THEME.KEY]
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
            {
                class: () => `container ${this.state.colorPalette}`
            },
            this.createHeader(),
            this.createControls(this.state),
            this.createDedication(),
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

    createToggleEnabledButton(state) {
        return div(
            {
                class: 'clear-button toggle-enabled-button',
                onclick: async () => {
                    await ThemeUtils.setSlopBlockingEnabled(!state.enabled)
                    state.enabled = !state.enabled
                },
            },
            i({
                class: () => {
                    if (state.enabled) {
                        return 'fa-solid fa-toggle-on fa-lg'
                    } else {
                        return 'fa-solid fa-toggle-off fa-lg'
                    }
                },
                title: () => {
                    if (state.enabled) {
                        return 'Disable hiding slop'
                    } else {
                        return 'Enable hiding slop'
                    }
                }
            }),
            div(
                () => {
                    return state.enabled ? 'On' : 'Off'
                }
            )
        )
    }

    createTableRow(score, deleter, website) {
        if (website === UI_CONSTANTS.HEADER_CONSTANT) {
            return this.createTableHeader()
        }
        if (website === STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.KEY) {
            return null
        }
        return tr(
            td(website),
            td(score),
            td(
                div(
                    {
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
                    const theme = state.colorPalette === UI_CONSTANTS.COLOR_PALETTES.LIGHT ? UI_CONSTANTS.COLOR_PALETTES.DARK : UI_CONSTANTS.COLOR_PALETTES.LIGHT
                    await ThemeUtils.setTheme(theme)
                    state.colorPalette = theme
                },
                title: 'Change theme'
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
    }

    createControls(state) {
        return div(
            {class: 'controls-container'},
            this.createColorPaletteSwitcher(state),
            this.createToggleEnabledButton(state)
        )
    }

    createHeader() {
        return h2(UI_CONSTANTS.DEFAULT_TITLE)
    }

    createDedication() {
        return h3('With ❤️ to Hania')
    }
}

Promise.all([
    ThemeUtils.isSlopBlockingEnabled(),
    ThemeUtils.getTheme()
]).then(([enabled, theme]) => {
    const interfaceElementsBuilder = new InterfaceElementsBuilder(enabled, theme)
    interfaceElementsBuilder.checkForChanges().then(() => {
        van.add(document.body, interfaceElementsBuilder.createContainer())
    })

    setInterval(async () => {
        await interfaceElementsBuilder.checkForChanges()
    }, interfaceElementsBuilder.refreshInterval)
})