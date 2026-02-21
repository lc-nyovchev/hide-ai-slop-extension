import {STORAGE_CONSTANTS, UI_CONSTANTS, EngineUtils, MESSAGE_CONSTANTS} from './hide-ai-slop-extension-utils.js'

const {h2, h3, div, i, table, thead, tbody, tr, td, th} = van.tags

const ThemeUtils = {
    async setTheme(theme) {
        if (theme !== UI_CONSTANTS.COLOR_PALETTES.DARK && theme !== UI_CONSTANTS.COLOR_PALETTES.LIGHT) {
            console.error(`Supported themes are only ${UI_CONSTANTS.COLOR_PALETTES.DARK} and ${UI_CONSTANTS.COLOR_PALETTES.LIGHT}`)
        }
        return await EngineUtils.storageSet({[STORAGE_CONSTANTS.SLOP_BLOCKING_THEME.KEY]: theme})
    },
    async getTheme() {
        const store = await EngineUtils.storageGet()
        const currentTheme = store[STORAGE_CONSTANTS.SLOP_BLOCKING_THEME.KEY]
        if (currentTheme !== UI_CONSTANTS.COLOR_PALETTES.DARK && currentTheme !== UI_CONSTANTS.COLOR_PALETTES.LIGHT) {
            return STORAGE_CONSTANTS.SLOP_BLOCKING_THEME.DEFAULT_VALUE
        } else {
            return currentTheme
        }
    },
    async setSlopBlockingEnabled(enabled) {
        await EngineUtils.storageSet({[STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.KEY]: enabled})
        EngineUtils.runtime().sendMessage({
            type: MESSAGE_CONSTANTS.HIDE_AI_SLOP_TOGGLE_MESSAGE,
            enabled: enabled
        })
    },
    async isSlopBlockingEnabled() {
        const store = await EngineUtils.storageGet()
        const isEnabled = store[STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.KEY]
        if (typeof isEnabled === 'undefined') {
            return STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.DEFAULT_VALUE
        }
        return isEnabled
    }
}

class InterfaceBuilder {
    constructor(
        enabled = STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.DEFAULT_VALUE,
        colorPalette = STORAGE_CONSTANTS.SLOP_BLOCKING_THEME.DEFAULT_VALUE,
        removals = {},
        refreshInterval = 5000
    ) {
        this.refreshInterval = refreshInterval
        this.state = vanX.reactive({
            enabled: enabled,
            removals: removals,
            colorPalette: colorPalette
        })
    }

    async getRemovals() {
        const points = await EngineUtils.storageGet()
        delete points[STORAGE_CONSTANTS.SLOP_BLOCKING_THEME.KEY]
        delete points[STORAGE_CONSTANTS.SLOP_BLOCKING_ENABLED.KEY]
        return points
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
            {class: `container`},
            this.createHeader(),
            this.createControls(this.state),
            this.createDedication(),
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
                        class: 'clear-button',
                        onclick: async () => {
                            await EngineUtils.storageRemove(website)
                            deleter()
                        }
                    },
                    i(
                        {
                            class: 'fa-solid fa-trash fa-xs',
                            title: UI_CONSTANTS.TABLE_ROWS_CONTROLS.DELETE_BUTTON_TITLE
                        }
                    )
                )
            )
        )
    }

    createToggleEnabledButton(state) {
        const control = UI_CONSTANTS.CONTROLS.TOGGLE_ENABLED_BUTTON
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
                        return control.TITLE_ENABLED
                    } else {
                        return control.TITLE_DISABLED
                    }
                }
            }),
            div(
                () => {
                    return state.enabled ? control.ON_TEXT : control.OFF_TEXT
                }
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
        return h3(UI_CONSTANTS.DEFAULT_DEDICATION)
    }
}

Promise.all([
    ThemeUtils.isSlopBlockingEnabled(),
    ThemeUtils.getTheme()
]).then(([enabled, theme]) => {
    const interfaceBuilder = new InterfaceBuilder(enabled, theme)
    interfaceBuilder.checkForChanges().then(() => {
        van.add(document.body, interfaceBuilder.createContainer())
    })

    setInterval(async () => {
        await interfaceBuilder.checkForChanges()
    }, interfaceBuilder.refreshInterval)
})