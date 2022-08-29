
import { Reducer } from "redux"
import { InitializeAction, RankingAPIData, APIAction } from "../lib/type"

import { magicManager } from '../lib/magic'

type Action = APIAction<RankingAPIData> | InitializeAction


export const reducer: Reducer<number, Action> = (state = -1, payload) => {
  const { type } = payload
  switch (type) {
  case '@@poi-plugin-senka-calc/initialize': {
    const { archive } = payload as InitializeAction
    return archive.currentRank
  }
  case '@@Response/kcsapi/api_req_ranking/mxltvkpyuklh': {
    const { body } = payload as APIAction<RankingAPIData>
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
