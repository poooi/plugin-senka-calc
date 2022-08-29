import React, { useCallback, useContext, useMemo } from 'react'
import { FormGroup, Icon, MenuItem, NumericInput, Tag } from '@blueprintjs/core'
import { ItemRenderer, MultiSelect2 } from '@blueprintjs/select'
import { useTranslation } from 'react-i18next'
import { Container, Title } from './common'
import { Progress } from './progress'
import { useDispatch, useSelector } from 'react-redux'
import { pluginDataSelector } from '../selectors'
import { getElementByIndex, getElementFromNumberRecords } from '../lib/util'
import { EXPERIENCE_TO_SENKA_RATE, EX_MAPS, SENKA_QUESTS } from '../lib/const'
import { WindowEnv } from 'views/components/etc/window-env'
import styled from 'styled-components'

const TagWithMargin = styled(Tag)`
  margin-right: 5px;
  margin-bottom: 5px;
`

export const Calculator: React.FC = () => {
  const { mountPoint } = useContext(WindowEnv)
  const { t } = useTranslation('poi-plugin-senka-calc')
  const {
    rankUser = {},
    experienceHistory = {},
    exHistory = {},
    questHistory = {},
    excludedQuests = [],
    targetSenka,
  } = useSelector(pluginDataSelector)
  const dispatch = useDispatch()
  const currentSenka = getElementFromNumberRecords(rankUser, -1)
  const deltaSenka = useMemo(() => {
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
    return Math.trunc(experienceSenka + uncountedExSenka + uncountedQuestSenka)
  }, [rankUser, experienceHistory, exHistory, questHistory])
  const completedExOps = useMemo(
    () => Object.values(exHistory).reduce((a, b) => [...a, ...b], []),
    [exHistory]
  )
  const incompletedExOps = useMemo(
    () => Object.keys(EX_MAPS)
      .map(id => parseInt(id))
      .filter(id => completedExOps.indexOf(id) === -1),
    [completedExOps]
  )
  const plannedExSenka = useMemo(() =>
    incompletedExOps
      .map(id => EX_MAPS[id] || 0)
      .reduce((a, b) => a + b, 0)
  , [incompletedExOps])
  const completedQuests = useMemo(
    () => Object.values(questHistory).reduce((a, b) => [...a, ...b], []),
    [questHistory]
  )
  const incompletedAndExcludedQuestsObjects = useMemo(
    () => SENKA_QUESTS
      .filter(({ id }) => completedQuests.indexOf(id) === -1),
    [completedQuests]
  )
  const incompletedQuestsObjects = useMemo(
    () => incompletedAndExcludedQuestsObjects
      .filter(({ id }) => excludedQuests.indexOf(id) === -1),
    [incompletedAndExcludedQuestsObjects, excludedQuests]
  )
  const plannedQuestSenka = useMemo(() => {
    return incompletedQuestsObjects
      .map(({ senka }) => senka || 0)
      .reduce((a, b) => a + b, 0)
  }, [incompletedQuestsObjects])
  const expectedSenka = currentSenka + deltaSenka + plannedExSenka + plannedQuestSenka
  const unfinishedSenka = targetSenka - expectedSenka
  const onTargetSenkaChange = (value: number) => {
    dispatch({
      type: '@@poi-plugin-senka-calc/update-target-senka',
      value,
    })
  }

  const renderTags = useCallback((questId: number) => {
    const quest = SENKA_QUESTS.find(({ id }) => id === questId)
    if (!quest) {
      return null
    }
    return `${quest.code} -  ${quest.shortname}`
  } ,[])
  const renderQuestItems: ItemRenderer<number> = useCallback((questId) => {
    const quest = SENKA_QUESTS.find(({ id }) => id === questId)
    if (!quest) {
      return null
    }
    return (
      <MenuItem
        active={excludedQuests.indexOf(questId) !== -1}
        text={`${quest.code} -  ${quest.name}`}
        label={quest.senka.toString()}
        onClick={() => onQuestSelect(questId)}
      />
    )
  }, [excludedQuests])
  const onQuestSelect = useCallback((questId: number) => {
    dispatch({
      type: '@@poi-plugin-senka-calc/update-excluded-quests',
      value: questId,
    })
  }, [])

  return <Container>
    <Title>
      <Icon icon="calculator" style={{ paddingRight: 8 }} />
      {t('Calculator')}
    </Title>
    <FormGroup
      label={t('Target ranking points')}
    >
      <NumericInput
        asyncControl
        fill
        value={targetSenka}
        onValueChange={onTargetSenkaChange}
        max={20000}
        majorStepSize={100}
        minorStepSize={100}
        stepSize={100}
        min={0}
      />
    </FormGroup>
    <FormGroup
      label={t('Excluded quests')}
      helperText={
        unfinishedSenka > 0 ?
          t('Remaining {{ points }} points', { points: unfinishedSenka }) :
          t('{{ points }} points over the target', { points: -unfinishedSenka })
      }
    >
      <MultiSelect2
        itemRenderer={renderQuestItems}
        items={SENKA_QUESTS.map(({ id }) => id)}
        onRemove={onQuestSelect}
        onItemSelect={onQuestSelect}
        selectedItems={excludedQuests}
        tagRenderer={renderTags}
        placeholder={t('Click to select quests')}
        popoverProps={{
          portalContainer: mountPoint,
          hasBackdrop: true,
        }}
      />
    </FormGroup>
    <Progress
      currentSenka={currentSenka}
      deltaSenka={deltaSenka}
      plannedExSenka={plannedExSenka}
      plannedQuestSenka={plannedQuestSenka}
      expectedSenka={expectedSenka}
      unfinishedSenka={unfinishedSenka}
      targetSenka={targetSenka}
    />
    <FormGroup
      label={t('Completed extra operations')}
    >
      {completedExOps.map((id) => {
        return (
          <TagWithMargin key={id}>
            {Math.trunc(id / 10)}-{id % 10}
          </TagWithMargin>
        )
      })}
    </FormGroup>
    <FormGroup
      label={t('Remaining extra operations')}
    >
      {incompletedExOps.map((id) => {
        return (
          <TagWithMargin key={id}>
            {Math.trunc(id / 10)}-{id % 10}
          </TagWithMargin>
        )
      })}
    </FormGroup>
    <FormGroup
      label={t('Completed quests')}
    >
      {completedQuests.map((questId) => {
        const quest = SENKA_QUESTS.find(({ id }) => questId === id)
        if (!quest) {
          return null
        }
        return (
          <TagWithMargin key={quest.code}>
            {quest.code} - {quest.shortname}
          </TagWithMargin>
        )
      })}
    </FormGroup>
    <FormGroup
      label={t('Remaining quests')}
    >
      {incompletedQuestsObjects.map((quest) => {
        return (
          <TagWithMargin key={quest.code}>
            {quest.code} - {quest.shortname}
          </TagWithMargin>
        )
      })}
    </FormGroup>
  </Container>
}
