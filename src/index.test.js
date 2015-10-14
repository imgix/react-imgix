/* global describe it beforeEach */
import { expect } from 'chai'
import React from 'react'
import Imgix from './index.js'
import sd from 'skin-deep'

const src = 'http://domain.imgix.net/image.jpg'
let tree, vdom, instance

describe('<img> mode', () => {
  beforeEach(() => {
    tree = sd.shallowRender(
      <Imgix
        src={src}
        aggresiveLoad
      />
    )
    vdom = tree.getRenderOutput()
    instance = tree.getMountedInstance()
  })

  it('should render an image', () => {
    expect(vdom.type).to.equal('img')
  })
  it('should have a src tag', () => {
    expect(vdom.props.src).to.include(src)
  })
})
describe('background mode', () => {
  beforeEach(() => {
    tree = sd.shallowRender(
      <Imgix
        src={src}
        bg
        aggresiveLoad
      />
    )
    vdom = tree.getRenderOutput()
    instance = tree.getMountedInstance()
  })
  it('should render a div', () => {
    expect(vdom.type).to.equal('div')
  })
  it('should have the appropriate styles', () => {
    expect(vdom.props.style.backgroundImage).to.include(src)
    expect(vdom.props.style.backgroundSize).to.equal('cover')
  })
})
describe('custom component', () => {
  beforeEach(() => {
    tree = sd.shallowRender(
      <Imgix
        src={src}
        component='li'
        bg
        aggresiveLoad
      />
    )
    vdom = tree.getRenderOutput()
    instance = tree.getMountedInstance()
  })
  it('should render the custom component', () => {
    expect(vdom.props.style.backgroundImage).to.include(src)
    expect(vdom.type).to.equal('li')
  })
})
describe('image props', () => {
  let className = 'img--enabled'
  beforeEach(() => {
    tree = sd.shallowRender(
      <Imgix
        src={src}
        auto={['format', 'enhance']}
        className={className}
        aggresiveLoad
        faces
      />
    )
    vdom = tree.getRenderOutput()
    instance = tree.getMountedInstance()
  })
  it('auto prop', () => {
    expect(vdom.props.src).to.include('auto=format,enhance')
  })
  it('className prop', () => {
    expect(vdom.props.className).to.include(className)
  })
  it('faces prop', () => {
    expect(vdom.props.src).to.include('crop=faces')
  })
  it('fit prop', () => {
    expect(vdom.props.src).to.include('fit=crop')
  })
  // it('fluid prop', () => {
  //   expect(vdom.props.src).to.include('auto=format,enhance')
  // })
  // it('precision prop', () => {
  //   expect(vdom.props.src).to.include('auto=format,enhance')
  // })
  // it.skip('custom props', () => {
  //   expect(vdom.props.src).to.include('auto=format,enhance')
  // })
})