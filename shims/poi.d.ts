declare module 'views/components/etc/window-env' {
  import { Context } from 'react'

  export const WindowEnv: Context<{ window: Window, mountPoint: HTMLElement }>
}

declare module 'views/env-parts/i18next' {
  import { i18n } from 'i18next'

  const i18nextInstance: i18n
  export default i18nextInstance
}

declare module 'views/utils/selectors' {
  import { APIShip, APIBasic } from 'kcsapi/api_port/port/response'
  import {
    APIMstShip,
    APIMstShipgraph,
    APIMstStype,
  } from 'kcsapi/api_start2/getData/response'
  import { APIMapInfo } from 'kcsapi/api_get_member/mapinfo/response'
  import { Selector } from 'reselect'
  interface Dictionary<T> {
    [index: string]: T
  }

  export interface IState {
    const: IConstState
    config: any,
    ext: any
  }

  export interface IConstState {
    $shipgraph?: APIMstShipgraph[]
    $shipTypes?: Dictionary<APIMstStype>
    $ships?: Dictionary<APIMstShip>
  }

  export interface IFCD {
    shipavatar: {
      marginMagics: Dictionary<any>
    }
    shiptag: any
  }

  export type IShipData = [APIShip?, APIMstShip?]

  export const configSelector: Selector<any, any>
  export const configLayoutSelector: Selector<any, boolean>
  export const configDoubleTabbedSelector: Selector<any, boolean>
  export const basicSelector: Selector<any, APIBasic>
  export const mapsSelector: Selector<any, APIMapInfo>
  export const constSelector: Selector<any, IConstState>
  export const extensionSelectorFactory: (id: string) => Selector<IState, unknown>
  export const fcdSelector: Selector<any, IFCD>
  export const fleetInExpeditionSelectorFactory: (id: number) => Selector<any, any>
  export const fleetShipsIdSelectorFactory: (id: number) => Selector<any, any>
  export const inRepairShipsIdSelector: Selector<any, any>
  export const shipDataSelectorFactory: (id: number) => Selector<any, IShipData>
  export const shipEquipDataSelectorFactory: (id: number) => Selector<any, any>
  export const equipDataSelectorFactory: (id: number) => Selector<any, any>
  export const shipsSelector: Selector<any, Dictionary<APIShip>>
  export const stateSelector: Selector<any, any>
  export const wctfSelector: Selector<any, any>
}

declare module 'views/components/etc/overlay' {
  export { Tooltip, Popover, Dialog } from '@blueprintjs/core'
}

declare module 'views/components/etc/avatar' {
  import { ComponentType } from 'react'

  export const Avatar: ComponentType<any>
}

declare module 'views/utils/tools' {
  export const resolveTime: (time: number) => string
}

declare module 'views/components/etc/icon' {
  import { ComponentType } from 'react'

  export const SlotitemIcon: ComponentType<any>
}

declare module 'views/utils/ship-img' {
  export const getShipImgPath: (id: number, type: string, damagaed: boolean, ip?: string, version?: number) => string
}


declare module 'views/create-store' {
  export type Store = {
    dispatch: (action: object) => void,
    getState: () => any
  }
  export const store: Store<any>
}
