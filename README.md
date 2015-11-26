# React Imgix

[![npm version](https://img.shields.io/npm/v/react-imgix.svg)](https://www.npmjs.com/package/react-imgix)
[![Build Status](https://travis-ci.org/imgix/react-imgix.svg?branch=master)](https://travis-ci.org/imgix/react-imgix)
[![Dependecies Status](https://david-dm.org/imgix/react-imgix.svg)](https://david-dm.org/imgix/react-imgix)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)
[![Code Climate](https://codeclimate.com/github/imgix/react-imgix/badges/gpa.svg)](https://codeclimate.com/github/imgix/react-imgix)

A [React](https://facebook.github.io/react/) component that renders images using the [Imgix](https://www.imgix.com/) API. It uses the smallest images possible, and does cool stuff, like [cropping to faces](https://www.imgix.com/docs/reference/size#param-crop) by default.

## Installation

```
npm install --save react-imgix
```

## Usage

```js
import Imgix from 'react-imgix'

<Imgix
  src={string} // required, usually in the form: 'https://[your_domain].imgix.net/[image]'. Don't include any parameters.

  aggressiveLoad={bool} // whether to wait until the component has mounted to render the image, useful for auto-sizing, defaults to false
  auto={array} // array of values to pass to Imgix's auto param, defaults to ['format']
  bg={bool} // whether to render the image as a background of the component, defaults to false
  component={string} // wrapper component to use, defaults to 'img' for inline, and 'div' when bg is true
  className={string}
  entropy={bool} // whether or not to crop using points of interest. See Imgix API for more details. Defaults to false
  faces={bool} // whether to crop to faces, defaults to true
  fit={string} // see Imgix's API, defaults to 'crop'
  fluid={bool} // whether to fit the image requested to the size of the component rendered, defaults to true
  precision={number} // round to nearest x for image width and height, useful for caching, defaults to 100
  height={number} // force images to be a certain height, overrides precision
  width={number} // force images to be a certain width, overrides precision
  generateSrcSet={bool} // generate 2x and 3x src sets when using an <img> tag. Defaults to true
  customParams={object} // any other Imgix params to add to the image src
/>
```

Author: [Frederick Fogerty](http://twitter.com/fredfogerty)

License: ISC
