import React from 'react'
import styled from 'styled-components'
import { basicSelector } from 'views/utils/selectors'
import { magicManager } from './lib/magic'
import { getAchieveData, saveArchiveData } from './lib/util'
import { Archive, InitializeAction } from './lib/type'
import { Info } from './views/info'
import { store } from 'views/create-store'
import { Dispatcher, observe, observer } from 'redux-observers'
import { APIBasic } from 'kcsapi/api_port/port/response'
import { PluginState } from './reducers'
import { pick } from 'lodash'
import moment from 'moment-timezone'
import { pluginDataSelector } from './selectors'
import { Calculator } from './views/calculator'
import { Calender } from './views/calendar'

export { reducer } from './reducers'

const Row = styled.div`
  display: flex;
`

const Col = styled.div`
  flex: 1;
`

const basicObserverCallback: Dispatcher<APIBasic> = async (dispatch, current, previous) => {
  if (current.api_member_id !== previous?.api_member_id) {
    const memberId = parseInt(current.api_member_id)
    const archive = await getAchieveData(memberId)
    magicManager.initialize(archive.magic, current.api_nickname, memberId)
    dispatch({
      type: '@@poi-plugin-senka-calc/initialize',
      archive,
    } as InitializeAction)
  }
}

const pluginDataObserverCallback: Dispatcher<PluginState> = async (dispatch, current) => {
  if (magicManager.isInitialized() && Object.keys(current.experienceHistory || {}).length > 0) {
    const archiveData: Archive = {
      ...pick(
        current,
        'experienceHistory',
        'rank5',
        'rank20',
        'rank100',
        'rank501',
        'rankUser',
        'exHistory',
        'questHistory',
        'currentRank',
        'targetSenka',
        'excludedQuests',
      ),
      magic: magicManager.magic,
      date: moment.tz('Asia/Tokyo').format(),
    }
    const memberId = magicManager.memberId
    await saveArchiveData(memberId, archiveData)
  }
}

const basicObserver = observer(
  basicSelector,
  basicObserverCallback
)

const pluginDataObserver = observer(
  pluginDataSelector,
  pluginDataObserverCallback
)

let unsuscribeObserver: () => void = () => undefined
let timer: ReturnType<typeof setInterval> | null

let endOfMonth = moment.tz('Asia/Tokyo').endOf('month')

export const pluginDidLoad = () => {
  unsuscribeObserver = observe(store, [basicObserver, pluginDataObserver], { skipInitialCall: false })
  timer = setInterval(async () => {
    if (moment.tz('Asia/Tokyo').isAfter(endOfMonth)) {
      endOfMonth = moment.tz('Asia/Tokyo').endOf('month')
      const archive = await getAchieveData(magicManager.memberId)
      store.dispatch({
        type: '@@poi-plugin-senka-calc/initialize',
        archive,
      } as InitializeAction)
    }
  }, 1000)
}

export const pluginWillUnload = () => {
  unsuscribeObserver()
  unsuscribeObserver = () => undefined
  if (timer) {
    clearInterval(timer)
  }
  timer = null
}

const requiredCSS = [
  '@blueprintjs/select/lib/css/blueprint-select.css',
  '@blueprintjs/popover2/lib/css/blueprint-popover2.css',
  '@blueprintjs/datetime/lib/css/blueprint-datetime.css',
]

export const reactClass: React.FC = () => {
  return (
    <Row>
      {requiredCSS.map(css => <link key={css} href={require.resolve(css)} rel="stylesheet" />)}
      <Col>
        <Info />
        <Calender />
      </Col>
      <Col>
        <Calculator />
      </Col>
    </Row>
  )
}

export const switchPluginPath = [
  '/kcsapi/api_req_ranking/mxltvkpyuklh',
]
