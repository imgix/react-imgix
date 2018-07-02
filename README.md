<img src="https://assets.imgix.net/imgix-logo-web-2014.pdf?page=2&fm=png&w=120" srcset="https://assets.imgix.net/imgix-logo-web-2014.pdf?page=2&fm=png&w=120 1x,
 https://assets.imgix.net/imgix-logo-web-2014.pdf?page=2&fm=png&w=120&dpr=2 2x, https://assets.imgix.net/imgix-logo-web-2014.pdf?page=2&fm=png&w=120&dpr=3 3x" alt="imgix logo">

# imgix for React

[![npm](https://img.shields.io/npm/dm/react-imgix.svg)](https://www.npmjs.com/package/react-imgix)
[![npm version](https://img.shields.io/npm/v/react-imgix.svg)](https://www.npmjs.com/package/react-imgix)
[![Build Status](https://travis-ci.org/imgix/react-imgix.svg?branch=master)](https://travis-ci.org/imgix/react-imgix)
[![Dependencies Status](https://david-dm.org/imgix/react-imgix.svg)](https://david-dm.org/imgix/react-imgix)
[![Code Climate](https://codeclimate.com/github/imgix/react-imgix/badges/gpa.svg)](https://codeclimate.com/github/imgix/react-imgix)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

A [React](https://facebook.github.io/react/) component that renders images using the [imgix](https://www.imgix.com/) API. It uses the smallest images possible, and does cool stuff, like [cropping to faces](https://www.imgix.com/docs/reference/size#param-crop) by default.

- [Installation](#installation)
- [Usage](#usage)
- [Props](#props)
- [Browser Support](#browser-support)
- [Meta](#meta)

## Installation

- **NPM**: `npm install react-imgix`
- **Yarn**: `yarn add react-imgix`

This module exports two transpiled versions. If a ES6-module-aware bundler is being used to consume this module, it will pick up an ES6 module version and can perform tree-shaking. **If you are not using ES6 modules, you don't have to do anything**

## Usage

```js
import Imgix from 'react-imgix'

// in react component
<Imgix src={string} />
```

### Props

#### src :: string, required

Usually in the form: `https://[your_domain].imgix.net/[image]`. Don't include any parameters.

#### aggressiveLoad :: bool, default = false

Whether to wait until the component has mounted to render the image, useful for auto-sizing and server-side rendering, defaults to false

#### auto :: array, default = ['format']

Array of values to pass to imgix's auto param

#### type :: string, default = 'img'

What kind of component to render, one of `img`, `bg`, `picture`, `source`.

#### component :: string, default = 'div'

Wrapper component to use when rendering a `bg`, defaults to `div`

#### className :: string

`className` applied to top level component. To set `className` on the image itself see `imgProps`.

#### entropy :: bool, default = false

Whether or not to crop using points of interest. See imgix API for more details.

#### faces :: bool, default = true

Whether to crop to faces

#### crop :: string

Sets specific crop, overriding faces and entropy flags. Useful for specifying fallbacks for faces like `faces,top,right`

#### fit :: string

See imgix's API, defaults to `crop`

#### fluid :: bool, default = true

Whether to fit the image requested to the size of the component rendered.

#### onMounted :: func

Called on `componentDidMount` with the mounted DOM node as an argument

#### precision :: number

Round to nearest x for image width and height, useful for caching, defaults to `100`

#### height :: number

Force images to be a certain height, overrides `precision`

#### width :: number

Force images to be a certain width, overrides `precision`

#### defaultHeight :: number

Fallback height for images, useful for SSR or static site generation

#### defaultWidth :: number

Fallback width for images, useful for SSR or static site generation

#### generateSrcSet :: bool

Generate `2x` and `3x` src sets when using an `<img>` tag. Defaults to `true`

#### disableLibraryParam :: bool

By default this component adds a parameter to the generated url to help imgix with analytics and support for this library. This can be disabled by setting this prop to `true`.

#### customParams :: object

Any other imgix params to add to the image `src`

_For example_:

```js
<Imgix customParams={{ mask: "ellipse" }} />
```

#### imgProps :: object

Any other attributes to add to the html node (example: `alt`, `data-*`, `className`)

_Note_: if you use type='bg' the css property background-size is set to 'cover' by default. To override this behaviour you can change the background size by overriding it with a string such as `'contain'`, or to `null` for controlling the style with CSS.

```js
<Imgix
  src={src}
  type="bg"
  imgProps={{ style: { backgroundSize: "contain" } }}
/>
```

### Picture Support

Using the [<picture> element](https://docs.imgix.com/tutorials/using-imgix-picture-element) you can create responsive images:

```js
<Imgix src={src} type="picture">
  <Imgix
    src={src}
    width={400}
    type="source"
    imgProps={{ media: "(min-width: 768px)" }}
  />
  <Imgix
    src={src}
    width={200}
    type="source"
    imgProps={{ media: "(min-width: 320px)" }}
  />
  <Imgix src={src} width={100} type="img" />
</Imgix>
```

The final `type='img'` component will be created with the options passed into the parent `<picture>` container if it's not provided so the above is equivalent to:

```js
<Imgix src={src} width={100} type="picture">
  <Imgix
    src={src}
    width={400}
    type="source"
    imgProps={{ media: "(min-width: 768px)" }}
  />
  <Imgix
    src={src}
    width={200}
    type="source"
    imgProps={{ media: "(min-width: 320px)" }}
  />
</Imgix>
```

## Browser Support

We support the latest version of Google Chrome (which [automatically updates](https://support.google.com/chrome/answer/95414) whenever it detects that a new version of the browser is available). We also support the current and previous major releases of desktop Firefox, Internet Explorer, and Safari on a rolling basis. Mobile support is tested on the most recent minor version of the current and previous major release for the default browser on iOS and Android (e.g., iOS 9.2 and 8.4). Each time a new version is released, we begin supporting that version and stop supporting the third most recent version.

This browser support is made possible by the great support from [BrowserStack](https://www.browserstack.com/).

<img src="docs/images/Browserstack-logo@2x.png" width="300">

## Meta

React-imgix was originally created by [Frederick Fogerty](http://twitter.com/fredfogerty). It's licensed under the ISC license (see the [license file](https://github.com/imgix/react-imgix/blob/master/LICENSE) for more info). Any contribution is absolutely welcome, but please review the [contribution guidelines](https://github.com/imgix/react-imgix/blob/master/CONTRIBUTING.md) before getting started.
