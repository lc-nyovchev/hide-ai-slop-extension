import {beforeEach, describe, expect, it} from 'vitest'
import testUtils from '../test-utils.js'
import {EngineUtils, MESSAGE_CONSTANTS, STORAGE_CONSTANTS, UI_CONSTANTS} from '../../src/utils/hide-ai-slop-extension-utils.js'

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
    it('storageSet should call the proper internals', async ({engineUtils, chrome}) => {
        const value = {key: 'value'}

        await engineUtils.storageSet(value)

        expect(chrome.storage.sync.set).toHaveBeenCalledWith(value)
    })
    describe('storageGet', () => {
        it('should call the proper internals', async ({engineUtils, chrome}) => {
            await engineUtils.storageGet()

            expect(chrome.storage.sync.get).toHaveBeenCalled()
        })
        it('should return the correct value', async ({engineUtils, chrome}) => {
            const expectedResult = {youtube: '420', google: '1337', gmail: '1911'}
            chrome.storage.sync.get.mockResolvedValueOnce(expectedResult)

            const storage = await engineUtils.storageGet()

            expect(storage).toEqual(expectedResult)
        })
    })
    it('storageRemove call the proper internals', async ({engineUtils, chrome}) => {
        await engineUtils.storageRemove('google')

        expect(chrome.storage.sync.remove).toHaveBeenCalledWith('google')
    })
    it('runtime call the proper internals', ({engineUtils, chrome}) => {
        expect(engineUtils.runtime()).toBe(chrome.runtime)
    })
    it('action call the proper internals', ({engineUtils, chrome}) => {
        expect(engineUtils.action()).toBe(chrome.action)
    })
})


