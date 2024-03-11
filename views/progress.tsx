import React, { CSSProperties } from 'react'
import styled from 'styled-components'
import { Colors, Position } from '@blueprintjs/core'
import { Tooltip } from 'views/components/etc/overlay'
import { useTranslation } from 'react-i18next'

const ProgressContainer = styled.div`
  display: flex;
  height: 8px;
  width: 100%;
  overflow: hidden;
  border-radius: 4px;
  position: relative;
  background-color: transparent;
  border-color: transparent;
  margin-bottom: 15px;
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
  background-color: ${Colors.BLUE2};
`

const DeltaSenka = styled(ProgressBar)`
  background-color: ${Colors.BLUE5};
`

const PlannedExSenka = styled(ProgressBar)`
  background-color: ${Colors.GREEN1};
`

const PlannedQuestSenka = styled(ProgressBar)`
  background-color: ${Colors.GREEN4};
`

const UnfinishedSenka = styled(ProgressBar)`
  background-color: ${Colors.DARK_GRAY5};
  .bp4-dark &,
  .bp5-dark & {
    background-color: ${Colors.LIGHT_GRAY5};
  }
`

const TargetBorder = styled.div`
  height: 100%;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 10;
  border-left: 1px solid ${Colors.DARK_GRAY1};
`

const InnerTooltip = styled(Tooltip)`
  width: 100%;
  height: 100%;
  & div {
    width: 100%;
    height: 100%;
  }
`

const getProgressStyle = (...values: number[]): CSSProperties[] => {
  const total = values.reduce((a, b) => a + b, 0)
  let curr = 0, zIndex = values.length + 1
  const ret: CSSProperties[] = []
  for (const value of values) {
    curr += value
    ret.push({
      width: (curr / total * 100).toFixed(1) + '%',
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
  const borderWidth = totalLength === targetSenka ?
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
    unfinishedSenka,
  )
  return (
    <ProgressContainer>
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
  )
}
