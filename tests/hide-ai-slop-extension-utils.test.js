import { describe, it, expect } from 'vitest'
import { UI_CONSTANTS, STORAGE_CONSTANTS } from '../src/hide-ai-slop-extension-utils.js'

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

    it('should have correct default dedication', () => {
        expect(UI_CONSTANTS.DEFAULT_DEDICATION).toBe('With ❤️ to Hania')
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
});


