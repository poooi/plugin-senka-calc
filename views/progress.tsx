import React, { CSSProperties } from 'react'
import styled, { css } from 'styled-components'
import { Colors, Position } from '@blueprintjs/core'
import { Tooltip } from 'views/components/etc/overlay'
import { useTranslation } from 'react-i18next'

const SENKA_COLORS = {
  current: Colors.BLUE2,
  delta: Colors.BLUE5,
  plannedEx: Colors.GREEN1,
  plannedQuest: Colors.GREEN4,
}

const unfinishedColor = css`
  background-color: ${Colors.DARK_GRAY5};
  .bp4-dark &,
  .bp5-dark &,
  .bp6-dark & {
    background-color: ${Colors.LIGHT_GRAY5};
  }
`

const ProgressContainer = styled.div`
  display: flex;
  height: 8px;
  width: 100%;
  overflow: hidden;
  border-radius: 4px;
  position: relative;
  background-color: transparent;
  border-color: transparent;
  margin-bottom: 6px;
`

const Legend = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 2px 12px;
  margin: 0 0 15px;
  padding: 0;
  list-style: none;
  font-size: 12px;
`

const LegendItem = styled.li`
  display: flex;
  align-items: center;
  white-space: nowrap;
`

const Swatch = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 4px;
  border-radius: 2px;
`

const UnfinishedSwatch = styled(Swatch)`
  ${unfinishedColor}
`

const TargetSwatch = styled(Swatch)`
  width: 0;
  border-left: 2px solid ${Colors.DARK_GRAY1};
  border-radius: 0;
  .bp4-dark &,
  .bp5-dark &,
  .bp6-dark & {
    border-left-color: ${Colors.LIGHT_GRAY5};
  }
`

const ProgressBar = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  overflow: hidden;
  border-radius: 4px;
  border-color: transparent;
`

const CurrentSenka = styled(ProgressBar)`
  background-color: ${SENKA_COLORS.current};
`

const DeltaSenka = styled(ProgressBar)`
  background-color: ${SENKA_COLORS.delta};
`

const PlannedExSenka = styled(ProgressBar)`
  background-color: ${SENKA_COLORS.plannedEx};
`

const PlannedQuestSenka = styled(ProgressBar)`
  background-color: ${SENKA_COLORS.plannedQuest};
`

const UnfinishedSenka = styled(ProgressBar)`
  ${unfinishedColor}
`

const TargetBorder = styled.div`
  height: 100%;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 10;
  border-left: 1px solid ${Colors.DARK_GRAY1};
  .bp4-dark &,
  .bp5-dark &,
  .bp6-dark & {
    border-left-color: ${Colors.LIGHT_GRAY5};
  }
`

const InnerTooltip = styled(Tooltip)`
  width: 100%;
  height: 100%;
  & div {
    width: 100%;
    height: 100%;
  }
`

const getProgressStyle = (...rawValues: number[]): CSSProperties[] => {
  // Negative segments would push the others past 100%
  const values = rawValues.map(value => Math.max(0, value || 0))
  const total = values.reduce((a, b) => a + b, 0)
  let curr = 0, zIndex = values.length + 1
  const ret: CSSProperties[] = []
  for (const value of values) {
    curr += value
    ret.push({
      width: total > 0 ? (curr / total * 100).toFixed(1) + '%' : '0%',
      zIndex: zIndex--,
    })
  }
  return ret
}

interface Props {
  currentSenka: number,
  deltaSenka: number,
  plannedExSenka: number,
  plannedQuestSenka: number,
  expectedSenka: number,
  unfinishedSenka: number,
  targetSenka: number,
}

export const Progress: React.FC<Props> = ({
  currentSenka,
  deltaSenka,
  plannedExSenka,
  plannedQuestSenka,
  expectedSenka,
  unfinishedSenka,
  targetSenka,
}) => {
  const { t } = useTranslation('poi-plugin-senka-calc')
  const totalLength = Math.max(targetSenka, expectedSenka)
  const borderWidth = totalLength === targetSenka || totalLength <= 0 ?
    '0' :
    ((totalLength - targetSenka) / totalLength * 100).toFixed(1) + '%'
  const [
    currentSenkaStyle,
    deltaSenkaStyle,
    exSenkaStyle,
    questSenkaStyle,
    unfinishedSenkaStyle,
  ] = getProgressStyle(
    currentSenka,
    deltaSenka,
    plannedExSenka,
    plannedQuestSenka,
    // Over the target: the bar is scaled to the expected points instead
    Math.max(0, unfinishedSenka),
  )
  return (
    <>
      <ProgressContainer aria-hidden>
        <CurrentSenka style={currentSenkaStyle}>
          {/* @ts-ignore */}
          <InnerTooltip
            position={Position.BOTTOM_RIGHT}
            content={t('Current ranking points {{ point }}', { point: currentSenka })}
            targetTagName="div"
            wrapperTagName="div"
          >
            <div />
          </InnerTooltip>
        </CurrentSenka>
        <DeltaSenka style={deltaSenkaStyle}>
          {/* @ts-ignore */}
          <InnerTooltip
            position={Position.BOTTOM_RIGHT}
            content={t('Staging ranking points {{ point }}', { point: deltaSenka })}
            targetTagName="div"
            wrapperTagName="div"
          >
            <div />
          </InnerTooltip>
        </DeltaSenka>
        <PlannedExSenka style={exSenkaStyle}>
          {/* @ts-ignore */}
          <InnerTooltip
            position={Position.BOTTOM_RIGHT}
            content={t('Ranking points of planned extra operations {{ point }}', { point: plannedExSenka })}
            targetTagName="div"
            wrapperTagName="div"
          >
            <div />
          </InnerTooltip>
        </PlannedExSenka>
        <PlannedQuestSenka style={questSenkaStyle}>
          {/* @ts-ignore */}
          <InnerTooltip
            position={Position.BOTTOM_RIGHT}
            content={t('Ranking points of planned quests {{ point }}', { point: plannedQuestSenka })}
            targetTagName="div"
            wrapperTagName="div"
          >
            <div />
          </InnerTooltip>
        </PlannedQuestSenka>
        <UnfinishedSenka style={unfinishedSenkaStyle}>
          {/* @ts-ignore */}
          <InnerTooltip
            position={Position.BOTTOM_RIGHT}
            content={t('Remaining ranking points to reach target {{ point }}', { point: unfinishedSenka })}
            targetTagName="div"
            wrapperTagName="div"
          >
            <div />
          </InnerTooltip>
        </UnfinishedSenka>
        <TargetBorder style={{
          display: borderWidth === '0' ? 'none' : 'block',
          width: borderWidth,
        }}>
          {/* @ts-ignore */}
          <InnerTooltip
            position={Position.BOTTOM_RIGHT}
            content={t('Target of ranking points {{ point }}', { point: targetSenka })}
            targetTagName="div"
            wrapperTagName="div"
          >
            <div />
          </InnerTooltip>
        </TargetBorder>
      </ProgressContainer>
      <Legend>
        <LegendItem>
          <Swatch style={{ backgroundColor: SENKA_COLORS.current }} />
          {t('Current ranking points {{ point }}', { point: currentSenka })}
        </LegendItem>
        <LegendItem>
          <Swatch style={{ backgroundColor: SENKA_COLORS.delta }} />
          {t('Staging ranking points {{ point }}', { point: deltaSenka })}
        </LegendItem>
        <LegendItem>
          <Swatch style={{ backgroundColor: SENKA_COLORS.plannedEx }} />
          {t('Ranking points of planned extra operations {{ point }}', { point: plannedExSenka })}
        </LegendItem>
        <LegendItem>
          <Swatch style={{ backgroundColor: SENKA_COLORS.plannedQuest }} />
          {t('Ranking points of planned quests {{ point }}', { point: plannedQuestSenka })}
        </LegendItem>
        {unfinishedSenka > 0 && (
          <LegendItem>
            <UnfinishedSwatch />
            {t('Remaining ranking points to reach target {{ point }}', { point: unfinishedSenka })}
          </LegendItem>
        )}
        <LegendItem>
          <TargetSwatch />
          {t('Target of ranking points {{ point }}', { point: targetSenka })}
        </LegendItem>
      </Legend>
    </>
  )
}
