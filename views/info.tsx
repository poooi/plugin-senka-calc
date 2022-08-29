import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, HTMLTable, Icon, Position } from '@blueprintjs/core'
import styled from 'styled-components'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { pluginDataSelector } from '../selectors'
import { magicManager } from '../lib/magic'
import { dateNoToDate, getElementByIndex, getElementFromNumberRecords } from '../lib/util'
import { EXPERIENCE_TO_SENKA_RATE, EX_MAPS, SENKA_QUESTS } from '../lib/const'
import { SenkaHistory } from 'lib/type'
import { Container, Title } from './common'
import { Tooltip } from 'views/components/etc/overlay'

const SenkaText = styled.span`
  padding-right: 5px;
`
const IncreasementText = styled.span`
  font-size: 0.9;
  opacity: 0.75;
`

const Td = styled.td`
  position: relative;
  padding-top: 18px !important;
`

const CornerLabel = styled.div`
  display: flex;
  font-size: 12px;
  position: absolute;
  padding: 0 16px 0 5px;
  line-height: 16px;
  border-bottom-right-radius: 18px;
  top: 0;
  left: 0;
  white-space: nowrap;
  opacity: 0.9;
  align-items: center;
`

const DateIcon = styled(Icon)`
  margin-left: 4px;
`

const TooltipRightAlign = styled(Tooltip)`
  margin-left: auto;
`

export const Info: React.FC = (prop) => {
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
  }, [prop])
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

  const userSenkaDelta = useMemo(() => {
    const lastUpdateDateNo = parseInt(getElementByIndex(Object.keys(rankUser), -1))
    const experienceDelta = getElementFromNumberRecords(experienceHistory, -1) - experienceHistory[lastUpdateDateNo]
    const experienceSenka = experienceDelta * EXPERIENCE_TO_SENKA_RATE
    const uncountedExSenka = Object.keys(exHistory)
      .map(dateNo => parseInt(dateNo))
      .filter(dateNo => dateNo >= lastUpdateDateNo)
      .map(dateNo => exHistory[dateNo])
      .reduce((a, b) => [...a, ...b], [])
      .map(id => EX_MAPS[id] || 0)
      .reduce((a, b) => a + b, 0)
    const uncountedQuestSenka = Object.keys(questHistory)
      .map(dateNo => parseInt(dateNo))
      // Senka of dateNo 1000 will be moved to next month
      .filter(dateNo => dateNo >= lastUpdateDateNo && dateNo < 1000)
      .map(dateNo => questHistory[dateNo])
      .reduce((a, b) => [...a, ...b], [])
      .map(questId => SENKA_QUESTS.find(({id}) => id === questId)?.senka || 0)
      .reduce((a, b) => a + b, 0)
    return (experienceSenka + uncountedExSenka + uncountedQuestSenka).toFixed(1)
  }, [rankUser, experienceHistory, exHistory, questHistory])

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
              const lastUpdateDateNo = parseInt(getElementByIndex(Object.keys(rankHistory), -1))
              const [lastUpdateDate, isDate] = dateNoToDate(lastUpdateDateNo)
              const senka = getElementFromNumberRecords(rankHistory, -1)
              const delta = index !== rankList.length - 1 ?
                getDeltaForOtherUser(rankHistory) :
                // last one is user's senka, show the experience delta instead
                userSenkaDelta
              return (
                <tr key={index}>
                  <Td>
                    {rank}
                    <CornerLabel className="bg-primary">
                      {t('Last Update {{ date }}', { date: lastUpdateDate })}
                      <DateIcon size={10} icon={isDate ? 'full-circle' : 'moon'} />
                    </CornerLabel>
                  </Td>
                  <Td>
                    <SenkaText>{senka}</SenkaText>
                    <IncreasementText>
                      <Icon icon="arrow-up" size={12}></Icon>
                      {delta}
                    </IncreasementText>
                  </Td>
                </tr>
              )
            })
          }
        </tbody>
      </HTMLTable>
    </Container>
  )
}
