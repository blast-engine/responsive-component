import React from 'react'

import { SCREEN_SIZE } from './screen-width.broadcaster'

export const createResponsiveComponentWrapper = 
  screenWidthBroadcaster =>
  Component => 
    class ResponsiveComponent extends React.PureComponent {

      state = { screenWidth: screenWidthBroadcaster.current }
      
      _handleScreenSize = size => this.setState({ screenWidth: size })

      componentDidMount() {
        screenWidthBroadcaster.emitter.subscribe(this._handleScreenSize)
      }

      componentWillUnmount() {
        screenWidthBroadcaster.emitter.unsubscribe(this._handleScreenSize)
      }
      
      render() {

        const { screenWidth } = this.state

        let sizeClass
        if (screenWidth.isBiggerOrEqualTo(SCREEN_SIZE.TABLET_SM)) {
          if (screenWidth.isBiggerOrEqualTo(SCREEN_SIZE.TABLET_MD))
            sizeClass = 'screen-big'
          else sizeClass = 'screen-md'
        } else sizeClass = 'screen-small'

        return <Component 
          {...this.props} 
          sizeClass={sizeClass} 
          isMobile={sizeClass === 'screen-small'}
        />
      }
    }