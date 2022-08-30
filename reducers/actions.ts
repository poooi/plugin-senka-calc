import { Action } from 'redux'

import { APIPortPortResponse } from 'kcsapi/api_port/port/response'
import { APIReqPracticeBattleResultResponse } from 'kcsapi/api_req_practice/battle_result/response'
import { APIReqSortieBattleresultResponse } from 'kcsapi/api_req_sortie/battleresult/response'
import { APIReqCombinedBattleBattleresultResponse } from 'kcsapi/api_req_combined_battle/battleresult/response'
import { APIReqMissionResultResponse} from 'kcsapi/api_req_mission/result/response'
import { APIGetMemberBasicResponse } from 'kcsapi/api_get_member/basic/response'
import { APIGetMemberRecordResponse } from 'kcsapi/api_get_member/record/response'
import { APIReqQuestClearitemgetRequest } from 'kcsapi/api_req_quest/clearitemget/request'
import { Archive, RankingAPIData } from '../lib/type'
import { APIGetMemberMapinfoResponse } from 'kcsapi/api_get_member/mapinfo/response'

export interface InitializeAction extends Action {
  type: '@@poi-plugin-senka-calc/initialize',
  archive: Archive,
}

export interface APIPortPortResponseAction extends Action {
  type: '@@Response/kcsapi/api_port/port',
  body: APIPortPortResponse
}

export interface APIReqPracticeBattleResultResponseAction extends Action {
  type: '@@Response/kcsapi/api_req_practice/battle_result',
  body: APIReqPracticeBattleResultResponse,
}

export interface APIReqSortieBattleresultResponseAction extends Action {
  type: '@@Response/kcsapi/api_req_sortie/battleresult',
  body: APIReqSortieBattleresultResponse,
}

export interface APIReqCombinedBattleBattleresultResponseAction extends Action {
  type: '@@Response/kcsapi/api_req_combined_battle/battleresult'
  body: APIReqCombinedBattleBattleresultResponse,
}

export interface APIReqMissionResultResponseAction extends Action {
  type: '@@Response/kcsapi/api_req_mission/result',
  body: APIReqMissionResultResponse,
}

export interface APIGetMemberBasicResponseAction extends Action {
  type: '@@Response/kcsapi/api_get_member/basic',
  body: APIGetMemberBasicResponse,
}

export interface APIGetMemberRecordResponseAction extends Action {
  type: '@@Response/kcsapi/api_get_member/record',
  body: APIGetMemberRecordResponse,
}

export interface APIGetMemberMapinfoResponseAction extends Action {
  type: '@@Response/kcsapi/api_get_member/mapinfo',
  body: APIGetMemberMapinfoResponse,
}

export interface APIReqQuestClearitemgetRequestAction extends Action {
  type: '@@Request/kcsapi/api_req_quest/clearitemget',
  body: APIReqQuestClearitemgetRequest,
}

export interface APIRankingAction extends Action {
  type: '@@Response/kcsapi/api_req_ranking/mxltvkpyuklh',
  body: RankingAPIData,
}

export interface UpdateExcludedQuestsAction extends Action {
  type: '@@poi-plugin-senka-calc/update-excluded-quests',
  value: number,
}

export interface UpdateTargetSenkaAction extends Action {
  type: '@@poi-plugin-senka-calc/update-target-senka',
  value: number,
}
