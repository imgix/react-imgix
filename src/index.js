import ReactDOM from 'react-dom'
import React, {Component, PropTypes} from 'react'

import processImage from './support.js'

const roundToNearest = (size, precision) => precision * Math.ceil(size / precision)

const defaultMap = {
  width: 'defaultWidth',
  height: 'defaultHeight'
}

const findSizeForDimension = (dim, props = {}, state = {}) => {
  if (props[dim]) {
    return props[dim]
  } else if (props.fluid && state[dim]) {
    return roundToNearest(state[dim], props.precision)
  } else if (props[defaultMap[dim]]) {
    return props[defaultMap[dim]]
  } else {
    return 1
  }
}

export default class ReactImgix extends Component {
  static propTypes = {
    src: PropTypes.string.isRequired,
    className: PropTypes.string,
    bg: PropTypes.bool,
    component: PropTypes.string,
    fit: PropTypes.string,
    auto: PropTypes.array,
    faces: PropTypes.bool,
    aggresiveLoad: PropTypes.bool,
    fluid: PropTypes.bool,
    children: PropTypes.any,
    customParams: PropTypes.object,
    entropy: PropTypes.bool,
    generateSrcSet: PropTypes.bool
  };
  static defaultProps = {
    precision: 100,
    bg: false,
    fluid: true,
    aggresiveLoad: false,
    faces: true,
    fit: 'crop',
    entropy: false,
    auto: ['format'],
    generateSrcSet: true
  };
  state = {
    width: null,
    height: null,
    mounted: false
  };

  forceLayout = () => {
    const node = ReactDOM.findDOMNode(this)
    this.setState({
      width: node.scrollWidth,
      height: node.scrollHeight,
      mounted: true
    })
  }

  componentDidMount = () => {
    this.forceLayout()
  }

  _findSizeForDimension = dim => findSizeForDimension(dim, this.props, this.state);

  render () {
    const {
      aggresiveLoad,
      auto,
      bg,
      children,
      component,
      customParams,
      entropy,
      faces,
      fit,
      generateSrcSet,
      src,
      ...other
    } = this.props
    let _src = ''
    let srcSet = ''
    let _component = component

    let width = this._findSizeForDimension('width')
    let height = this._findSizeForDimension('height')

    let crop = false
    if (faces) crop = 'faces'
    if (entropy) crop = 'entropy'

    let _fit = false
    if (entropy) _fit = 'crop'
    if (fit) _fit = fit

    if (this.state.mounted || aggresiveLoad) {
      const srcOptions = {
        auto: auto,
        ...customParams,
        crop,
        fit: _fit,
        width,
        height
      }

      _src = processImage(src, srcOptions)
      const dpr2 = processImage(src, {...srcOptions, dpr: 2})
      const dpr3 = processImage(src, {...srcOptions, dpr: 3})
      srcSet = `${dpr2} 2x, ${dpr3} 3x`
    }

    let childProps = other

    if (bg) {
      if (!component) {
        _component = 'div'
      }
      childProps.style = {
        ...childProps.style,
        backgroundImage: `url(${_src})`,
        backgroundSize: 'cover'
      }
    } else {
      if (!component) {
        _component = 'img'
      }

      if (_component === 'img' && generateSrcSet) {
        childProps.srcSet = srcSet
      }

      childProps.src = _src
    }
    return React.createElement(_component,
      childProps,
      children)
  }
}
