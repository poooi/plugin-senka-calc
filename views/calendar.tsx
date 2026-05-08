import React, { useCallback } from 'react'
import { Classes, Colors, Icon } from '@blueprintjs/core'
import { Classes as DayPickerClasses } from '@blueprintjs/datetime'
import { Container, Title } from './common'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { pluginDataSelector } from '../selectors'
import styled, { css } from 'styled-components'
import moment from 'moment-timezone'
import { getDateNo } from '../lib/util'
import { EXPERIENCE_TO_SENKA_RATE } from '../lib/const'
import { configSelector } from 'views/utils/selectors'
import { get } from 'lodash'
import { type DayPickerProps } from 'react-day-picker'
import classNames from 'classnames'

// Detect v7 vs v8: v7 exposes LocaleUtils as a named export; v8 does not.
const rdpModule = require('react-day-picker') as Record<string, unknown>
const isV7 = 'LocaleUtils' in rdpModule
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DayPickerComponent = (isV7 ? (rdpModule.default ?? rdpModule) : rdpModule.DayPicker) as any

// v7 only: moment-based locale utils (module doesn't exist in v8)
const MomentLocalUtils = (() => {
  if (!isV7) return null
  try {
    const m = require('react-day-picker/moment') as { default?: unknown }
    return m.default ?? m
  } catch {
    return null
  }
})()

const FullWidth = styled.div`
  width: 100%;

  .rdp {
    --rdp-cell-size: 40px !important;
  }
`
const BPDatePicker = styled(FullWidth)`
  background: #FFFFFF20 !important;
  .bp4-dark &,
  .bp5-dark &,
  .bp6-dark & {
    background: ${Colors.DARK_GRAY3 + '20'} !important;
  }
`
const DayPickerFull = styled(DayPickerComponent)`
  width: 100%;
  ${isV7 ? '& .DayPicker-Month' : '& .rdp-month'} {
    width: calc(100% - 10px);
  }
`

const DayContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const DateContainer = styled.div`
  font-weight: 700;
`

const SenkaContainer = styled.div`
  font-size: 90%;
  line-height: 1;
`

const getLocale = (locale: string) => {
  try {
    require.resolve(`date-fns/locale/${locale}`)
    return require(`date-fns/locale/${locale}`)
  } catch {
    try {
      const baseLocale = locale.split('-')[0]
      require.resolve(`date-fns/locale/${baseLocale}`)
      return require(`date-fns/locale/${baseLocale}`)
    } catch {
      return require('date-fns/locale/en-US')
    }
  }
}

export const Calender: React.FC = () => {
  const { t } = useTranslation('poi-plugin-senka-calc')
  const {
    experienceHistory = {},
  } = useSelector(pluginDataSelector)
  const config = useSelector(configSelector)
  const locale = get(config, 'poi.misc.language', navigator.language)

  const getSenkaByDate = useCallback((date: number) => {
    if (Object.keys(experienceHistory).length === 0) {
      return 0
    }
    const firstRecord = parseInt(Object.keys(experienceHistory)[0])
    const todayRefreshTs = moment.tz('Asia/Tokyo').startOf('day').add(2, 'hour')
    const now = moment.tz('Asia/Tokyo')
    const yesterday = moment.tz('Asia/Tokyo').subtract(1, 'day')
    const isToday = (now.isSameOrAfter(todayRefreshTs) && date === now.date()) || (now.isBefore(todayRefreshTs) && date === yesterday.date())
    if (date > now.date() || (date === now.date() && now.isBefore(todayRefreshTs))) {
      return '-'
    }
    let startDateNo = Math.max(firstRecord, getDateNo(moment.tz('Asia/Tokyo').date(date).hour(3).toDate()))
    let endDateNo = isToday ?
      1000 :
      Math.max(firstRecord, getDateNo(moment.tz('Asia/Tokyo').date(date + 1).hour(3).toDate()))
    while (experienceHistory[startDateNo] == null && startDateNo > firstRecord) {
      startDateNo--
    }
    while (experienceHistory[endDateNo] == null && endDateNo > firstRecord) {
      endDateNo--
    }
    const startExperience = experienceHistory[startDateNo] || 0
    const endExperience = experienceHistory[endDateNo] || 0
    return (Math.max(0, endExperience - startExperience) * EXPERIENCE_TO_SENKA_RATE).toFixed(1)
  }, [experienceHistory])

  // Shared inner content — same markup for both versions
  const renderContent = useCallback((day: Date) => {
    const d = day.getDate()
    return (
      <DayContainer className="bp5-datepicker-day-wrapper">
        <DateContainer>{d}</DateContainer>
        <SenkaContainer>{getSenkaByDate(d)}</SenkaContainer>
      </DayContainer>
    )
  }, [getSenkaByDate])

  // v7: renderDay(day: Date)
  const renderDayV7 = useCallback((day: Date) => renderContent(day), [renderContent])
  // v8: DayContent({ date: Date })
  const renderDayV8 = useCallback(({ date }: { date: Date }) => renderContent(date), [renderContent])

  const current = moment.tz('Asia/Tokyo')
  const startOfSenka = moment.tz('Asia/Tokyo').startOf('month').add(2, 'hour')
  const representDate = current.isSameOrBefore(startOfSenka) ?
    current.toDate() :
    moment.tz('Asia/Tokyo').subtract(2, 'hour').toDate()

  const v7Props = {
    canChangeMonth: true,
    enableOutsideDaysClick: false,
    localeUtils: MomentLocalUtils,
    locale,
    renderDay: renderDayV7,
    selectedDays: representDate,
  }

  const v8Props: DayPickerProps = {
    disableNavigation: true,
    selected: representDate,
    classNames: {
      button: classNames(Classes.BUTTON, Classes.MINIMAL),
    },
    mode: 'single',
    locale: getLocale(locale),
    components: {
      DayContent: renderDayV8,
    },
  }

  return (
    <Container>
      <Title>
        <Icon icon="calendar" style={{ paddingRight: 8 }} />
        {t('Calendar')}
      </Title>
      <BPDatePicker className={classNames(Classes.ELEVATION_1, DayPickerClasses.DATEPICKER, 'bp5-datepicker', 'bp5-elevation-1')}>
        <FullWidth className={classNames(DayPickerClasses.DATEPICKER_CONTENT, 'bp5-datepicker-content', 'bp5-elevation-1')}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <DayPickerFull {...(isV7 ? v7Props : v8Props) as any} />
        </FullWidth>
      </BPDatePicker>
    </Container>
  )
}
