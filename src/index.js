import ReactDOM from 'react-dom'
import React, {Component, PropTypes} from 'react'
import { deprecate } from 'react-is-deprecated'

import processImage from './support.js'

const roundToNearest = (size, precision) => precision * Math.ceil(size / precision)

const isStringNotEmpty = (str) => str && typeof str === 'string' && str.length > 0
const validTypes = ['bg', 'img', 'picture', 'source']

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
    // we don't set this in defaultProps because then just referencing the variable
    // prints the deprecation notice and we only ever check for truthiness so
    // undefined and false are close enough.
    bg: deprecate(PropTypes.bool, 'bg is depracated, use type="bg" instead'),
    component: PropTypes.string,
    fit: PropTypes.string,
    auto: PropTypes.array,
    crop: PropTypes.string,
    faces: PropTypes.bool,
    aggressiveLoad: PropTypes.bool,
    fluid: PropTypes.bool,
    children: PropTypes.any,
    customParams: PropTypes.object,
    entropy: PropTypes.bool,
    generateSrcSet: PropTypes.bool,
    type: PropTypes.oneOf(validTypes)
  };
  static defaultProps = {
    precision: 100,
    component: 'div',
    fluid: true,
    aggressiveLoad: false,
    faces: true,
    fit: 'crop',
    entropy: false,
    auto: ['format'],
    generateSrcSet: true,
    type: 'img'
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
  };

  componentDidMount = () => {
    this.forceLayout()
  };

  _findSizeForDimension = dim => findSizeForDimension(dim, this.props, this.state);

  render () {
    const {
      aggressiveLoad,
      auto,
      bg,
      children,
      component,
      customParams,
      crop,
      entropy,
      faces,
      fit,
      generateSrcSet,
      src,
      type,
      ...other
    } = this.props
    let _src = null
    let srcSet = null
    let _component = component

    let width = this._findSizeForDimension('width')
    let height = this._findSizeForDimension('height')

    let _crop = false
    if (faces) _crop = 'faces'
    if (entropy) _crop = 'entropy'
    if (crop) _crop = crop

    let _fit = false
    if (entropy) _fit = 'crop'
    if (fit) _fit = fit

    if (this.state.mounted || aggressiveLoad) {
      const srcOptions = {
        auto: auto,
        ...customParams,
        crop: _crop,
        fit: _fit,
        width,
        height
      }

      _src = processImage(src, srcOptions)
      const dpr2 = processImage(src, {...srcOptions, dpr: 2})
      const dpr3 = processImage(src, {...srcOptions, dpr: 3})
      srcSet = `${dpr2} 2x, ${dpr3} 3x`
    }

    let childProps = {
      ...this.props.imgProps,
      className: this.props.className,
      width: other.width <= 1 ? null : other.width,
      height: other.height <= 1 ? null : other.height
    }

    // TODO: remove _type once bg option is gone
    const _type = bg ? 'bg' : type
    switch (_type) {
      case 'bg':
        childProps.style = {
          ...childProps.style,
          backgroundSize: 'cover',
          backgroundImage: isStringNotEmpty(_src) ? `url(${_src})` : null
        }
        break
      case 'img':
        _component = 'img'
        if (generateSrcSet) {
          childProps.srcSet = srcSet
        }
        childProps.src = _src
        break
      default:
        // TODO - should we console.error something here? or make img the default?
        break
    }
    return React.createElement(_component,
      childProps,
      children)
  }
}
