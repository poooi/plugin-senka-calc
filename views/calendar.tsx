import React, { useCallback } from 'react'
import DayPicker from 'react-day-picker'
import MomentLocalUtils from 'react-day-picker/moment'
import { Classes as DateTimeClasses } from '@blueprintjs/datetime'
import { Classes, Colors, Icon } from '@blueprintjs/core'
import classnames from 'classnames'
import { Container, Title } from './common'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { pluginDataSelector } from '../selectors'
import styled from 'styled-components'
import moment from 'moment-timezone'
import { getDateNo } from '../lib/util'
import { EXPERIENCE_TO_SENKA_RATE } from '../lib/const'
import { configSelector } from 'views/utils/selectors'
import { get } from 'lodash'

const FullWidth = styled.div`
  width: 100%;
`
const BPDatePicker = styled(FullWidth)`
  background: #FFFFFF20 !important;
  .bp4-dark & {
    background: ${Colors.DARK_GRAY3 + '20'} !important;
  }
`
const DayPickerFull = styled(DayPicker)`
  width: 100%;
  & .DayPicker-Month {
    width: calc(100% - 10px);
  }
`

const DateContainer = styled.div`
  font-weight: 700;
  margin-bottom: 4px;
`

const SenkaContainer = styled.div`
  font-size: 90%;
`

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

  const renderDay = useCallback((day: Date) => {
    const date = day.getDate()
    return (
      <div className={DateTimeClasses.DATEPICKER_DAY_WRAPPER}>
        <DateContainer>
          {date}
        </DateContainer>
        <SenkaContainer>
          {getSenkaByDate(date)}
        </SenkaContainer>
      </div>
    )
  }, [getSenkaByDate])

  const current = moment.tz('Asia/Tokyo')
  const startOfSenka = moment.tz('Asia/Tokyo').startOf('month').add(2, 'hour')
  const representDate = current.isSameOrBefore(startOfSenka) ?
    current.toDate() :
    moment.tz('Asia/Tokyo').subtract(2, 'hour').toDate()

  return (
    <Container>
      <Title>
        <Icon icon="calendar" style={{ paddingRight: 8 }} />
        {t('Calendar')}
      </Title>
      <BPDatePicker className={classnames(DateTimeClasses.DATEPICKER, Classes.ELEVATION_1)}>
        <FullWidth className={DateTimeClasses.DATEPICKER_CONTENT}>
          <DayPickerFull
            canChangeMonth={true}
            enableOutsideDaysClick={false}
            localeUtils={MomentLocalUtils}
            locale={locale}
            renderDay={renderDay}
            selectedDays={representDate}
          />
        </FullWidth>
      </BPDatePicker>
    </Container>
  )
}
