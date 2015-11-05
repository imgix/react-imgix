import ix from 'imgix.js'
import ReactDOM from 'react-dom'
import React, {Component, PropTypes} from 'react'

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
    children: PropTypes.any
  }
  static defaultProps = {
    precision: 100,
    bg: false,
    fluid: true,
    aggresiveLoad: false,
    faces: true,
    fit: 'crop',
    auto: ['format']
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
    let src = new ix.URL(this.props.src)
    let component = this.props.component

    let width = this._findSizeForDimension('width')
    let height = this._findSizeForDimension('height')
    src.setParams({
      w: width,
      h: height,
      fit: this.props.fit,
      auto: this.props.auto
    })

    if (this.props.faces) {
      src.setCrop('faces')
    }

    src = src.getUrl()

    if (!this.state.mounted && !this.props.aggresiveLoad) {
      src = ''
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
    } else {
      if (!this.props.component) {
        component = 'img'
      }
      childProps.src = src
    }
    return React.createElement(component,
      childProps,
      this.props.children)
  }
}
