import { kv, Emitter } from '@blast-engine/utils'

export const SCREEN_SIZE = {
  DESKTOP_LG: 'DESKTOP_LG',
  DESKTOP_MD: 'DESKTOP_MD',
  DESKTOP_SM: 'DESKTOP_SM',
  TABLET_LG: 'TABLET_LG',
  TABLET_MD: 'TABLET_MD',
  TABLET_SM: 'TABLET_SM',
  PHONE_LG: 'PHONE_LG',
  PHONE_MD: 'PHONE_MD',
  PHONE_SM: 'PHONE_SM',
  SMALLEST: 'SMALLEST', // from zero till first threshold
}

// dont include limits (smallest)
const THRESHOLDS_CONFIG = {
  [SCREEN_SIZE.DESKTOP_LG]: 1600,
  [SCREEN_SIZE.DESKTOP_MD]: 1400,
  [SCREEN_SIZE.DESKTOP_SM]: 1200,
  [SCREEN_SIZE.TABLET_LG]: 1100,
  [SCREEN_SIZE.TABLET_MD]: 600,
  [SCREEN_SIZE.TABLET_SM]: 500,
  [SCREEN_SIZE.PHONE_LG]: 400,
  [SCREEN_SIZE.PHONE_MD]: 360,
  [SCREEN_SIZE.PHONE_SM]: 300
}

export const createScreenWidthBroadcaster = () => {

  const thresholds = kv(THRESHOLDS_CONFIG)
    .map(({ k:size, v:minWidth }) => ({ size, minWidth }))
    .filter(({ size }) => size !== SCREEN_SIZE.SMALLEST)
    .map(({ size, minWidth }) => ({
      size, 
      minWidth,
      query: window.matchMedia(`only screen and (min-width: ${minWidth}px)`)
    }))

  const broadcaster = { 
    current: null, 
    emitter: new Emitter(),
    isBiggerOrEqualTo: size => {
      if (!SCREEN_SIZE[size]) throw new Error('invalid size: ' + size)
      if (broadcaster.current.size === SCREEN_SIZE.SMALLEST) return false
      const currentWidth = THRESHOLDS_CONFIG[broadcaster.current.size]
      const requestWidth = THRESHOLDS_CONFIG[size]
      return currentWidth >= requestWidth
    }
  }

  class SizeWrapper {

    constructor(size) {
      this.size = size
    }

    isBiggerOrEqualTo(size) {
      if (!SCREEN_SIZE[size]) throw new Error('invalid size: ' + size)
      if (this.size === SCREEN_SIZE.SMALLEST) return false
      const currentWidth = THRESHOLDS_CONFIG[this.size]
      const requestWidth = THRESHOLDS_CONFIG[size]
      return currentWidth >= requestWidth
    }

  }

  const update = () => {
    const largestMatched = thresholds.reduce((largestMatched, t) => {
      if (!t.query.matches) return largestMatched
      if (!largestMatched || largestMatched.minWidth < t.minWidth) return t
      return largestMatched
    }, null)

    const broadcast = (size) => {
      broadcaster.current = new SizeWrapper(size)
      broadcaster.emitter.emit(broadcaster.current)
    }

    if (!largestMatched) {
      if (broadcaster.current !== SCREEN_SIZE.SMALLEST)
        broadcast(SCREEN_SIZE.SMALLEST)
    } else {
      if (!broadcaster.current || largestMatched.size !== broadcaster.current)
        broadcast(largestMatched.size)
    } 
  }

  thresholds.forEach(t => t.query.addListener(update))
  update()

  return broadcaster
  
}