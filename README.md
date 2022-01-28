<!-- ix-docs-ignore -->

![imgix logo](https://assets.imgix.net/sdk-imgix-logo.svg)

`react-imgix` provides custom components for integrating [imgix](https://www.imgix.com/) into React sites and generating images server-side.

[![npm version](https://img.shields.io/npm/v/react-imgix.svg)](https://www.npmjs.com/package/react-imgix)
[![Build Status](https://travis-ci.com/imgix/react-imgix.svg?branch=main)](https://travis-ci.com/imgix/react-imgix)
[![Downloads](https://img.shields.io/npm/dm/react-imgix.svg)](https://www.npmjs.com/package/react-imgix)
[![License](https://img.shields.io/npm/l/react-imgix)](https://github.com/imgix/react-imgix/blob/main/LICENSE)
[![Dependencies Status](https://david-dm.org/imgix/react-imgix.svg)](https://david-dm.org/imgix/react-imgix)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![All Contributors](https://img.shields.io/badge/all_contributors-22-orange.svg?style=flat-square)](#contributors-)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fimgix%2Freact-imgix.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fimgix%2Freact-imgix?ref=badge_shield)

---

<!-- /ix-docs-ignore -->

<!-- NB: Run `npx markdown-toc README.md --maxdepth 4 | sed -e 's/[[:space:]]\{2\}/    /g'` to generate TOC, and copy the result from the terminal to replace the TOC below :) -->

<!-- prettier-ignore-start -->

<!-- toc -->

- [Overview / Resources](#overview--resources)
- [Installation](#installation)
- [Usage](#usage)
    * [Examples](#examples)
        + [Basic Use Case](#basic-use-case)
        + [Server-Side Rendering](#server-side-rendering)
        + [Flexible Image Rendering](#flexible-image-rendering)
        + [Fixed Image Rendering (i.e. non-flexible)](#fixed-image-rendering-ie-non-flexible)
        + [Background Mode](#background-mode)
        + [Picture Support](#picture-support)
        + [ImgixProvider Component](#imgixprovider-component)
    * [Advanced Examples](#advanced-examples)
        + [General Advanced Usage](#general-advanced-usage)
        + [Passing Custom HTML Attributes](#passing-custom-html-attributes)
        + [Lazy Loading](#lazy-loading)
        + [Low Quality Image Placeholder Technique (LQIP)](#low-quality-image-placeholder-technique-lqip)
        + [Attaching Ref to DOM Elements](#attaching-ref-to-dom-elements)
    * [Props](#props)
        + [Shared Props (Imgix, Source)](#shared-props-imgix-source)
        + [Picture Props](#picture-props)
        + [Background Props](#background-props)
    * [Global Configuration](#global-configuration)
        + [Warnings](#warnings)
- [Upgrade Guides](#upgrade-guides)
    * [8.x to 9.0](#8x-to-90)
    * [7.x to 8.0](#7x-to-80)
- [Browser Support](#browser-support)
- [Contributors](#contributors)
- [Meta](#meta)

<!-- tocstop -->

<!-- prettier-ignore-end -->

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
import Imgix from "react-imgix";

// in react component
<Imgix src={string} />;
```

### Examples

#### Basic Use Case

For simply using as you would use an `<img>`, react-imgix can be used as follows:

```js
import Imgix from "react-imgix";

<Imgix src="https://assets.imgix.net/examples/pione.jpg" sizes="100vw" />;
```

[![Edit xp0348lv0z](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/charming-keller-kjnsq)

**Please note:** `100vw` is an appropriate `sizes` value for a full-bleed image. If your image is not full-bleed, you should use a different value for `sizes`. [Eric Portis' "Srcset and sizes"](https://ericportis.com/posts/2014/srcset-sizes/) article goes into depth on how to use the `sizes` attribute.

This will generate HTML similar to the following:

```html
<img
  src="https://assets.imgix.net/examples/pione.jpg?auto=format&amp;crop=faces&amp;ixlib=react-7.2.0"
  sizes="100vw"
  srcset="
    https://assets.imgix.net/examples/pione.jpg?auto=format&amp;crop=faces&amp;ixlib=react-7.2.0&amp;w=100 100w,
    https://assets.imgix.net/examples/pione.jpg?auto=format&amp;crop=faces&amp;ixlib=react-7.2.0&amp;w=200 200w,
    ...
  "
/>
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

[![Edit xp0348lv0z](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/charming-keller-kjnsq)

#### Server-Side Rendering

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

#### Flexible Image Rendering

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

`./app.js`

```js
import "./styles.css";

<div className="App">
  <Imgix
    src="https://assets.imgix.net/examples/pione.jpg"
    sizes="calc(10% - 10px)"
  />
</div>;
```

[![Edit cold-wave-4qfhe](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/cold-wave-4qfhe?fontsize=14&hidenavigation=1)

**Aspect Ratio:** A developer can pass a desired aspect ratio, which will be used when
generating srcsets to resize and crop your image as specified. For the `ar` parameter to take effect, ensure that the `fit` parameter is set to `crop`.

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

#### Fixed Image Rendering (i.e. non-flexible)

If the fluid, dynamic nature explained above is not desired, the width and height can be set explicitly.

```js
import Imgix from "react-imgix";

<Imgix
  src="https://assets.imgix.net/examples/pione.jpg"
  width={100} // This sets what resolution the component should load from the CDN and the size of the resulting image
  height={200}
/>;
```

Fixed image rendering will automatically append a variable `q` parameter mapped to each `dpr` parameter when generating a srcset. This technique is commonly used to compensate for the increased filesize of high-DPR images. Since high-DPR images are displayed at a higher pixel density on devices, image quality can be lowered to reduce overall filesize without sacrificing perceived visual quality. For more information and examples of this technique in action, see [this blog post](https://blog.imgix.com/2016/03/30/dpr-quality).
This behavior will respect any overriding `q` value passed in via `imgixParams` and can be disabled altogether with the boolean property `disableQualityByDPR`.

```js
<Imgix
  src="https://domain.imgix.net/image.jpg"
  width={100}
  disableQualityByDPR
/>
```

will generate the following srcset:

```html
https://domain.imgix.net/image.jpg?q=75&w=100&dpr=1 1x,
https://domain.imgix.net/image.jpg?q=50&w=100&dpr=2 2x,
https://domain.imgix.net/image.jpg?q=35&w=100&dpr=3 3x,
https://domain.imgix.net/image.jpg?q=23&w=100&dpr=4 4x,
https://domain.imgix.net/image.jpg?q=20&w=100&dpr=5 5x
```

[![Edit 4z1rzq04q7](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/adoring-monad-dbxht)

#### Background Mode

Images can be rendered as a background behind children by using `<Background />`. The component will measure the natural size of the container as determined by the CSS on the page, and will render an optimal image for those dimensions.

Example:

```jsx
// In CSS
.blog-title {
  width: 100vw;
  height: calc(100vw - 100px);
}

// In Component (React)
import { Background } from 'react-imgix'

<Background src="https://.../image.png" className="blog-title">
  <h2>Blog Title</h2>
</Background>
```

This component shares a lot of props that are used in the main component, such as `imgixParams`, and `htmlAttributes`.

As the component has to measure the element in the DOM, it will mount it first and then re-render with an image as the background image. Thus, this technique doesn't work very well with server rendering. If you'd like for this to work well with server rendering, you'll have to set a width and height manually.

**Set width and height:**

Setting the width and/or height explicitly is recommended if you already know these beforehand. This will save the component from having to do two render passes, and it will render a background image immediately.

This is accomplished by passing `w` and `h` as props to imgixParams.

```jsx
<Background
  src="https://.../image.png"
  imgixParams={{ w: 1920, h: 500 }}
  className="blog-title"
>
  <h2>Blog Title</h2>
</Background>
```

#### Picture Support

Using the [picture element](https://docs.imgix.com/tutorials/using-imgix-picture-element) you can create responsive images:

```js
import Imgix, { Picture, Source } from "react-imgix";

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
  <Imgix src={src} imgixParams={{ w: 100 }} />
</Picture>;
```

In order to reduce the duplication in props, JSX supports object spread for props:

```js
import Imgix, { Picture, Source } from "react-imgix";

const commonProps = {
  src: "https://...",
  imgixParams: {
    fit: "crop",
    crop: "faces",
  },
};

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

#### ImgixProvider Component

The `<ImgixProvider>` Higher Order Component (HOC), makes its [props](#props) available to any nested `<Imgix>` component in your React application.

For example, by rendering `<ImgixProvider>` at the top level of your application with `imgixParams` defined, all your `<Imgix>` components will have access to the same `imgixParams`.

```jsx
import React from "react";
import Imgix, { ImgixProvider } from "react-imgix";
import HomePage from "./components/HomePage";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <ImgixProvider imgixParams={{ ar: "16:9", fit: "crop" }}>
          <div className="intro-blurb">{/* ... */}</div>
          <div className="gallery">
            <Imgix src="https://assets.imgix.net/examples/pione.jpg" />
            <Imgix src="https://sdk-test.imgix.net/ساندویچ.jpg" />
          </div>
        </ImgixProvider>
      </header>
    </div>
  );
}

export default App;
```

So that the generated HTML looks something like

```html
<div class="gallery">
  <img
    src="https://assets.imgix.net/examples/pione.jpg?auto=format&ar=16%3A9&fit=crop"
    ...
  />
  <img
    src="https://sdk-test.imgix.net/%D8%B3%D8%A7%D9%86%D8%AF%D9%88%DB%8C%DA%86.jpg?auto=format&ar=16%3A9&fit=crop"
    ...
  />
</div>
```

You can take advantage of this behavior to use partial URLs with the `<Imgix>` component. By defining the [`domain`](#domain--string-optional) prop on the Provider, it can be made accessible to all nested `<Imgix>` components.

```jsx
// inside App.jsx
{
  /*... */
}
<ImgixProvider domain="assets.imgix.net">
  <div className="intro-blurb">{/* ... */}s</div>
  <div className="gallery">
    <Imgix src="/examples/pione.jpg" />
    <Imgix src="Office Background 1.png" />
  </div>
</ImgixProvider>;
{
  /*... */
}
```

Both the `<Imgix>` components above will access to the `domain` prop from the provider and have their relative `src` paths resolve to the same domain. So that the generated HTML looks something like:

```html
<div class="gallery">
  <img src="https://assets.imgix.net/examples/pione.jpg" ... />
  <img
    src="https://assets.imgix.net/Office%20Background%201.png?auto=format"
    ...
  />
</div>
```

The props that `<ImgixProvider>` makes accessible can also be overridden by `<Imgix>` components. Any prop defined on the `<Imgix>` component will override the value set by the Provider.

```jsx
// inside App.jsx
{
  /*... */
}
<ImgixProvider imgixParams={{ ar: "16:9", fit: "crop" }}>
  <div className="intro-blurb">{/* ... */}s</div>
  <div className="gallery">
    <Imgix
      imgixParams={{ ar: "4:2" }}
      src="https://assets.imgix.net/examples/pione.jpg"
    />
    <Imgix src="https://sdk-test.imgix.net/ساندویچ.jpg" />
  </div>
</ImgixProvider>;
{
  /*... */
}
```

So that the generated HTML looks something like this

```html
<div class="gallery">
  <img
    src="https://assets.imgix.net/examples/pione.jpg?auto=format&ar=4%3A2&fit=crop"
    ...
  />
  <img
    src="https://sdk-test.imgix.net/%D8%B3%D8%A7%D9%86%D8%AF%D9%88%DB%8C%DA%86.jpg?ar=16%3A9&fit=crop"
    ...
  />
</div>
```

To remove a shared prop from an `<Imgix>` component, the same prop can be set to `undefined` on the component itself.

```jsx
// inside App.jsx
{
  /*... */
}
<ImgixProvider height={500}>
  <div className="intro-blurb">{/* ... */}s</div>
  <div className="gallery">
    <Imgix src="https://assets.imgix.net/examples/pione.jpg" />
    <Imgix height={undefined} src="https://sdk-test.imgix.net/ساندویچ.jpg" />
  </div>
</ImgixProvider>;
{
  /*... */
}
```

So that the generated HTML looks something like this:

```html
<div class="gallery">
  <img src="https://assets.imgix.net/examples/pione.jpg?h=500" ... />
  <img
    src="https://sdk-test.imgix.net/%D8%B3%D8%A7%D9%86%D8%AF%D9%88%DB%8C%DA%86.jpg"
    ...
  />
</div>
```

You can nest `ImgixProvider` components to ensure that different consumers have different props.

For example to give `Imgix` components different props from `Picture` components, you can nest an `ImgixProvider` inside of another one.

The nested Provider will change the Context for the `Picture` component, essentially removing their access to the shared props provided by the root `ImgixProvider`.

```jsx
import React from 'react'
import Imgix, { ImgixProvider, Picture, Source } from "react-imgix";
export default function simpleImage() {
  return (
    <div className="imgix-simple-api-example">
      {/* there props will be accessible to all the imgix components */}
      <ImgixProvider
        domain="assets.imgix.net"
        src="/examples/pione.jpg"
        imgixParams={{ fit: "crop" }}
      >
        <Imgix width={200} height={500} src="/examples/pione.jpg" />
        <Imgix domain="sdk-test.imgix.net" src="/ساندویچ.jpg" />
        <ImgixProvider
          {/* since we define a new provider here, the context is redefined for any child components */}
        >
          <Picture>
            {/* imgixParams prop is no longer defined here */}
            <Source
              width={100}
              htmlAttributes={{ media: "(min-width: 768px)" }}
            />
            <Source
              width={200}
              htmlAttributes={{ media: "(min-width: 800px)" }}
            />
            <Imgix src="/examples/pione.jpg" />
          </Picture>
        </ImgixProvider>
      </ImgixProvider>
    </div>
  )
}
```

### Advanced Examples

#### General Advanced Usage

Although imgix is open to feature suggestions, we might not accept the feature if it is a very specific use case. The features below are examples of what we consider general advanced use cases. Our target here is to support 95% of all the usages of normal `img`, `picture`, and `source` elements.

If your desired feature falls outside this percentage, do not worry! You will probably still be able to achieve your feature with react-imgix's more powerful API: `buildURL`.

This library exposes a pure function, `buildURL`, for generating full imgix URLs given a base URL and some parameters.

```jsx
import { buildURL } from "react-imgix";

buildURL("http://yourdomain.imgix.net/image.png", { w: 450, h: 100 }); // => http://yourdomain.imgix.net/image.png?auto=format&w=450&h=100&ixlib=react-x.x.x
```

The base URL may also contain query parameters. These will be overridden by any parameters passed in with the second parameter.

This feature can be used to create your own custom `img` elements, or for use with other image components, such as [React-bootstrap's Image component](https://react-bootstrap.github.io/components/images/).

The `ixlib` parameter may be disabled by: `buildURL(<url>, <params>, { disableLibraryParam: true })`

#### Passing Custom HTML Attributes

This library allows the developer to pass any attribute they like to the underlying DOM element with `htmlAttributes`.

For example, if the the developer would like to attach a custom `onLoad` callback to an `img` component:

```jsx
<Imgix
  src="..."
  sizes="..."
  htmlAttributes={{
    onLoad: () => handleImgOnLoad,
  }}
/>
```

#### Lazy Loading

If you'd like to lazy load images, we recommend using [lazysizes](https://github.com/aFarkas/lazysizes). In order to use react-imgix with lazysizes, you can simply tell it to generate lazysizes-compatible attributes instead of the standard `src`, `srcset`, and `sizes` by changing some configuration settings:

```jsx
<Imgix
  className="lazyload"
  src="..."
  sizes="..."
  attributeConfig={{
    src: "data-src",
    srcSet: "data-srcset",
    sizes: "data-sizes",
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
    src: "data-src",
    srcSet: "data-srcset",
    sizes: "data-sizes",
  }}
  htmlAttributes={{
    src: "...", // low quality image here
  }}
/>
```

**NB:** If the props of the image are changed after the first load, the low quality image will replace the high quality image. In this case, the `src` attribute may have to be set by modifying the DOM directly, or the lazysizes API may have to be called manually after the props are changed. In any case, this behaviour is not supported by the library maintainers, so use at your own risk.

#### Attaching Ref to DOM Elements

A `ref` passed to react-imgix using `<Imgix ref={handleRef}>` will attach the ref to the Imgix instance, rather than the DOM element. It is possible to attach a ref to the DOM element that is rendered using `htmlAttributes`:

```js
<Imgix htmlAttributes={{ ref: handleRef }}>
```

This works for Source and Picture elements as well.

### Props

#### Shared Props (Imgix, Source)

These props are shared among Imgix and Source Components

##### src :: string, required

Usually in the form: `https://[your_domain].imgix.net/[image]`. Don't include any parameters.

##### domain :: string, optional

Required only when using partial paths as `src` prop for a component. IE, if `src` is `"/images/myImage.jpg"`, then the `domain` prop needs to be defined.

_For example_:

```jsx
<Imgix domain="assets.imgix.net" src="/examples/pione.jpg">
```

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
    srcSet: 'data-srcset',
    sizes: 'data-sizes'
  }}
```

This re-maps src to `data-src`, srcSet to `data-srcset`, etc.

##### disableQualityByDPR :: bool, default = false

Disable generation of variable `q` parameters when rendering a fixed-size image.

##### srcSetOptions :: object

Allows customizing the behavior of the srcset generation. Valid options are `widths`, `widthTolerance`, `minWidth`, `maxWidth`, and `devicePixelRatios`. See [@imgix/js-core](https://github.com/imgix/js-core#imgixclientbuildsrcsetpath-params-options) for documentation of these options.

#### Picture Props

##### className :: string

`className` applied to top level component. To set `className` on the image itself see `htmlAttributes`.

##### onMounted :: func

Called on `componentDidMount` with the mounted DOM node as an argument.

##### htmlAttributes :: object

Any other attributes to add to the html node (example: `alt`, `data-*`, `className`).

#### Background Props

##### src :: string, required

Usually in the form: `https://[your_domain].imgix.net/[image]`. Don't include any parameters.

##### imgixParams :: object

Imgix params to add to the image `src`. This is also how width and height can be explicitly set. For more information about this, see the "Background" section above.

_For example_:

```js
<Background imgixParams={{ mask: "ellipse" }} />
```

##### className :: string

`className` applied to top level component. To set `className` on the image itself see `htmlAttributes`.

##### disableLibraryParam :: bool

By default this component adds a parameter to the generated url to help imgix with analytics and support for this library. This can be disabled by setting this prop to `true`.

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

### 8.x to 9.0

This release brings the react-imgix API more in-line with that of imgix's rendering service.

The largest change users will notice is that this project's component will no longer generate a default `fit=crop` parameter. The original intention behind this was that generated images would maintain aspect ratio when at least one of the dimensions were specified. However, the default imgix API behavior [sets `fit=clip`](https://docs.imgix.com/apis/url/size/fit#clip), which is now reflected in this project.
Although this may not cause breaking changes for all users, it can result in unusual rendered image behavior in some cases. As such, we would rather err on the side of caution and provide users the ability to opt in to these changes via a major release.

If you are currently relying on the default generation of `fit=crop` when rendering images, you will now have to manually specify it when invoking the component:

```jsx
<Imgix
  src="https://assets.imgix.net/examples/pione.jpg"
  sizes="100vw"
  imgixParams={{ fit: "crop" }}
/>
```

The other major change relates to how the component determines an image's aspect ratio. Instead of appending a calculated height `h=` value based on specified dimensions, the URL string will now be built using the [imgix aspect ratio parameter](https://blog.imgix.com/2019/07/17/aspect-ratio-parameter-makes-cropping-even-easier) `ar=`. Luckily, the interface for specifying an aspect ratio is no different from before. However, users will have to pass in the `fit=crop` parameter in order for it to take effect:

```jsx
<Imgix
  src="http://assets.imgix.net/examples/pione.jpg"
  width={400}
  imgixParams={{ ar: "2:1", fit: "crop" }}
/>
```

### 7.x to 8.0

This is a very large update to this library with a lot of breaking changes. We apologise for any issues this may cause, and we have tried to reduce the number of breaking changes. We have also worked to batch up all these changes into one release to reduce its impacts. We do not plan on making breaking changes for a while after this, and will be focussed on adding features.

The largest change in this major version bump is the move to width-based `srcSet` and `sizes` for responsiveness. This has a host of benefits, including better server rendering, better responsiveness, less potential for bugs, and performance improvements. This does mean that the old fitting-to-container-size behaviour has been removed. If this is necessary, an example of how this can be achieved can be found [here](./examples/fit-to-size-of-container.md)

To upgrade to version 8, the following changes should be made.

- A `sizes` prop should be added to all usages of Imgix. If `sizes` is new to you (or even if it's not), Eric's [seminal article on `srcset` and `sizes`](https://ericportis.com/posts/2014/srcset-sizes/) is highly recommended.
- Change all usages of `type='picture'` to `<Picture>` and `type='source'` to `<Source>`

    <!-- prettier-ignore-start -->
    ```jsx
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
    ```

    See [Picture support](#picture-support) for more information.
    <!-- prettier-ignore-end -->

- Remove all usage of `type='bg'` as it is no longer supported. It was decided that it was too hard to implement this feature consistently. If you would still like to use this feature, please give this issue a thumbs up: [https://github.com/imgix/react-imgix/issues/160](https://github.com/imgix/react-imgix/issues/160) If we get enough requests for this, we will re-implement it.
- Remove props `aggressiveLoad`, `component`, `fluid`, `precision` as they are no longer used.
- Change all usages of `defaultHeight` and `defaultWidth` to `width` and `height` props.
- Rename `generateSrcSet` to `disableSrcSet` and invert the value passed down as the prop's value. i.e. `generateSrcSet={false}` becomes `disableSrcSet={true}` or simply `disableSrcSet`
- If support is needed for a [browser which does not support the new usage of srcSet](https://caniuse.com/#feat=srcset) (such as IE 11), we recommended adding a polyfill, such as the great [Picturefill](https://github.com/scottjehl/picturefill).

## Browser Support

- By default, browsers that don't support [`srcset`](http://caniuse.com/#feat=srcset), [`sizes`](http://caniuse.com/#feat=srcset), or [`picture`](http://caniuse.com/#feat=picture) will gracefully fall back to the default `img` `src` when appropriate. If you want to provide a fully-responsive experience for these browsers, react-imgix works great alongside [Picturefill](https://github.com/scottjehl/picturefill)!
- We support the latest version of Google Chrome (which [automatically updates](https://support.google.com/chrome/answer/95414) whenever it detects that a new version of the browser is available). We also support the current and previous major releases of desktop Firefox, Internet Explorer, and Safari on a rolling basis. Mobile support is tested on the most recent minor version of the current and previous major release for the default browser on iOS and Android (e.g., iOS 9.2 and 8.4). Each time a new version is released, we begin supporting that version and stop supporting the third most recent version.

This browser support is made possible by the great support from [BrowserStack](https://www.browserstack.com/).

<img src="https://raw.githubusercontent.com/imgix/react-imgix/main/docs/images/Browserstack-logo%402x.png" width="300">

## Contributors

<!-- ix-docs-ignore -->

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/frederickfogerty"><img src="https://avatars0.githubusercontent.com/u/615334?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Frederick Fogerty</b></sub></a><br /><a href="https://github.com/imgix/react-imgix/commits?author=frederickfogerty" title="Code">💻</a> <a href="https://github.com/imgix/react-imgix/commits?author=frederickfogerty" title="Documentation">📖</a> <a href="#maintenance-frederickfogerty" title="Maintenance">🚧</a> <a href="#question-frederickfogerty" title="Answering Questions">💬</a></td>
    <td align="center"><a href="https://github.com/sherwinski"><img src="https://avatars3.githubusercontent.com/u/15919091?v=4?s=100" width="100px;" alt=""/><br /><sub><b>sherwinski</b></sub></a><br /><a href="https://github.com/imgix/react-imgix/commits?author=sherwinski" title="Code">💻</a> <a href="https://github.com/imgix/react-imgix/commits?author=sherwinski" title="Documentation">📖</a> <a href="#maintenance-sherwinski" title="Maintenance">🚧</a> <a href="#question-sherwinski" title="Answering Questions">💬</a></td>
    <td align="center"><a href="http://jayeb.com"><img src="https://avatars2.githubusercontent.com/u/609840?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jason Eberle</b></sub></a><br /><a href="https://github.com/imgix/react-imgix/commits?author=jayeb" title="Code">💻</a> <a href="https://github.com/imgix/react-imgix/commits?author=jayeb" title="Documentation">📖</a> <a href="#maintenance-jayeb" title="Maintenance">🚧</a> <a href="#question-jayeb" title="Answering Questions">💬</a></td>
    <td align="center"><a href="https://paulstraw.com"><img src="https://avatars2.githubusercontent.com/u/117288?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Paul Straw</b></sub></a><br /><a href="#maintenance-paulstraw" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://kellysutton.com"><img src="https://avatars3.githubusercontent.com/u/47004?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kelly Sutton</b></sub></a><br /><a href="#maintenance-kellysutton" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://github.com/rbliss"><img src="https://avatars2.githubusercontent.com/u/108509?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Richard Bliss</b></sub></a><br /><a href="https://github.com/imgix/react-imgix/commits?author=rbliss" title="Code">💻</a> <a href="https://github.com/imgix/react-imgix/commits?author=rbliss" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/ekosz"><img src="https://avatars1.githubusercontent.com/u/212829?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Eric Koslow</b></sub></a><br /><a href="https://github.com/imgix/react-imgix/commits?author=ekosz" title="Code">💻</a> <a href="https://github.com/imgix/react-imgix/commits?author=ekosz" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/baldurh"><img src="https://avatars1.githubusercontent.com/u/1823617?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Baldur Helgason</b></sub></a><br /><a href="https://github.com/imgix/react-imgix/commits?author=baldurh" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/modosc"><img src="https://avatars3.githubusercontent.com/u/2231664?v=4?s=100" width="100px;" alt=""/><br /><sub><b>jonathan schatz</b></sub></a><br /><a href="https://github.com/imgix/react-imgix/commits?author=modosc" title="Code">💻</a></td>
    <td align="center"><a href="http://theo.sh"><img src="https://avatars3.githubusercontent.com/u/4714866?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Theo</b></sub></a><br /><a href="https://github.com/imgix/react-imgix/commits?author=theolampert" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/tstirrat15"><img src="https://avatars0.githubusercontent.com/u/2581423?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Tanner Stirrat</b></sub></a><br /><a href="https://github.com/imgix/react-imgix/commits?author=tstirrat15" title="Code">💻</a> <a href="https://github.com/imgix/react-imgix/issues?q=author%3Atstirrat15" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/nickhavenly"><img src="https://avatars0.githubusercontent.com/u/25750763?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nicholas Suski</b></sub></a><br /><a href="https://github.com/imgix/react-imgix/commits?author=nickhavenly" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/minfawang"><img src="https://avatars1.githubusercontent.com/u/8814693?v=4?s=100" width="100px;" alt=""/><br /><sub><b>voiceup</b></sub></a><br /><a href="https://github.com/imgix/react-imgix/commits?author=minfawang" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/kochis"><img src="https://avatars3.githubusercontent.com/u/814934?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Craig Kochis</b></sub></a><br /><a href="https://github.com/imgix/react-imgix/commits?author=kochis" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/dennisschaaf"><img src="https://avatars1.githubusercontent.com/u/116382?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Dennis Schaaf</b></sub></a><br /><a href="https://github.com/imgix/react-imgix/commits?author=dennisschaaf" title="Code">💻</a></td>
    <td align="center"><a href="http://adkent.com"><img src="https://avatars3.githubusercontent.com/u/614?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Andy Kent</b></sub></a><br /><a href="https://github.com/imgix/react-imgix/commits?author=andykent" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/GLosch"><img src="https://avatars2.githubusercontent.com/u/5502159?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Gabby Losch</b></sub></a><br /><a href="https://github.com/imgix/react-imgix/commits?author=GLosch" title="Code">💻</a></td>
    <td align="center"><a href="https://stephencookdev.co.uk/"><img src="https://avatars1.githubusercontent.com/u/8496655?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Stephen Cook</b></sub></a><br /><a href="https://github.com/imgix/react-imgix/commits?author=stephencookdev" title="Code">💻</a> <a href="https://github.com/imgix/react-imgix/issues?q=author%3Astephencookdev" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/enagorny"><img src="https://avatars0.githubusercontent.com/u/1202150?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Eugene Nagorny</b></sub></a><br /><a href="https://github.com/imgix/react-imgix/commits?author=enagorny" title="Documentation">📖</a></td>
    <td align="center"><a href="http://samuelgil.es"><img src="https://avatars1.githubusercontent.com/u/2643026?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Samuel Giles</b></sub></a><br /><a href="https://github.com/imgix/react-imgix/commits?author=samuelgiles" title="Documentation">📖</a></td>
    <td align="center"><a href="https://espen.codes/"><img src="https://avatars2.githubusercontent.com/u/48200?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Espen Hovlandsdal</b></sub></a><br /><a href="https://github.com/imgix/react-imgix/commits?author=rexxars" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://danielfarrell.com/"><img src="https://avatars2.githubusercontent.com/u/13850?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Daniel Farrell</b></sub></a><br /><a href="https://github.com/imgix/react-imgix/commits?author=danielfarrell" title="Documentation">📖</a></td>
    <td align="center"><a href="http://cieslak.dev"><img src="https://avatars0.githubusercontent.com/u/14146176?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Luiz Fernando da Silva Cieslak</b></sub></a><br /><a href="https://github.com/imgix/react-imgix/commits?author=luizcieslak" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/worldsoup"><img src="https://avatars2.githubusercontent.com/u/1475986?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nick Gottlieb</b></sub></a><br /><a href="https://github.com/imgix/react-imgix/commits?author=worldsoup" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/pgrimaud"><img src="https://avatars1.githubusercontent.com/u/1866496?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Pierre Grimaud</b></sub></a><br /><a href="https://github.com/imgix/react-imgix/commits?author=pgrimaud" title="Documentation">📖</a></td>
    <td align="center"><a href="http://www.luisball.com"><img src="https://avatars.githubusercontent.com/u/16711614?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Luis H. Ball Jr.</b></sub></a><br /><a href="https://github.com/imgix/react-imgix/commits?author=luqven" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
<!-- /ix-docs-ignore -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome, but please review the [contribution guidelines](./CONTRIBUTING.md) before getting started!

## Meta

React-imgix was originally created by [Frederick Fogerty](http://twitter.com/fredfogerty). It's licensed under the ISC license (see the [license file](./LICENSE) for more info).

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fimgix%2Freact-imgix.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fimgix%2Freact-imgix?ref=badge_large)
