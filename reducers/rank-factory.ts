
import { Reducer } from "redux"
import { InitializeAction, RankingAPIData, APIAction, SenkaHistory, UserData } from "../lib/type"
import { getRankDateNo } from "../lib/util"

import { magicManager } from '../lib/magic'

type Anchor = 5 | 20 | 100 | 501 | 'user'
type Action = APIAction<RankingAPIData> | InitializeAction

function getUpdatedSenkaHistory(state: SenkaHistory, user: UserData) {
  const rankNo = user.api_mxltvkpyuklh
  const encryptedSenka = user.api_wuhnhojjxmke
  const senka = magicManager.decryptSenka(rankNo, encryptedSenka)
  const timeNo = getRankDateNo()
  return {
    ...state,
    [timeNo]: senka,
  }
}

export const reducerFactory = (anchor: Anchor): Reducer<SenkaHistory, Action> => {
  return (state = {}, payload) => {
    const { type } = payload
    switch (type) {
    case '@@poi-plugin-senka-calc/initialize': {
      const { archive } = payload as InitializeAction
      switch (anchor) {
      case 5:
        return archive.rank5
      case 20:
        return archive.rank20
      case 100:
        return archive.rank100
      case 501:
        return archive.rank501
      default:
        return archive.rankUser
      }
    }
    case '@@Response/kcsapi/api_req_ranking/mxltvkpyuklh': {
      const { body } = payload as APIAction<RankingAPIData>
      const userList = body.api_list
      const page = body.api_disp_page
      magicManager.updateMagicNum(userList)
      const { nickname } = magicManager
      for (const user of userList) {
        if (anchor === 'user') {
          if (user.api_mtjmdcwtvhdr === nickname) {
            return getUpdatedSenkaHistory(state, user)
          }
        } else {
          if (page === Math.ceil(anchor / 10)) {
            const user = userList[(anchor - 1) % 10]
            return getUpdatedSenkaHistory(state, user)
          }
        }
      }
      return state
    }
    default: {
      return state
    }
    }
  }
}
