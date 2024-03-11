import styled from 'styled-components'
import { Colors } from '@blueprintjs/core'

export const Container = styled.div`
  padding: 4px 8px;
`

export const Title = styled.h5`
  padding: 8px 16px;
  display: flex;
  align-items: center;
  background-color: ${Colors.LIGHT_GRAY2};
  .bp4-dark &,
  .bp5-dark & {
    background-color: ${Colors.DARK_GRAY5};
  }
`
