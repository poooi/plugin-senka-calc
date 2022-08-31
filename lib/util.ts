import path from 'path'
import fs from 'fs-extra'
import moment from 'moment-timezone'
import { Archive, ExQuestHistory, LegacyArchive } from './type'
import { EX_MAPS, EMPTY_ARCHIVE, MILLISECONDS_OF_12_HOURS, SENKA_QUESTS, QUARTERLY_QUEST_REFRESH_MONTH } from './const'

// Get record no
export const getDateNo = (ts: Date = new Date()): number => {
  const startOfSenka = moment.tz('Asia/Tokyo').startOf('month').add(2, 'hour')
  const now = moment(ts).tz('Asia/Tokyo')
  const no = Math.trunc(now.diff(startOfSenka) / MILLISECONDS_OF_12_HOURS)
  return no
}

// Get refresh no
export const getRankDateNo = (ts: Date = new Date()): number => {
  const startOfSenkaRefresh = moment.tz('Asia/Tokyo').startOf('month').add(3, 'hour')
  const now = moment(ts).tz('Asia/Tokyo')
  const no = Math.trunc(now.diff(startOfSenkaRefresh) / MILLISECONDS_OF_12_HOURS)
  return no
}

export const getAchieveFilePath = (memberId?: number) => {
  const { APPDATA_PATH } = window
  const folder = path.join(APPDATA_PATH, 'achieve')
  fs.ensureDirSync(folder)
  const file = memberId ? `${memberId}.json` : 'achieve.json'
  return path.join(folder, file)
}

export const getAchieveData = async (memberId: number): Promise<Archive> => {
  try {
    const savedpath = getAchieveFilePath(memberId)
    const data = await fs.readJson(savedpath) as Archive
    const archiveDate = moment(data.date).tz('Asia/Tokyo')
    const now = moment.tz('Asia/Tokyo')
    if (now.year() === archiveDate.year() && now.month() === archiveDate.month()) {
      return data
    } else {
      console.warn('Archive outdated. Return new state')
      return transferArchiveToNewMonth(data)
    }
  } catch (e) {
    console.warn('Read archive failed', e)
    try {
      const savedpath = getAchieveFilePath()
      const data = fs.readJsonSync(savedpath) as LegacyArchive
      const now = moment.tz('Asia/Tokyo')
      const transferred = legacyArchiveToArchive(data)
      if (now.month() === data.lastmonth) {
        return transferred
      } else {
        return transferArchiveToNewMonth(transferred)
      }
    } catch(e) {
      console.warn('Read legacy archive failed', e)
      return EMPTY_ARCHIVE
    }
  }
}

export const transferArchiveToNewMonth = (archive: Archive): Archive => {
  const now = moment.tz('Asia/Tokyo')
  const archiveDate = moment(archive.date).tz('Asia/Tokyo')
  if (archiveDate.year() === now.year() && archiveDate.month() === now.month()) {
    return archive
  }

  const newArchive = {
    ...EMPTY_ARCHIVE,
    magic: archive.magic,
    targetSenka: archive.targetSenka,
    date: moment.tz('Asia/Tokyo').format(),
  }
  // From former quarterly cycle
  if (moment.tz('Asia/Tokyo').startOf('month').subtract(2, 'month').isAfter(archiveDate)) {
    return newArchive
  }
  for (const month of QUARTERLY_QUEST_REFRESH_MONTH) {
    if (archiveDate.month() < month && month <= now.month()) {
      return newArchive
    }
  }
  if (now.month() < 2 && archiveDate.month() < QUARTERLY_QUEST_REFRESH_MONTH[3]) {
    return newArchive
  }

  const excludedQuestsSet = new Set(archive.excludedQuests)
  for (const key of Object.keys(archive.questHistory)) {
    const ts = parseInt(key)
    // Get senka quest that completed after last month's deadline
    if (ts === 1000) {
      newArchive.questHistory[0] = archive.questHistory[ts]
    // Move other quests to excluded quests
    } else {
      archive.questHistory[ts].forEach((id) => {
        excludedQuestsSet.add(id)
      })
    }
  }
  newArchive.excludedQuests = [...excludedQuestsSet]
  return newArchive
}

export const saveArchiveData = async (memberId: number, archive: Archive): Promise<void> => {
  try {
    const savedpath = getAchieveFilePath(memberId)
    await fs.writeJSON(savedpath, archive)
  } catch (e) {
    console.error('save data failed', e)
  }
}

const legacyArchiveToArchive = (legacy: LegacyArchive): Archive => {
  return {
    experienceHistory: legacy.exphis,
    rank5: legacy.r5his,
    rank20: legacy.r20his,
    rank100: legacy.r100his,
    rank501: legacy.r501his,
    rankUser: legacy.myhis,
    targetSenka: legacy.targetsenka,
    exHistory: toExHistory(legacy.rankuex),
    questHistory: toQuestHistory(legacy.extraSenkalist),
    magic: legacy.mymagic,
    currentRank: legacy.mylastno,
    excludedQuests: [],
    date: moment.tz('Asia/Tokyo').month(legacy.lastmonth).format(),
  }
}

const toExHistory = (rankuex: string[]): ExQuestHistory => {
  const unfinishedExIds = rankuex.map(mapName => parseInt(mapName.replace('-', '')))
  const exIds = Object.keys(EX_MAPS).map(id => parseInt(id)).filter((id) => !unfinishedExIds.includes(id))
  return {
    0: exIds,
  }
}

const toQuestHistory = (extraSenkalist: number[]): ExQuestHistory => {
  const questIds = extraSenkalist.map((status, index) => {
    if (status === 0) return -1
    return SENKA_QUESTS[index].id
  }).filter(id => id > 0)
  return {
    0: questIds,
  }
}

export const getElementByIndex = <T>(arr: T[] = [], index: number): T => {
  if (arr.length === 0) {
    return arr[0]
  }
  let actualIndex = index
  while (actualIndex < 0) {
    actualIndex += arr.length
  }
  actualIndex = actualIndex % arr.length
  return arr[actualIndex]
}

export const getElementFromNumberRecords = <T>(record: Record<number, T> = {}, index: number): T => {
  const keys = Object.keys(record)
  const key = getElementByIndex(keys, index)
  return record[parseInt(key)]
}

// [date, isDay]
export const dateNoToDate = (dateNo: number): [number, boolean] => {
  return [
    Math.floor(dateNo / 2) + 1,
    dateNo % 2 === 1,
  ]
}
