
import { Reducer } from "redux"

import { magicManager } from '../lib/magic'
import { APIRankingAction, InitializeAction } from "./actions"

type Action = APIRankingAction | InitializeAction


export const reducer: Reducer<number, Action> = (state = -1, payload) => {
  const { type } = payload
  switch (type) {
  case '@@poi-plugin-senka-calc/initialize': {
    const { archive } = payload
    return archive.currentRank
  }
  case '@@Response/kcsapi/api_req_ranking/mxltvkpyuklh': {
    const { body } = payload
    const userList = body.api_list
    magicManager.updateMagicNum(userList)
    const { nickname } = magicManager
    for (const user of userList) {
      if (user.api_mtjmdcwtvhdr === nickname) {
        return user.api_mxltvkpyuklh
      }
    }
    return state
  }
  default: {
    return state
  }
  }
}
