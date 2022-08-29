import { ExQuestHistory, InitializeAction, APIAction } from "../lib/type"
import { Reducer } from "redux"
import { APIGetMemberMapinfoResponse } from 'kcsapi/api_get_member/mapinfo/response'
import { getDateNo } from "../lib/util"
import { EX_MAPS } from "../lib/const"
import moment from "moment-timezone"

type Action = APIAction<APIGetMemberMapinfoResponse> | InitializeAction

export const reducer: Reducer<ExQuestHistory, Action> = (state = {}, payload) => {
  const { type } = payload
  switch (type) {
  case '@@poi-plugin-senka-calc/initialize': {
    const { archive } = payload as InitializeAction
    return archive.exHistory
  }
  case '@@Response/api_get_member/mapinfo/response': {
    const current = moment.tz('Asia/Tokyo')
    const lastOfSenka = moment.tz('Asia/Tokyo').endOf('month').subtract(2, 'hours')
    // Don't record senka after 22:00 of the end day of month
    if (current.isAfter(lastOfSenka)) {
      return state
    }
    const { body } = payload as APIAction<APIGetMemberMapinfoResponse>
    const currentClearedEx = new Set(Object.values(state).reduce((a, b) => [...a, ...b], []))
    const clearedMapList = Object.keys(EX_MAPS).map(id => parseInt(id))
      .filter((id) => {
        const map = body.api_map_info.find(({ api_id }) => api_id === id)
        return map && map.api_cleared > 0 && !currentClearedEx.has(id)
      })
    if (clearedMapList.length) {
      const rankNo = getDateNo()
      const list = [
        ...state[rankNo],
        ...clearedMapList,
      ]
      return {
        ...state,
        [rankNo]: list,
      }
    }
    return state
  }
  default: {
    return state
  }
  }
}
