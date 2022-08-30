
import { Reducer } from "redux"
import { InitializeAction, UpdateTargetSenkaAction } from "./actions"

type Action = UpdateTargetSenkaAction | InitializeAction

export const reducer: Reducer<number, Action> = (state = 3600, payload) => {
  const { type } = payload
  switch (type) {
  case '@@poi-plugin-senka-calc/initialize': {
    const { archive } = payload
    return archive.targetSenka
  }
  case '@@poi-plugin-senka-calc/update-target-senka': {
    const { value } = payload
    if (value >= 0) {
      return value
    }
    return state
  }
  default: {
    return state
  }
  }
}
