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
  }
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
  }
  state = {
    width: null,
    height: null,
    mounted: false
  }
  componentDidMount = () => {
    const node = ReactDOM.findDOMNode(this)
    this.setState({
      width: node.scrollWidth,
      height: node.scrollHeight,
      mounted: true
    })
  }
  _findSizeForDimension = dim => findSizeForDimension(dim, this.props, this.state)

  render () {
    let src = ''
    let srcSet = ''
    let component = this.props.component

    let width = this._findSizeForDimension('width')
    let height = this._findSizeForDimension('height')

    let crop = false
    if (this.props.faces) crop = 'faces'
    if (this.props.entropy) crop = 'entropy'

    let fit = false
    if (this.props.entropy) fit = 'crop'
    if (this.props.fit) fit = this.props.fit

    if (this.state.mounted || this.props.aggresiveLoad) {
      const srcOptions = {
        auto: this.props.auto,
        ...this.props.customParams,
        crop,
        fit,
        width,
        height
      }

      src = processImage(this.props.src, srcOptions)
      const dpr2 = processImage(this.props.src, {...srcOptions, dpr: 2})
      const dpr3 = processImage(this.props.src, {...srcOptions, dpr: 3})
      srcSet = `${dpr2} 2x, ${dpr3} 3x`
    }

    let childProps = {...this.props}

    if (this.props.bg) {
      if (!this.props.component) {
        component = 'div'
      }
      childProps.style = {
        ...childProps.style,
        backgroundImage: `url(${src})`,
        backgroundSize: 'cover'
      }
      delete childProps.src
      delete childProps.srcSet
    } else {
      if (!this.props.component) {
        component = 'img'
      }

      if (component === 'img' && this.props.generateSrcSet) {
        childProps.srcSet = srcSet
      }

      childProps.src = src
    }
    return React.createElement(component,
      childProps,
      this.props.children)
  }
}
