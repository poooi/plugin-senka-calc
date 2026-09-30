import React, { useCallback, useContext, useMemo } from 'react'
import { Classes, FormGroup, Icon, MenuItem, NumericInput, Tag } from '@blueprintjs/core'
// MultiSelect2 is the name shared by every Blueprint version poi may ship (4 to 6)
import { ItemPredicate, ItemRenderer, MultiSelect2 } from '@blueprintjs/select'
import { useTranslation } from 'react-i18next'
import { Container, Title } from './common'
import { Progress } from './progress'
import { useDispatch, useSelector } from 'react-redux'
import { pluginDataSelector } from '../selectors'
import { getElementFromNumberRecords, getStagingSenka } from '../lib/util'
import { EX_MAPS, SENKA_QUESTS } from '../lib/const'
import { SenkaQuestT } from '../lib/type'
import { WindowEnv } from 'views/components/etc/window-env'
import styled from 'styled-components'
import { uniq } from 'lodash'

const TagWithMargin = styled(Tag)`
  margin-right: 5px;
  margin-bottom: 5px;
`

const renderTagList = (tags: React.ReactNode[], emptyText: string) =>
  tags.length > 0 ? tags : <span className={Classes.TEXT_MUTED}>{emptyText}</span>

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
  // No ranking record until the ranking page is loaded
  const currentSenka = getElementFromNumberRecords(rankUser, -1) ?? 0
  const deltaSenka = useMemo(
    () => Math.trunc(getStagingSenka(rankUser, experienceHistory, exHistory, questHistory)),
    [rankUser, experienceHistory, exHistory, questHistory]
  )
  const completedExOps = useMemo(
    () => uniq(Object.values(exHistory).reduce((a, b) => [...a, ...b], [])),
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
    () => uniq(Object.values(questHistory).reduce((a, b) => [...a, ...b], [])),
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

  const onQuestSelect = useCallback((questId: number) => {
    dispatch({
      type: '@@poi-plugin-senka-calc/update-excluded-quests',
      value: questId,
    })
  }, [dispatch])
  // Completed quests are already counted, excluding them has no effect
  const selectableQuests = useMemo(
    () => SENKA_QUESTS
      .filter(({ id }) => completedQuests.indexOf(id) === -1 || excludedQuests.indexOf(id) !== -1)
      .map(({ id }) => id),
    [completedQuests, excludedQuests]
  )
  const renderTags = useCallback((questId: number) => {
    const quest = SENKA_QUESTS.find(({ id }) => id === questId)
    if (!quest) {
      return null
    }
    return `${quest.code} - ${quest.shortname}`
  }, [])
  const filterQuest: ItemPredicate<number> = useCallback((query, questId) => {
    const quest = SENKA_QUESTS.find(({ id }) => id === questId)
    if (!quest) {
      return false
    }
    const normalizedQuery = query.trim().toLowerCase()
    return [quest.code, quest.name, quest.shortname]
      .some(text => text.toLowerCase().includes(normalizedQuery))
  }, [])
  const renderQuestItems: ItemRenderer<number> = useCallback((questId, { handleClick, handleFocus, modifiers, ref }) => {
    const quest = SENKA_QUESTS.find(({ id }) => id === questId)
    if (!quest || !modifiers.matchesPredicate) {
      return null
    }
    const selected = excludedQuests.indexOf(questId) !== -1
    return (
      <MenuItem
        key={questId}
        ref={ref}
        active={modifiers.active}
        disabled={modifiers.disabled}
        icon={selected ? 'tick' : 'blank'}
        text={`${quest.code} - ${quest.name}`}
        label={quest.senka.toString()}
        onClick={handleClick}
        onFocus={handleFocus}
        shouldDismissPopover={false}
      />
    )
  }, [excludedQuests])

  return <Container>
    <Title>
      <Icon icon="calculator" style={{ paddingRight: 8 }} />
      {t('Calculator')}
    </Title>
    <FormGroup
      label={t('Target ranking points')}
      helperText={
        unfinishedSenka > 0 ?
          t('Remaining {{ points }} points', { points: unfinishedSenka }) :
          unfinishedSenka < 0 ?
            t('{{ points }} points over the target', { points: -unfinishedSenka }) :
            t('Target reached')
      }
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
    >
      <MultiSelect2
        itemRenderer={renderQuestItems}
        items={selectableQuests}
        itemPredicate={filterQuest}
        noResults={<MenuItem disabled text={t('No matching quests')} />}
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
      {renderTagList(completedExOps.map(id => (
        <TagWithMargin key={id}>
          {Math.trunc(id / 10)}-{id % 10}
        </TagWithMargin>
      )), t('None'))}
    </FormGroup>
    <FormGroup
      label={t('Remaining extra operations')}
    >
      {renderTagList(incompletedExOps.map(id => (
        <TagWithMargin key={id}>
          {Math.trunc(id / 10)}-{id % 10}
        </TagWithMargin>
      )), t('None'))}
    </FormGroup>
    <FormGroup
      label={t('Completed quests')}
    >
      {renderTagList(completedQuests
        .map(questId => SENKA_QUESTS.find(({ id }) => questId === id))
        .filter((quest): quest is SenkaQuestT => quest != null)
        .map(quest => (
          <TagWithMargin key={quest.id}>
            {quest.code} - {quest.shortname}
          </TagWithMargin>
        )), t('None'))}
    </FormGroup>
    <FormGroup
      label={t('Remaining quests')}
    >
      {renderTagList(incompletedQuestsObjects.map(quest => (
        <TagWithMargin key={quest.id}>
          {quest.code} - {quest.shortname}
        </TagWithMargin>
      )), t('None'))}
    </FormGroup>
  </Container>
}
