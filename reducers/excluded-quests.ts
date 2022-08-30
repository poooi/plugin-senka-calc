import { Reducer } from "redux"
import { InitializeAction, UpdateExcludedQuestsAction } from "./actions"

type Action = UpdateExcludedQuestsAction | InitializeAction

export const reducer: Reducer<number[], Action> = (state = [], payload) => {
  const { type } = payload
  switch (type) {
  case '@@poi-plugin-senka-calc/initialize': {
    const { archive } = payload
    return archive.excludedQuests || state
  }
  case '@@poi-plugin-senka-calc/update-excluded-quests': {
    const { value } = payload
    const set = new Set(state)
    if (set.has(value)) {
      set.delete(value)
    } else {
      set.add(value)
    }
    return [...set]
  }
  default: {
    return state
  }
  }
}
