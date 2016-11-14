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
        aggressiveLoad
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
// These tests emulate the pre-mount state as `tree.getMountedInstance()` isn't called
describe('<img> mode - pre-mount', () => {
  beforeEach(() => {
    tree = sd.shallowRender(
      <Imgix
        src={src}
      />
    )
    vdom = tree.getRenderOutput()
  })
  it("shouldn't have a blank src tag", () => {
    expect(vdom.props.src).toBe(null)
    expect(vdom.props.srcSet).toBe(null)
  })
})
describe('background mode', () => {
  beforeEach(() => {
    tree = sd.shallowRender(
      <Imgix
        src={src}
        bg
        aggressiveLoad
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
// These tests emulate the pre-mount state as `tree.getMountedInstance()` isn't called
describe('background mode - pre-mount', () => {
  beforeEach(() => {
    tree = sd.shallowRender(
      <Imgix
        src={src}
        bg
      />
    )
    vdom = tree.getRenderOutput()
  })
  it('should not have an empty url()', () => {
    expect(vdom.props.style.backgroundImage).toBe(null)
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
        aggressiveLoad
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
        aggressiveLoad
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
  it('crop prop', () => {
    tree = sd.shallowRender(
      <Imgix
        src={src}
        aggressiveLoad
        crop='faces,entropy'
      />
    )
    vdom = tree.getRenderOutput()

    expect(vdom.props.src).toInclude('crop=faces%2Centropy')
    expect(vdom.props.src).toInclude('fit=crop')
  })
  it('crop prop overrides faces prop', () => {
    tree = sd.shallowRender(
      <Imgix
        src={src}
        aggressiveLoad
        faces
        crop='faces,entropy'
      />
    )
    vdom = tree.getRenderOutput()

    expect(vdom.props.src).toInclude('crop=faces%2Centropy')
    expect(vdom.props.src).toInclude('fit=crop')
  })
  it('crop prop overrides entropy prop', () => {
    tree = sd.shallowRender(
      <Imgix
        src={src}
        aggressiveLoad
        entropy
        crop='faces,entropy'
      />
    )
    vdom = tree.getRenderOutput()

    expect(vdom.props.src).toInclude('crop=faces%2Centropy')
    expect(vdom.props.src).toInclude('fit=crop')
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
        aggressiveLoad
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
        aggressiveLoad
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
        aggressiveLoad
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
        aggressiveLoad
        customParams={{
          'txt64': 'I cannøt belîév∑ it wors! 😱'
        }}
      />
    )
    vdom = tree.getRenderOutput()

    expect(vdom.props.src).toEqual('https://mysource.imgix.net/~text?auto=format&dpr=1&txt64=SSBjYW5uw7h0IGJlbMOuw6l24oiRIGl0IHdvcu-jv3MhIPCfmLE&crop=faces&fit=crop&w=1&h=1')
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
        aggressiveLoad
        generateSrcSet
      />
    )
    vdom = tree.getRenderOutput()

    expect(vdom.props.srcSet).toInclude('dpr=2')
    expect(vdom.props.srcSet).toInclude('dpr=3')
  })
  it('height passed to url param', () => {
    const height = 300
    tree = sd.shallowRender(
      <Imgix
        src={'https://mysource.imgix.net/demo.png'}
        aggressiveLoad
        height={height}
      />
    )
    vdom = tree.getRenderOutput()

    expect(vdom.props.src).toEqual(`https://mysource.imgix.net/demo.png?auto=format&dpr=1&crop=faces&fit=crop&w=1&h=${height}`)
  })

  it('height between 0 and 1 not passed to childProps', () => {
    const height = 0.5
    tree = sd.shallowRender(
      <Imgix
        src={'https://mysource.imgix.net/demo.png'}
        aggressiveLoad
        height={height}
      />
    )
    vdom = tree.getRenderOutput()

    expect(vdom.props.height).toBeFalsy()
  })

  it('height greater than 1 passed to childProps', () => {
    const height = 300
    tree = sd.shallowRender(
      <Imgix
        src={'https://mysource.imgix.net/demo.png'}
        aggressiveLoad
        height={height}
      />
    )
    vdom = tree.getRenderOutput()

    expect(vdom.props.height).toEqual(height)
  })

  it('width passed to url param', () => {
    const width = 300
    tree = sd.shallowRender(
      <Imgix
        src={'https://mysource.imgix.net/demo.png'}
        aggressiveLoad
        width={width}
      />
    )
    vdom = tree.getRenderOutput()

    expect(vdom.props.src).toEqual(`https://mysource.imgix.net/demo.png?auto=format&dpr=1&crop=faces&fit=crop&w=${width}&h=1`)
  })

  it('width between 0 and 1 not passed to childProps', () => {
    const width = 0.5
    tree = sd.shallowRender(
      <Imgix
        src={'https://mysource.imgix.net/demo.png'}
        aggressiveLoad
        width={width}
      />
    )
    vdom = tree.getRenderOutput()

    expect(vdom.props.width).toBeFalsy()
  })

  it('width greater than 1 passed to childProps', () => {
    const width = 300
    tree = sd.shallowRender(
      <Imgix
        src={'https://mysource.imgix.net/demo.png'}
        aggressiveLoad
        width={width}
      />
    )
    vdom = tree.getRenderOutput()

    expect(vdom.props.width).toEqual(width)
  })

  it('accepts any prop passed to imgProps', () => {
    const imgProps = {
      alt: 'Example alt attribute',
      dataSrc: 'https://mysource.imgix.net/demo.png'
    }
    tree = sd.shallowRender(
      <Imgix
        src={'https://mysource.imgix.net/demo.png'}
        imgProps={imgProps}
      />
    )
    vdom = tree.getRenderOutput()

    expect(vdom.props.alt).toEqual(imgProps.alt)
    expect(vdom.props.dataSrc).toEqual(imgProps.dataSrc)
  })
})
