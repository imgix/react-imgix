# React Imgix

[![npm version](https://img.shields.io/npm/v/react-imgix.svg)](https://www.npmjs.com/package/react-imgix)
[![Build Status](https://travis-ci.org/imgix/react-imgix.svg?branch=master)](https://travis-ci.org/imgix/react-imgix)
[![Dependecies Status](https://david-dm.org/imgix/react-imgix.svg)](https://david-dm.org/imgix/react-imgix)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)
[![Code Climate](https://codeclimate.com/github/imgix/react-imgix/badges/gpa.svg)](https://codeclimate.com/github/imgix/react-imgix)

A [React](https://facebook.github.io/react/) component that renders images using the [Imgix](https://www.imgix.com/) API. It uses the smallest images possible, and does cool stuff, like [cropping to faces](https://www.imgix.com/docs/reference/size#param-crop) by default.

## Usage

```js
import Imgix from 'react-imgix'

<Imgix src={string} />
```

### Props

#### src={string}
required, usually in the form: `https://[your_domain].imgix.net/[image]`. Don't include any parameters.

#### aggressiveLoad={bool}
whether to wait until the component has mounted to render the image, useful for auto-sizing and server-side rendering, defaults to false

#### auto={array}
array of values to pass to Imgix's auto param, defaults to `['format']`

#### type={string}
what kind of component to render, one of `img`, `bg`, `picture`, `source`. Defaults to `img`

#### bg={bool}
_DEPRECATED, use `type='bg'` instead_. whether to render the image as a background of the component, defaults to `false`.  
_To be deprecated in v6._

#### component={string}
wrapper component to use when rendering a `bg`, defaults to `div`

#### className={string}
`className` applied to top level component. To set `className` on the image itself see `imgProps`.

#### entropy={bool}
whether or not to crop using points of interest. See Imgix API for more details. Defaults to `false`

#### faces={bool}
whether to crop to faces, defaults to `true`

#### crop={string}
sets specific crop, overriding faces and entropy flags. Useful for specifying fallbacks for faces like `faces,top,right`

#### fit={string}
see Imgix's API, defaults to `crop`

#### fluid={bool}
whether to fit the image requested to the size of the component rendered, defaults to `true`

#### onMounted={func}
called on `componentDidMount` with the mounted DOM node as an argument

#### precision={number}
round to nearest x for image width and height, useful for caching, defaults to `100`

#### height={number}
force images to be a certain height, overrides `precision`

#### width={number}
force images to be a certain width, overrides `precision`

#### generateSrcSet={bool}
generate `2x` and `3x` src sets when using an `<img>` tag. Defaults to `true`

#### customParams={object}
any other Imgix params to add to the image `src`

_For example_:
```js
<Imgix
    customParams={{mask: 'ellipse'}}
/>
 ```

#### imgProps={object}
any other attributes to add to the html node (example: `alt`, `data-*`, `className`)

_Note_: if you use type='bg' the css property background-size is set to 'cover' by default. To override this behaviour you can change the background size by overriding it with a string such as `'contain'`, or to `null` for controlling the style with CSS.

```js
<Imgix
    src={src}
    type='bg'
    imgProps={{style: {backgroundSize: 'contain'}}}
/>
 ```

### Picture Support

Using the [<picture> element](https://docs.imgix.com/tutorials/using-imgix-picture-element) you can create responsive images:
```js
<Imgix src={src} type='picture'>
  <Imgix src={src} width={400} type='source' imgProps={{media: '(min-width: 768px)'}}/>
  <Imgix src={src} width={200} type='source' imgProps={{media: '(min-width: 320px)'}}/>
  <Imgix src={src} width={100} type='img' />
</Imgix>
```
The final `type='img'` component will be created with the options passed into the parent `<picture>` container if it's not provided so the above is equivelant to:
```js
<Imgix src={src} width={100} type='picture'>
  <Imgix src={src} width={400} type='source' imgProps={{media: '(min-width: 768px)'}}/>
  <Imgix src={src} width={200} type='source' imgProps={{media: '(min-width: 320px)'}}/>
</Imgix>
```

## Installation

With npm:
```
npm install --save react-imgix
```

With [yarn](https://yarnpkg.com):
```
yarn add react-imgix
```


Author: [Frederick Fogerty](http://twitter.com/fredfogerty)

License: ISC
