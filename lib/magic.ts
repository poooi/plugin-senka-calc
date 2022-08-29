
import EventEmitter from "events"
import { isInteger, isNaN } from "lodash"

import { UserData } from "./type"

export const MAGIC_R_NUMS = [8931, 1201, 1156, 5061, 4569, 4732, 3779, 4568, 5695, 4619, 4912, 5669, 6586]
//export const MAGIC_L_NUMS = [ 25, 92, 79, 52, 58, 36, 93, 92, 58, 82 ]  // 2017.2.28-2017.3.17
//export const MAGIC_L_NUMS = [ 63, 30, 70, 83, 95, 52, 45, 88, 92, 83 ]     // 2017.3.17-2017.4.6
//export const MAGIC_L_NUMS = [26,79,33,71,95,75,40,54,37,78]     // 2017.4.6-2017.5.2
export const MAGIC_L_NUMS = [36, 31, 33, 97, 64, 54, 52, 78, 40, 85]     // 2017.5.2-2017.5.22


const unsafeBinaryGcd = (m: number, n: number): number =>
  n === 0 ? m : unsafeBinaryGcd(n, m % n)
/*
   gcd(a1,a2,a3,...) returns:

   - NaN if the argument list is empty
   - NaN if any of the arguments is not an integer
   - otherwise the greatest common divisor of a1,a2,a3...
 */
const gcd = (...args: number[]): number =>
  args.length === 0 ?
    NaN :
    args.every(isInteger) ?
      args.reduce(unsafeBinaryGcd) :
      NaN

class MagicManager extends EventEmitter {
  magic: number

  nickname: string

  memberId: number

  isParsingMagic: boolean

  constructor() {
    super()
    this.magic = 0
    this.nickname = ''
    this.memberId = -1
    this.isParsingMagic = false
  }

  initialize(magic: number, nickname: string, memberId: number) {
    this.magic = magic
    this.nickname = nickname
    this.memberId = memberId
  }

  isInitialized() {
    return this.magic > 0 && this.memberId > 0 && this.nickname.length > 0
  }

  updateMagicNum = (list: UserData[]) => {
    if (this.isParsingMagic) {
      const newMagic = this.findSenkaMagicNum(list)
      if (newMagic) {
        this.magic = newMagic
        this.isParsingMagic = false
        setImmediate(() => {
          this.emit('magic-refreshed')
        })
      }
    }
  }

  findSenkaMagicNum = (apiData: UserData[]): number | null => {
    let failed = false
    const obfsRates = apiData.map(raw => {
      const rank = raw.api_mxltvkpyuklh
      const key = raw.api_wuhnhojjxmke
      const magicR = MAGIC_R_NUMS[rank % 13]
      if (key % magicR !== 0){
        console.warn(`${key} is indivisible by ${magicR}`)
        failed = true
      }
      return key / magicR
    })
    if (failed) {
      return null
    }

    const magicX = gcd(...obfsRates)

    if (isNaN(magicX)) {
      return null
    }

    if (magicX < 99)
      return magicX

    for (let magic = 99; magic > 0; --magic) {
      if (magicX % magic === 0)
        return magic
    }
    // unreachable, because magicX % 1 === 0 will always be true.
    return null
  }

  decryptSenka(rankNo: number, encryptedSenka: number) {
    const magic = this.magic > 9 ? this.magic : MAGIC_L_NUMS[this.memberId % 10]
    const senka = encryptedSenka / MAGIC_R_NUMS[rankNo % 13] / magic - 73 - 18
    return senka > 0 ? senka : 0
  }
}

export const magicManager = new MagicManager()
