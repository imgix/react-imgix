/* global describe it beforeEach */

import expect from 'expect'
import expectJSX from 'expect-jsx'
import sd from 'skin-deep'
import React from 'react'

import Imgix from './index.js'

expect.extend(expectJSX)

const src = 'http://domain.imgix.net/image.jpg'
let tree, vdom, instance // eslint-disable-line no-unused-vars

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
    expect(vdom.type).toBe('img')
  })
  it('should have a src tag', () => {
    expect(vdom.props.src).toInclude(src)
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
    expect(vdom.type).toBe('div')
  })
  it('should have the appropriate styles', () => {
    expect(vdom.props.style.backgroundImage).toInclude(src)
    expect(vdom.props.style.backgroundSize).toBe('cover')
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
    expect(vdom.props.style.backgroundImage).toInclude(src)
    expect(vdom.type).toBe('li')
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
    expect(vdom.props.src).toInclude('auto=format%2Cenhance')
  })
  it('className prop', () => {
    expect(vdom.props.className).toInclude(className)
  })
  it('faces prop', () => {
    expect(vdom.props.src).toInclude('crop=faces')
  })
  it('fit prop', () => {
    expect(vdom.props.src).toInclude('fit=crop')
  })
  it('entropy prop', () => {
    tree = sd.shallowRender(
      <Imgix
        src={src}
        aggresiveLoad
        entropy
      />
    )
    vdom = tree.getRenderOutput()

    expect(vdom.props.src).toInclude('crop=entropy')
    expect(vdom.props.src).toInclude('fit=crop')
  })
  it('url encodes param keys', () => {
    tree = sd.shallowRender(
      <Imgix
        src={'https://mysource.imgix.net/demo.png'}
        aggresiveLoad
        customParams={{
          'hello world': 'interesting'
        }}
      />
    )
    vdom = tree.getRenderOutput()

    expect(vdom.props.src).toEqual('https://mysource.imgix.net/demo.png?auto=format&dpr=1&hello%20world=interesting&crop=faces&fit=crop&w=1&h=1')
  })
  it('url encodes param values', () => {
    tree = sd.shallowRender(
      <Imgix
        src={'https://mysource.imgix.net/demo.png'}
        aggresiveLoad
        customParams={{
          'hello_world': '/foo"> <script>alert("hacked")</script><'
        }}
      />
    )
    vdom = tree.getRenderOutput()

    expect(vdom.props.src).toEqual('https://mysource.imgix.net/demo.png?auto=format&dpr=1&hello_world=%2Ffoo%22%3E%20%3Cscript%3Ealert(%22hacked%22)%3C%2Fscript%3E%3C&crop=faces&fit=crop&w=1&h=1')
  })
  it('Base64 encodes Base64 param variants', () => {
    tree = sd.shallowRender(
      <Imgix
        src={'https://mysource.imgix.net/~text'}
        aggresiveLoad
        customParams={{
          'txt64': 'I cannøt belîév∑ it wors! 😱'
        }}
      />
    )
    vdom = tree.getRenderOutput()

    expect(vdom.props.src).toEqual('https://mysource.imgix.net/~text?auto=format&dpr=1&txt64=SSBjYW5uw7h0IGJlbMOuw6l24oiRIGl0IHdvcu-jv3MhIPCfmLE&crop=faces&fit=crop&w=1&h=1')
  })
  it('strip protocol if stripProtocol attribute is present', () => {
    tree = sd.shallowRender(
      <Imgix
        src={'https://mysource.imgix.net/demo.png'}
        aggresiveLoad
        stripProtocol
      />
    )
    vdom = tree.getRenderOutput()

    const protocolIndex = vdom.props.src.indexOf('//mysource.imgix.net/demo.png')
    expect(protocolIndex).toBe(0)
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
  it('generateSrcSet prop', () => {
    tree = sd.shallowRender(
      <Imgix
        src={src}
        aggresiveLoad
        generateSrcSet
      />
    )
    vdom = tree.getRenderOutput()

    expect(vdom.props.srcSet).toInclude('dpr=2')
    expect(vdom.props.srcSet).toInclude('dpr=3')
  })
})
