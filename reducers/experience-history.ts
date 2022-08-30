import { getDateNo } from "../lib/util"
import { Reducer } from "redux"
import { APIPortPortResponse } from 'kcsapi/api_port/port/response'
import { APIReqPracticeBattleResultResponse } from 'kcsapi/api_req_practice/battle_result/response'
import { APIReqSortieBattleresultResponse } from 'kcsapi/api_req_sortie/battleresult/response'
import { APIReqCombinedBattleBattleresultResponse } from 'kcsapi/api_req_combined_battle/battleresult/response'
import { APIReqMissionResultResponse} from 'kcsapi/api_req_mission/result/response'
import { APIGetMemberBasicResponse } from 'kcsapi/api_get_member/basic/response'
import { APIGetMemberRecordResponse } from 'kcsapi/api_get_member/record/response'
import { InitializeAction, APIAction, SenkaHistory } from "../lib/type"
import moment from "moment-timezone"

type ExperienceAPIResponse =
  APIPortPortResponse |
  APIReqPracticeBattleResultResponse |
  APIReqSortieBattleresultResponse |
  APIReqMissionResultResponse |
  APIGetMemberBasicResponse |
  APIGetMemberRecordResponse |
  APIReqCombinedBattleBattleresultResponse

type Action = APIAction<ExperienceAPIResponse> | InitializeAction

const extractCurrentExperience = (type: string, body: ExperienceAPIResponse): number => {
  switch(type) {
  case '@@Response/kcsapi/api_get_member/basic': {
    return (body as APIGetMemberBasicResponse).api_experience
  }
  case '@@Response/kcsapi/api_get_member/record': {
    return (body as APIGetMemberRecordResponse).api_experience[0]
  }
  case '@@Response/kcsapi/api_req_mission/result': {
    return (body as APIReqMissionResultResponse).api_member_exp
  }
  case '@@Response/kcsapi/api_port/port': {
    return (body as APIPortPortResponse).api_basic.api_experience
  }
  case '@@Response/kcsapi/api_req_practice/battle_result': {
    return (body as APIReqPracticeBattleResultResponse).api_member_exp
  }
  case '@@Response/kcsapi/api_req_sortie/battleresult': {
    return (body as APIReqSortieBattleresultResponse).api_member_exp
  }
  case '@@Response/kcsapi/api_req_combined_battle/battleresult': {
    return (body as APIReqCombinedBattleBattleresultResponse).api_member_exp
  }
  default: {
    return -1
  }
  }
}

export const reducer: Reducer<SenkaHistory, Action> = (state = {}, payload) => {
  const { type } = payload
  if (type === '@@poi-plugin-senka-calc/initialize') {
    const { archive } = payload as InitializeAction
    return archive.experienceHistory
  } else {
    const { body } = payload as APIAction<ExperienceAPIResponse>
    const currentExperience = extractCurrentExperience(type, body)
    if (!currentExperience || currentExperience < 0) {
      return state
    }
    const current = moment.tz('Asia/Tokyo')
    const lastOfSenka = moment.tz('Asia/Tokyo').endOf('month').subtract(2, 'hours')
    // Don't record senka after 22:00 of the end day of month
    if (current.isAfter(lastOfSenka)) {
      return state
    }
    const dateNo = getDateNo()
    // 1000: current senka
    if (!state[dateNo]) {
      return {
        ...state,
        [dateNo]: currentExperience,
        1000: currentExperience,
      }
    } else {
      return {
        ...state,
        1000: currentExperience,
      }
    }
  }
}

