import { ExQuestHistory } from "../lib/type"
import { Reducer } from "redux"
import { getDateNo } from "../lib/util"
import { EX_MAPS } from "../lib/const"
import moment from "moment-timezone"
import { APIGetMemberMapinfoResponseAction, InitializeAction } from "./actions"

type Action = APIGetMemberMapinfoResponseAction | InitializeAction

export const reducer: Reducer<ExQuestHistory, Action> = (state = {}, payload) => {
  const { type } = payload
  switch (type) {
  case '@@poi-plugin-senka-calc/initialize': {
    const { archive } = payload
    return archive.exHistory
  }
  case '@@Response/kcsapi/api_get_member/mapinfo': {
    const current = moment.tz('Asia/Tokyo')
    const lastOfSenka = moment.tz('Asia/Tokyo').endOf('month').subtract(2, 'hours')
    // Don't record senka after 22:00 of the end day of month
    if (current.isAfter(lastOfSenka)) {
      return state
    }
    const { body } = payload
    const newState = { ...state }
    const clearedMapList = Object.keys(EX_MAPS).map(id => parseInt(id))
      .filter((id) => {
        const map = body.api_map_info.find(({ api_id }) => api_id === id)
        return map && map.api_cleared > 0
      })
    const clearedMapSet = new Set(clearedMapList)
    // Keep state sync with map data
    for (const key of Object.keys(newState)) {
      const ts = parseInt(key)
      newState[ts] = newState[ts].filter(id => clearedMapSet.has(id))
    }
    const currentExSet = new Set(Object.values(state).reduce((a, b) => [...a, ...b], []))
    const newClearedEx = clearedMapList.filter(id => !currentExSet.has(id))
    if (newClearedEx.length) {
      const rankNo = getDateNo()
      if (!newState[rankNo]) {
        newState[rankNo] = []
      }
      newState[rankNo] = [
        ...newState[rankNo],
        ...newClearedEx,
      ]
    }
    return newState
  }
  default: {
    return state
  }
  }
}
