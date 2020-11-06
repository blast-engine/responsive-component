import { createScreenWidthBroadcaster } from './screen-width.broadcaster'
import { createResponsiveComponentWrapper } from './responsive-component'

const screenWidthBroadcaster = createScreenWidthBroadcaster()
const responsiveComponent = createResponsiveComponentWrapper(screenWidthBroadcaster)

window.screenWidthBroadcaster = screenWidthBroadcaster

export { responsiveComponent }