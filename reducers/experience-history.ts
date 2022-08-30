import { getDateNo } from "../lib/util"
import { Reducer } from "redux"
import { SenkaHistory } from "../lib/type"
import moment from "moment-timezone"
import { APIGetMemberBasicResponseAction, APIGetMemberRecordResponseAction, APIPortPortResponseAction, APIReqCombinedBattleBattleresultResponseAction, APIReqMissionResultResponseAction, APIReqPracticeBattleResultResponseAction, APIReqSortieBattleresultResponseAction, InitializeAction } from "./actions"

type ExperienceAPIResponseAction =
  APIPortPortResponseAction |
  APIReqPracticeBattleResultResponseAction |
  APIReqSortieBattleresultResponseAction |
  APIReqMissionResultResponseAction |
  APIGetMemberBasicResponseAction |
  APIGetMemberRecordResponseAction |
  APIReqCombinedBattleBattleresultResponseAction

type Action = ExperienceAPIResponseAction | InitializeAction

const extractCurrentExperience = ({ type, body }: ExperienceAPIResponseAction): number => {
  switch(type) {
  case '@@Response/kcsapi/api_get_member/basic': {
    return body.api_experience
  }
  case '@@Response/kcsapi/api_get_member/record': {
    return body.api_experience[0]
  }
  case '@@Response/kcsapi/api_req_mission/result': {
    return body.api_member_exp
  }
  case '@@Response/kcsapi/api_port/port': {
    return body.api_basic.api_experience
  }
  case '@@Response/kcsapi/api_req_practice/battle_result': {
    return body.api_member_exp
  }
  case '@@Response/kcsapi/api_req_sortie/battleresult': {
    return body.api_member_exp
  }
  case '@@Response/kcsapi/api_req_combined_battle/battleresult': {
    return body.api_member_exp
  }
  default: {
    return -1
  }
  }
}

export const reducer: Reducer<SenkaHistory, Action> = (state = {}, payload) => {
  const { type } = payload
  if (type === '@@poi-plugin-senka-calc/initialize') {
    const { archive } = payload
    return archive.experienceHistory
  } else {
    const currentExperience = extractCurrentExperience(payload)
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
        [dateNo]: state[1000] || currentExperience,
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

