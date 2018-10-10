<img src="https://assets.imgix.net/imgix-logo-web-2014.pdf?page=2&fm=png&w=120" srcset="https://assets.imgix.net/imgix-logo-web-2014.pdf?page=2&fm=png&w=120 1x,
 https://assets.imgix.net/imgix-logo-web-2014.pdf?page=2&fm=png&w=120&dpr=2 2x, https://assets.imgix.net/imgix-logo-web-2014.pdf?page=2&fm=png&w=120&dpr=3 3x" alt="imgix logo">

# imgix for React

[![npm](https://img.shields.io/npm/dm/react-imgix.svg)](https://www.npmjs.com/package/react-imgix)
[![npm version](https://img.shields.io/npm/v/react-imgix.svg)](https://www.npmjs.com/package/react-imgix)
[![Build Status](https://travis-ci.org/imgix/react-imgix.svg?branch=master)](https://travis-ci.org/imgix/react-imgix)
[![Dependencies Status](https://david-dm.org/imgix/react-imgix.svg)](https://david-dm.org/imgix/react-imgix)
[![Code Climate](https://codeclimate.com/github/imgix/react-imgix/badges/gpa.svg)](https://codeclimate.com/github/imgix/react-imgix)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

A [React](https://facebook.github.io/react/) component that renders images using [imgix](https://www.imgix.com/). It uses the smallest images possible, and renders well on the server.

- [Overview / Resources](#overview-resources)
- [Installation](#installation)
- [Examples](#examples)
  - [Basic Use Case](#basic-use-case)
  - [Server-side rendering](#server-side-rendering)
  - [Flexible image rendering](#fixed-image-rendering-ie-non-flexible)
  - [Fixed image rendering](#fixed-image-rendering)
  - [Lazy Loading](#lazy-loading)
  - [Low Quality Image Placeholder Technique (LQIP)](#low-quality-image-placeholder-technique-lqip)
  - [Picture support](#picture-support)
  - [Background mode](#background-mode)
- [Props](#props)
- [Global Configuration](#global-configuration)
  - [Warnings](#warnings)
- [Browser Support](#browser-support)
- [Upgrade Guides](#upgrade-guides)
- [Meta](#meta)

## Overview / Resources

**Before you get started with react-imgix**, it's _highly recommended_ that you read Eric Portis' [seminal article on `srcset` and `sizes`](https://ericportis.com/posts/2014/srcset-sizes/). This article explains the history of responsive images in responsive design, why they're necessary, and how all these technologies work together to save bandwidth and provide a better experience for users. The primary goal of react-imgix is to make these tools easier for developers to implement, so having an understanding of how they work will significantly improve your react-imgix experience.

Below are some other articles that help explain responsive imagery, and how it can work alongside imgix:

- [Using imgix with `<picture>`](https://docs.imgix.com/tutorials/using-imgix-picture-element). Discusses the differences between art direction and resolution switching, and provides examples of how to accomplish art direction with imgix.
- [Responsive Images with `srcset` and imgix](https://docs.imgix.com/tutorials/responsive-images-srcset-imgix). A look into how imgix can work with `srcset` and `sizes` to serve the right image.

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

<Imgix src="https://assets.imgix.net/examples/pione.jpg" sizes="100vw" />;
```

[![Edit xp0348lv0z](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/xp0348lv0z?view=preview)

**Please note:** `100vw` is an appropriate `sizes` value for a full-bleed image. If your image is not full-bleed, you should use a different value for `sizes`. [Eric Portis' "Srcset and sizes"](https://ericportis.com/posts/2014/srcset-sizes/) article goes into depth on how to use the `sizes` attribute.

This will generate HTML similar to the following:

```html
<img
	src="https://assets.imgix.net/examples/pione.jpg?auto=format&amp;crop=faces&amp;fit=crop&amp;ixlib=react-7.2.0"
	sizes="100vw"
	srcset="https://assets.imgix.net/examples/pione.jpg?auto=format&amp;crop=faces&amp;fit=crop&amp;ixlib=react-7.2.0&amp;w=100 100w, https://assets.imgix.net/examples/pione.jpg?auto=format&amp;crop=faces&amp;fit=crop&amp;ixlib=react-7.2.0&amp;w=200 200w,..."
>
```

Since imgix can generate as many derivative resolutions as needed, react-imgix calculates them programmatically, using the dimensions you specify. All of this information has been placed into the srcset and sizes attributes.

**Width and height known:** If the width and height are known beforehand, it is recommended that they are set explicitly:

```js
import Imgix from "react-imgix";

<Imgix
  src="https://assets.imgix.net/examples/pione.jpg"
  width={100} // This sets what resolution the component should load from the CDN and the size of the resulting image
  height={200}
/>;
```

NB: Since this library sets [`fit`](https://docs.imgix.com/apis/url/size/fit) to `crop` by default, when just a width or height is set, the image will resize and maintain aspect ratio. When both are set, the image will be cropped to that size, maintaining pixel aspect ratio (i.e. edges are clipped in order to not stretch the photo). If this isn't desired, set `fit` to be another value (e.g. `clip`)

[![Edit xp0348lv0z](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/xp0348lv0z?view=preview)

#### Server-side rendering

React-imgix also works well on the server. Since react-imgix uses `srcset` and `sizes`, it allows the browser to render the correctly sized image immediately after the page has loaded.

```js
import Imgix from "react-imgix";

<Imgix src="https://assets.imgix.net/examples/pione.jpg" sizes="100vw" />;
```

If the width and height are known beforehand, it is recommended that they are set explicitly:

```js
import Imgix from "react-imgix";

<Imgix
  src="https://assets.imgix.net/examples/pione.jpg"
  width={100} // This sets what resolution the component should load from the CDN and the size of the resulting image
  height={200}
/>;
```

#### Flexible image rendering

This component acts dynamically by default. The component will leverage `srcset` and `sizes` to render the right size image for its container. This is an example of this responsive behaviour.

`sizes` should be set properly for this to work well, and some styling should be used to set the size of the component rendered. Without `sizes` and correct styling the image might render at full-size.

`./styles.css`

```css
.App {
  display: flex;
}

.App > img {
  margin: 10px auto;
  width: 10vw;
  height: 200px;
}
```

`./app.css`

```js
import "./styles.css";

<div className="App">
  <Imgix
    src="https://assets.imgix.net/examples/pione.jpg"
    sizes="calc(10% - 10px)"
  />
</div>;
```

[![Edit xp0348lv0z](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/xp0348lv0z?view=preview)

**Aspect Ratio:** A developer can pass a desired aspect ratio, which will be used when
generating srcsets to generate the correct height, according to the aspect ratio.

```js
<div className="App">
  <Imgix
    src="https://assets.imgix.net/examples/pione.jpg"
    sizes="calc(10% - 10px)"
    imgixParams={{ ar: "16:9" }}
  />
</div>
```

The aspect ratio is specified in the format `width:height`. Either dimension can be an integer or a float. All of the following are valid: 16:9, 5:1, 1.92:1, 1:1.67.

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

[![Edit 4z1rzq04q7](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/4z1rzq04q7?view=preview)

#### Lazy Loading

If you'd like to lazy load images, we recommend using [lazysizes](https://github.com/aFarkas/lazysizes). In order to use react-imgix with lazysizes, you can simply tell it to generate lazysizes-compatible attributes instead of the standard `src`, `srcset`, and `sizes` by changing some configuration settings:

```jsx
<Imgix
	className="lazyload"
	src="..."
	sizes="..."
	attributeConfig={{
		src: 'data-src',
		srcSet: 'data-srcset'
		sizes: 'data-sizes'
	}}
/>
```

The same configuration is available for `<Source />` components

**NB:** It is recommended to use the [attribute change plugin](https://github.com/aFarkas/lazysizes/tree/gh-pages/plugins/attrchange) in order to capture changes in the data-\* attributes. Without this, changing the props to this library will have no effect on the rendered image.

#### Low Quality Image Placeholder Technique (LQIP)

If you'd like to use LQIP images, like before, we recommend using [lazysizes](https://github.com/aFarkas/lazysizes). In order to use react-imgix with lazysizes, you can simply tell it to generate lazysizes-compatible attributes instead of the standard `src`, `srcset`, and `sizes` by changing some configuration settings, and placing the fallback image src in the htmlAttributes:

```jsx
<Imgix
	className="lazyload"
	src="..."
	sizes="..."
	attributeConfig={{
		src: 'data-src',
		srcSet: 'data-srcset'
		sizes: 'data-sizes'
	}}
	htmlAttributes={{
		src: '...' // low quality image here
	}}
/>
```

**NB:** If the props of the image are changed after the first load, the low quality image will replace the high quality image. In this case, the `src` attribute may have to be set by modifying the DOM directly, or the lazysizes API may have to be called manually after the props are changed. In any case, this behaviour is not supported by the library maintainers, so use at your own risk.

#### Picture support

Using the [<picture> element](https://docs.imgix.com/tutorials/using-imgix-picture-element) you can create responsive images:

```js
import Imgix, { Picture, Source } from 'react-imgix'

<Picture>
  <Source
    src={src}
    width={400}
    htmlAttributes={{ media: "(min-width: 768px)" }}
  />
  <Source
    src={src}
    width={200}
    htmlAttributes={{ media: "(min-width: 320px)" }}
  />
  <Imgix src={src} width={100} />
</Picture>
```

In order to reduce the duplication in props, JSX supports object spread for props:

```js
import Imgix, { Picture, Source } from 'react-imgix'

const commonProps = {
	src: 'https://...',
	imgixParams: {
		fit: 'crop',
		crop: 'faces'
	}
}

<Picture>
	<Source
		{...commonProps}
    width={400}
    htmlAttributes={{ media: "(min-width: 768px)" }}
  />
  <Source
    {...commonProps}
    width={200}
    htmlAttributes={{ media: "(min-width: 320px)" }}
  />
  <Imgix src={src} width={100} />
</Picture>
```

A warning is displayed when no fallback image is passed. This warning can be disabled in special circumstances. To disable this warning, look in the [warnings section](#warnings).

#### Attaching ref to `<img />`, etc.

A `ref` passed to react-imgix using `<Imgix ref={handleRef}>` will attach the ref to the Imgix instance, rather than the DOM element. It is possible to attach a ref to the DOM element that is rendered using `htmlAttributes`:

```js
<Imgix htmlAttributes={{ ref: handleRef }}>
```

This works for Source and Picture elements as well.

#### Background mode

This feature has been removed from react-imgix when `sizes` and `srcset` was implemented. It was decided that it was too hard to implement this feature consistently. If you would still like to use this feature, please give this issue a thumbs up: [https://github.com/imgix/react-imgix/issues/160](https://github.com/imgix/react-imgix/issues/160) If we get enough requests for this, we will re-implement it.

### Props

#### Shared Props (Imgix, Source)

These props are shared among Imgix and Source Components

##### src :: string, required

Usually in the form: `https://[your_domain].imgix.net/[image]`. Don't include any parameters.

##### imgixParams :: object

Imgix params to add to the image `src`.

_For example_:

```js
<Imgix imgixParams={{ mask: "ellipse" }} />
```

##### sizes :: string

Specified the developer's expected size of the image element when rendered on the page. Similar to width. E.g. `100vw`, `calc(50vw - 50px)`, `500px`. Highly recommended when not passing `width` or `height`. [Eric Portis' "Srcset and sizes"](https://ericportis.com/posts/2014/srcset-sizes/) article goes into depth on how to use the `sizes` attribute.

##### className :: string

`className` applied to top level component. To set `className` on the image itself see `htmlAttributes`.

##### height :: number

Force images to be a certain height.

##### width :: number

Force images to be a certain width.

##### disableSrcSet :: bool, default = false

Disable generation of variable width src sets to enable responsiveness.

##### disableLibraryParam :: bool

By default this component adds a parameter to the generated url to help imgix with analytics and support for this library. This can be disabled by setting this prop to `true`.

##### htmlAttributes :: object

Any other attributes to add to the html node (example: `alt`, `data-*`, `className`).

##### onMounted :: func

Called on `componentDidMount` with the mounted DOM node as an argument.

##### attributeConfig :: object

Allows the src, srcset, and sizes attributes to be remapped to different HTML attributes. For example:

```js
	attributeConfig={{
		src: 'data-src',
		srcSet: 'data-srcset'
		sizes: 'data-sizes'
	}}
```

This re-maps src to `data-src`, srcSet to `data-srcset`, etc.

#### Picture Props

##### className :: string

`className` applied to top level component. To set `className` on the image itself see `htmlAttributes`.

##### onMounted :: func

Called on `componentDidMount` with the mounted DOM node as an argument.

##### htmlAttributes :: object

Any other attributes to add to the html node (example: `alt`, `data-*`, `className`).

### Global Configuration

#### Warnings

This library triggers some warnings under certain situations to try aid developers in upgrading or to fail-fast. These can sometimes be incorrect due to the difficulty in detecting error situations. This is annoying, and so there is a way to turn them off. This is not recommended for beginners, but if you are using custom components or other advanced features, it is likely you will have to turn them off.

Warnings can be turned off with the public config API, `PublicConfigAPI`, which is exported at the top-level.

```js
// in init script/application startup
import { PublicConfigAPI } from "react-imgix";

PublicConfigAPI.disableWarning('<warningName>');

//... rest of app startup
React.render(...);
```

Warnings can also be enabled with `PublicConfigAPI.enableWarning('<warningName>')`

The warnings available are:

| `warningName`  | Description                                                                                                                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| fallbackImage  | Triggered when there is no `<img>` or `<Imgix>` at the end of the children when using `<Picture>`. A fallback image is crucial to ensure the image renders correctly when the browser cannot match against the sources provided |
| sizesAttribute | This library requires a `sizes` prop to be passed so that the images can render responsively. This should only turned off in very special circumstances.                                                                        |

## Upgrade Guides

### 7.x to 8.0

This is a very large update to this library with a lot of breaking changes. We apologise for any issues this may cause, and we have tried to reduce the number of breaking changes. We have also worked to batch up all these changes into one release to reduce its impacts. We do not plan on making breaking changes for a while after this, and will be focussed on adding features.

The largest change in this major version bump is the move to width-based `srcSet` and `sizes` for responsiveness. This has a host of benefits, including better server rendering, better responsiveness, less potential for bugs, and perfomance improvements. This does mean that the old fitting-to-container-size behaviour has been removed. If this is necessary, an example of how this can be achieved can be found [here](./examples/fit-to-size-of-container.md)

To upgrade to version 8, the following changes should be made.

- A `sizes` prop should be added to all usages of Imgix. If `sizes` is new to you (or even if it's not), Eric's [seminal article on `srcset` and `sizes`](https://ericportis.com/posts/2014/srcset-sizes/) is highly recommended.
- Change all usages of `type='picture'` to `<Picture>` and `type='source'` to `<Source>`

      // this...
      <Imgix type='picture'>
      	<Imgix type='source' src={src}>
      	<Imgix type='source' src={src}>
      </Imgix>

      // becomes...
      <Picture>
      	<Source src={src}>
      	<Source src={src}>
      </Picture>

  See [Picture support](#picture-support) for more information.

- Remove all usage of `type='bg'` as it is no longer supported. It was decided that it was too hard to implement this feature consistently. If you would still like to use this feature, please give this issue a thumbs up: [https://github.com/imgix/react-imgix/issues/160](https://github.com/imgix/react-imgix/issues/160) If we get enough requests for this, we will re-implement it.
- Remove props `aggressiveLoad`, `component`, `fluid`, `precision` as they are no longer used.
- Change all usages of `defaultHeight` and `defaultWidth` to `width` and `height` props.
- Rename `generateSrcSet` to `disableSrcSet` and invert the value passed down as the prop's value. i.e. `generateSrcSet={false}` becomes `disableSrcSet={true}` or simply `disableSrcSet`
- If support is needed for a [browser which does not support the new usage of srcSet](https://caniuse.com/#feat=srcset) (such as IE 11), we recommended adding a polyfill, such as the great [Picturefill](https://github.com/scottjehl/picturefill).

## Browser Support

- By default, browsers that don't support [`srcset`](http://caniuse.com/#feat=srcset), [`sizes`](http://caniuse.com/#feat=srcset), or [`picture`](http://caniuse.com/#feat=picture) will gracefully fall back to the default `img` `src` when appropriate. If you want to provide a fully-responsive experience for these browsers, react-imgix works great alongside [Picturefill](https://github.com/scottjehl/picturefill)!
- We support the latest version of Google Chrome (which [automatically updates](https://support.google.com/chrome/answer/95414) whenever it detects that a new version of the browser is available). We also support the current and previous major releases of desktop Firefox, Internet Explorer, and Safari on a rolling basis. Mobile support is tested on the most recent minor version of the current and previous major release for the default browser on iOS and Android (e.g., iOS 9.2 and 8.4). Each time a new version is released, we begin supporting that version and stop supporting the third most recent version.

This browser support is made possible by the great support from [BrowserStack](https://www.browserstack.com/).

<img src="docs/images/Browserstack-logo@2x.png" width="300">

## Meta

React-imgix was originally created by [Frederick Fogerty](http://twitter.com/fredfogerty). It's licensed under the ISC license (see the [license file](./LICENSE) for more info). Any contribution is absolutely welcome, but please review the [contribution guidelines](./CONTRIBUTING.md) before getting started.
