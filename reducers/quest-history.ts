import { Reducer } from "redux"
import { ExQuestHistory } from "../lib/type"
import { getDateNo } from "../lib/util"
import { QUARTERLY_QUEST_REFRESH_MONTH, SENKA_QUESTS } from "../lib/const"
import moment from "moment-timezone"
import { APIReqQuestClearitemgetRequestAction, InitializeAction } from "./actions"

type Action = APIReqQuestClearitemgetRequestAction | InitializeAction

export const reducer: Reducer<ExQuestHistory, Action> = (state = {}, payload) => {
  const { type } = payload
  switch (type) {
  case '@@poi-plugin-senka-calc/initialize': {
    const { archive } = payload
    return archive.questHistory
  }
  case '@@Request/kcsapi/api_req_quest/clearitemget': {
    const current = moment.tz('Asia/Tokyo')
    const lastOfSenkaCycle = moment.tz('Asia/Tokyo').endOf('month').subtract(10, 'hours')
    const monthlyTaskRefresh = moment.tz('Asia/Tokyo').startOf('month').add(5, 'hours')
    // The task is from last quarterly cycle. Senka goes to blackhole.
    if (QUARTERLY_QUEST_REFRESH_MONTH.includes(current.month()) && current.isBefore(monthlyTaskRefresh)) {
      return state
    }
    const { body } = payload
    const id = parseInt(body.api_quest_id)
    const quest = SENKA_QUESTS.find(quest => quest.id === id)
    if (quest) {
      // 1000: will move to next month
      const rankNo = current.isAfter(lastOfSenkaCycle) ? 1000 : getDateNo()
      const list = [
        ...state[rankNo] || [],
        id,
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
