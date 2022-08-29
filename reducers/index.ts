import { combineReducers } from 'redux'
import { reducer as exHistoryReducer } from './ex-history'
import { reducer as experienceHistoryReducer } from './experience-history'
import { reducer as questHistoryReducer } from './quest-history'
import { reducerFactory as rankReducerFactory } from './rank-factory'
import { reducer as currentRankReducer } from './current-rank'
import { reducer as targetSenkaReducer } from './target-senka'
import { reducer as excludedQuestsReducer } from './excluded-quests'

export const reducer = combineReducers({
  experienceHistory: experienceHistoryReducer,
  rank5: rankReducerFactory(5),
  rank20: rankReducerFactory(20),
  rank100: rankReducerFactory(100),
  rank501: rankReducerFactory(501),
  rankUser: rankReducerFactory('user'),
  exHistory: exHistoryReducer,
  questHistory: questHistoryReducer,
  currentRank: currentRankReducer,
  targetSenka: targetSenkaReducer,
  excludedQuests: excludedQuestsReducer,
})

export type PluginState = ReturnType<typeof reducer>
