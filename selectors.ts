import { EMPTY_ARCHIVE } from "./lib/const"
import { Selector } from "react-redux"
import { PluginState } from "reducers"
import { createSelector } from "reselect"
import { extensionSelectorFactory, IState } from "views/utils/selectors"

export const pluginDataSelector: Selector<IState, PluginState> = createSelector(
  extensionSelectorFactory('poi-plugin-senka-calc'),
  (state) => state as PluginState || EMPTY_ARCHIVE
)
