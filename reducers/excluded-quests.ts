import { InitializeAction, InputAction } from "lib/type"
import { Reducer } from "redux"

type Action = InputAction<number> | InitializeAction

export const reducer: Reducer<number[], Action> = (state = [], payload) => {
  const { type } = payload
  switch (type) {
  case '@@poi-plugin-senka-calc/initialize': {
    const { archive } = payload as InitializeAction
    return archive.excludedQuests || state
  }
  case '@@poi-plugin-senka-calc/update-excluded-quests': {
    const { value } = payload as InputAction<number>
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