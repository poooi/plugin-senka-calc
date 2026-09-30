import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Callout, Colors, HTMLTable, Icon, Position } from '@blueprintjs/core'
import styled from 'styled-components'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { pluginDataSelector } from '../selectors'
import { magicManager } from '../lib/magic'
import { dateNoToDate, getElementByIndex, getElementFromNumberRecords, getStagingSenka } from '../lib/util'
import { SenkaHistory } from 'lib/type'
import { Container, Title } from './common'
import { Tooltip } from 'views/components/etc/overlay'
import * as remote from '@electron/remote'
import EventEmitter from 'events'
import moment from 'moment-timezone'

const gameAPIBroadcaster: EventEmitter = remote.require('./lib/game-api-broadcaster')

const SenkaText = styled.span`
  padding-right: 5px;
`
const IncreasementText = styled.span`
  font-size: 0.9em;
  opacity: 0.75;
  white-space: nowrap;
`

const Td = styled.td`
  position: relative;
  padding-top: 18px !important;
`

const UserRow = styled.tr`
  font-weight: 600;
`

const CornerLabel = styled.div`
  display: flex;
  font-size: 12px;
  font-weight: normal;
  position: absolute;
  padding: 0 16px 0 5px;
  line-height: 16px;
  border-bottom-right-radius: 18px;
  top: 0;
  left: 0;
  z-index: 1;
  white-space: nowrap;
  opacity: 0.9;
  align-items: center;
  color: ${Colors.WHITE};
  background-color: ${Colors.BLUE3};
`


const DateIcon = styled(Icon)`
  flex-shrink: 0;
  margin-left: 4px;
`

const HintCallout = styled(Callout)`
  margin-bottom: 8px;
`

// Same boundary as the reducers use to skip recording
const checkBeforeRankingStart = () => moment.tz('Asia/Tokyo')
  .isBefore(moment.tz('Asia/Tokyo').startOf('month').add(3, 'hours'))

const renderDelta = (delta: number, digits: number) => {
  if (!Number.isFinite(delta)) {
    return null
  }
  return (
    <IncreasementText>
      {delta !== 0 && <Icon icon={delta > 0 ? 'arrow-up' : 'arrow-down'} size={12} />}
      {Math.abs(delta).toFixed(digits)}
    </IncreasementText>
  )
}

const TooltipRightAlign = styled(Tooltip)`
  margin-left: auto;
`

export const Info: React.FC = () => {
  const {
    rank5 = {},
    rank20 = {},
    rank100 = {},
    rank501 = {},
    rankUser = {},
    experienceHistory = {},
    exHistory = {},
    questHistory = {},
    currentRank,
  } = useSelector(pluginDataSelector)
  const { t } = useTranslation('poi-plugin-senka-calc')
  const [isRefreshingMagic, setIsRefreshingMagic] = useState(false)
  // Kept in state and re-checked, so the hint switches at 03:00 even in an idle session
  const [isBeforeRankingStart, setIsBeforeRankingStart] = useState(checkBeforeRankingStart)
  useEffect(() => {
    const timer = setInterval(() => setIsBeforeRankingStart(checkBeforeRankingStart()), 60 * 1000)
    return () => clearInterval(timer)
  }, [])
  const onRefreshButtonClick = useCallback(() => {
    setIsRefreshingMagic(true)
    magicManager.isParsingMagic = true
  }, [])

  const callback = useCallback(() => {
    setIsRefreshingMagic(false)
  }, [])
  useEffect(() => {
    magicManager.addListener('magic-refreshed', callback)
    return () => {
      magicManager.removeListener('magic-refreshed', callback)
    }
  }, [callback])
  useEffect(() => {
    const cb = (_method: string, [, path]: string[]) => {
      // Refresh silently: the spinner is only for a refresh the user asked for,
      // otherwise it keeps spinning until the ranking page is opened
      if (path === '/kcsapi/api_get_member/record') {
        magicManager.isParsingMagic = true
      }
    }
    gameAPIBroadcaster.addListener('network.on.response', cb)
    return () => {
      gameAPIBroadcaster.removeListener('network.on.response', cb)
    }
  }, [])
  const rankList: [number, SenkaHistory][] = [
    [5, rank5],
    [20, rank20],
    [100, rank100],
    [501, rank501],
    [currentRank, rankUser],
  ]

  const getDeltaForOtherUser = useCallback((rankHistory: SenkaHistory) => {
    return getElementFromNumberRecords(rankHistory, -1) - getElementFromNumberRecords(rankHistory, -2)
  }, [])

  const userSenkaDelta = useMemo(
    () => getStagingSenka(rankUser, experienceHistory, exHistory, questHistory),
    [rankUser, experienceHistory, exHistory, questHistory]
  )
  const hasRankingData = Object.keys(rankUser).length > 0

  return (
    <Container>
      <Title>
        <Icon icon="numbered-list" style={{ paddingRight: 8 }} />
        {t('Ranking Info')}
        {/* @ts-ignore */}
        <TooltipRightAlign
          position={Position.BOTTOM_RIGHT}
          content={t('Click the button and load ranking page to correct ranking point values')}
          targetTagName="div"
          wrapperTagName="div"
        >
          <Button
            icon="refresh"
            small
            minimal
            onClick={onRefreshButtonClick}
            loading={isRefreshingMagic}
            style={{
              minWidth: 16,
              minHeight: 16,
            }}
          />
        </TooltipRightAlign>
      </Title>
      {!hasRankingData && (
        <HintCallout icon="info-sign">
          {isBeforeRankingStart ?
            t('The ranking shows last month until 3 AM JST, ranking data of this month can be loaded after that') :
            t('Open the ranking page in game to load ranking data')}
        </HintCallout>
      )}
      <HTMLTable striped condensed style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>{t('Rank')}</th>
            <th>{t('Point')}</th>
          </tr>
        </thead>
        <tbody>
          {
            rankList.map(([rank, rankHistory], index) => {
              const hasRecord = Object.keys(rankHistory).length > 0
              const lastUpdateDateNo = parseInt(getElementByIndex(Object.keys(rankHistory), -1))
              const [lastUpdateDate, isDate] = dateNoToDate(lastUpdateDateNo)
              const senka = getElementFromNumberRecords(rankHistory, -1)
              const isUser = index === rankList.length - 1
              const delta = isUser ?
                // user's senka, show the experience delta instead
                userSenkaDelta :
                getDeltaForOtherUser(rankHistory)
              const lastUpdateText = t('Last Update {{ date }}', { date: hasRecord ? lastUpdateDate : '-' })
              const Row = isUser ? UserRow : 'tr'
              return (
                <Row key={index}>
                  <Td>
                    {isUser && <Icon icon="person" size={12} style={{ marginRight: 4 }} />}
                    {rank > 0 ? rank : '-'}
                    <CornerLabel>
                      {lastUpdateText}
                      {hasRecord && <DateIcon size={10} icon={isDate ? 'full-circle' : 'moon'} />}
                    </CornerLabel>
                  </Td>
                  <Td>
                    <SenkaText>{senka ?? '-'}</SenkaText>
                    {/* user's staging points do not depend on a ranking record */}
                    {(hasRecord || isUser) && renderDelta(delta, isUser ? 1 : 0)}
                  </Td>
                </Row>
              )
            })
          }
        </tbody>
      </HTMLTable>
    </Container>
  )
}
