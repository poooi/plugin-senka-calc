import { APIMstShip } from "kcsapi/api_start2/getData/response"

export type SenkaHistory = Record<number, number>
export type ExQuestHistory = Record<number, number[]>

export type MstShipMap = Record<number, APIMstShip>

export interface UserData {
  api_itbrdpdbkynm: string, // comment
  api_itslcqtmrxtf: number, //
  api_mtjmdcwtvhdr: string, // nickname
  api_mxltvkpyuklh: number, // rank
  api_pbgkfylkbjuy: number,
  api_pcumlrymlujh: number,
  api_wuhnhojjxmke: number, // encrypted key
}

export interface RankingAPIData {
  api_count: number,
  api_disp_page: number,
  api_list: UserData[],
  api_page_count: number,
}

export interface RankingAPIPayload {
  api_token: string,
  api_verno: number,
  api_ranking: number,
}

export interface SenkaAPIResponse {
  api_data: RankingAPIData,
  api_result: number,
  api_result_msg: string,
}

export interface Archive {
  experienceHistory: SenkaHistory,
  rank5: SenkaHistory,
  rank20: SenkaHistory,
  rank100: SenkaHistory,
  rank501: SenkaHistory,
  rankUser: SenkaHistory,
  currentRank: number,
  targetSenka: number,
  exHistory: ExQuestHistory,
  questHistory: ExQuestHistory,
  excludedQuests: number[],
  magic: number,
  date: string,
}

export interface LegacyArchive {
  lastmonth: number,

  // Experience record
  exphis: SenkaHistory,

  // Senka record
  r5his: SenkaHistory,
  r20his: SenkaHistory,
  r100his: SenkaHistory,
  r501his: SenkaHistory,
  myhis: SenkaHistory,

  mylastno:0,
  mylastranktime:0,

  mymagic: number,
  tmpexp: 0,
  tmpno: 0, // last update time no
  reviseType: 0, /* revise */
  targetsenka: 3600,
  fensureexp: 0,
  fensurets: 0,
  fensuresenka: 0,
  tensureexp:0,
  tensurets:0,
  extraSenkalist: number[], // quest
  rankuex: string[], // ex operation
  senkaType: 'calendar',
  chartType: 'mon',
}

export interface SenkaQuestT {
  id: number,
  senka: number,
  name: string,
  shortname: string,
  code: string,
}
