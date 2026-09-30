
import moment from "moment-timezone"
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
    // Keep refreshing the key even when the data is not recorded, see rank-factory
    magicManager.updateMagicNum(userList)
    const startOfRecord = moment.tz('Asia/Tokyo').startOf('month').add(3, 'hours')
    const now = moment.tz('Asia/Tokyo')
    // the ranking api still returns data of former month, skip recording
    if (now.isBefore(startOfRecord)) {
      return state
    }
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
