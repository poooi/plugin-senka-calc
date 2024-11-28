import moment from "moment-timezone"
import { Archive, SenkaQuestT } from "./type"

export const MILLISECONDS_OF_1_HOUR = 1000 * 60 * 60

export const MILLISECONDS_OF_12_HOURS = MILLISECONDS_OF_1_HOUR * 12

export const MILLISECONDS_OF_24_HOURS = MILLISECONDS_OF_1_HOUR * 24

export const EX_MAPS: Record<number, number> = {
  15: 75,
  16: 75,
  25: 100,
  35: 150,
  45: 180,
  55: 200,
  65: 250,
  75: 170,
}

export const EXPERIENCE_TO_SENKA_RATE = 7 / 10000

export const SENKA_QUESTS: SenkaQuestT[] = [
  {
    id: 854,
    senka: 350,
    name: '戦果拡張任務！「Z作戦」前段作戦',
    shortname: 'Z作戦前',
    code: 'Bq2',
  },
  {
    id: 888,
    senka: 	200,
    name: '新編成「三川艦隊」、鉄底海峡に突入せよ！',
    shortname: '三川艦隊',
    code: 'Bq7',
  },
  {
    id: 893,
    senka: 300,
    name: '泊地周辺海域の安全確保を徹底せよ！',
    shortname: '泊地周辺',
    code: 'Bq8',
  },
  {
    id: 872,
    senka: 400,
    name: '戦果拡張任務！「Z作戦」後段作戦',
    shortname: 'Z作戦後',
    code: 'Bq10',
  },
  {
    id: 284,
    senka: 80,
    name: '南西諸島方面「海上警備行動」発令！',
    shortname: '海上警備',
    code: 'Bq11',
  },
  {
    id: 845,
    senka: 330,
    name: '発令！「西方海域作戦」',
    shortname: '西方海域',
    code: 'Bq12',
  },
  {
    id: 903,
    senka: 390,
    name: '拡張「六水戦」、最前線へ！',
    shortname: '六水戦',
    code: 'Bq13',
  },
]

// Zero-based: March, June, September, December
export const QUARTERLY_QUEST_REFRESH_MONTH = [2, 5, 8, 11]

export const EMPTY_ARCHIVE: Archive = {
  experienceHistory: {},
  rank5: {},
  rank20: {},
  rank100: {},
  rank501: {},
  rankUser: {},
  targetSenka: 3600,
  exHistory: {},
  questHistory: {},
  excludedQuests: [],
  magic: -1,
  currentRank: -1,
  date: moment.tz('Asia/Tokyo').format(),
}
