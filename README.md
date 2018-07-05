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

### Examples

#### Basic use case

For simply using as you would use an `<img>`, react-imgix can be used as follows:

```js
import Imgix from "react-imgix";

<Imgix src="https://assets.imgix.net/examples/pione.jpg" />;
```

[![Edit xp0348lv0z](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/xp0348lv0z?view=preview)

#### Server-side rendering

For server rendering, `aggressiveLoad` should be used. This component renders nothing on the first render as it tries to work out what the size of the container it will be rendering in, and only loads an image at the resolution required. For server rendering this will mean no image will be rendered.

To keep some of this dynamic behaviour, this configuration is recommended. This will render an image on the server at the default dimensions specified, but will then check what size the element is once on the client, and load a second image.

```js
import Imgix from "react-imgix";

<Imgix
  src="https://assets.imgix.net/examples/pione.jpg"
  aggressiveLoad
  defaultWidth={100} // This sets what resolution the component should load from the CDN
  defaultHeight={200}
/>;
```

Alternatively, if this dynamic behaviour is not desired, of if the width and height are known beforehand, the following is recommended.

```js
import Imgix from "react-imgix";

<Imgix
  src="https://assets.imgix.net/examples/pione.jpg"
  aggressiveLoad
  width={100} // This sets what resolution the component should load from the CDN and the size of the resulting image
  height={200}
/>;
```

#### Flexible image rendering

This component acts dynamically by default. The component will try and work out what the size of the image element is before loading an image from the CDN. Once it knows the dimensions of the element, it will only load an image at an appropriate size for that element, rather than loading the full-size image.

react-imgix implements this by rendering nothing on the first render pass, and then trying to work out what the size of the container it will be rendering in. Then, it will render a second time with a resized src.

Nothing has to be configured for this to work, but to work well some styling should be used to set the size of the component rendered. Without correct styling the image might render at full-size.

`./styles.css`

```css
.App {
  display: flex;
}

.App > img {
  margin: 0 auto;
  width: 200px;
  height: 200px;
}
```

`./app.css`

```js
import "./styles.css";

<div className="App">
  <Imgix src="https://assets.imgix.net/examples/pione.jpg" />
</div>;
```

[![Edit xp0348lv0z](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/xp0348lv0z?view=preview)

#### Fixed image rendering (i.e. non-flexible)

If the fluid, dynamic nature explained above is not desired, the width and height can be set explicitly.

```js
import Imgix from "react-imgix";

<Imgix
  src="https://assets.imgix.net/examples/pione.jpg"
  width={100} // This sets what resolution the component should load from the CDN and the size of the resulting image
  height={200}
/>;
```

#### Picture support

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

#### Background mode

When it's desired for the image to render as the background for an element such as div, `type=bg` can be used. The image will be set using `background-image: url()`.

```js
<Imgix src="https://assets.imgix.net/examples/pione.jpg" type="bg">
  <span>Blog Title</span>
</Imgix>
```

[![Edit zq80p61r4l](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/zq80p61r4l?view=preview)

_Note_: if you use type='bg' the css property background-size is set to 'cover' by default. To override this behaviour you can change the background size by overriding it with a string such as `'contain'`, or to `null` for controlling the style with CSS.

```js
<Imgix
  src={src}
  type="bg"
  imgProps={{ style: { backgroundSize: "contain" } }}
/>
```

A custom component can be used when in bg mode by setting the `component` prop.

```js
<Imgix src={src} type="bg" component="header" />
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

## Browser Support

We support the latest version of Google Chrome (which [automatically updates](https://support.google.com/chrome/answer/95414) whenever it detects that a new version of the browser is available). We also support the current and previous major releases of desktop Firefox, Internet Explorer, and Safari on a rolling basis. Mobile support is tested on the most recent minor version of the current and previous major release for the default browser on iOS and Android (e.g., iOS 9.2 and 8.4). Each time a new version is released, we begin supporting that version and stop supporting the third most recent version.

This browser support is made possible by the great support from [BrowserStack](https://www.browserstack.com/).

<img src="docs/images/Browserstack-logo@2x.png" width="300">

## Meta

React-imgix was originally created by [Frederick Fogerty](http://twitter.com/fredfogerty). It's licensed under the ISC license (see the [license file](https://github.com/imgix/react-imgix/blob/master/LICENSE) for more info). Any contribution is absolutely welcome, but please review the [contribution guidelines](https://github.com/imgix/react-imgix/blob/master/CONTRIBUTING.md) before getting started.
