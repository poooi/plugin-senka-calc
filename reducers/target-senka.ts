
import { Reducer } from "redux"
import { InitializeAction, InputAction } from "../lib/type"

type Action = InputAction<number> | InitializeAction

export const reducer: Reducer<number, Action> = (state = 3600, payload) => {
  const { type } = payload
  switch (type) {
  case '@@poi-plugin-senka-calc/initialize': {
    const { archive } = payload as InitializeAction
    return archive.targetSenka
  }
  case '@@poi-plugin-senka-calc/update-target-senka': {
    const { value } = payload as InputAction<number>
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
