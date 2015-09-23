# React Imgix

A [React](https://facebook.github.io/react/) component that renders images using the [Imgix](https://www.imgix.com/) API. It uses the smallest images possible, and does cool stuff, like [cropping to faces](https://www.imgix.com/docs/reference/size#param-crop) by default.

## Usage

```js
<Imgix
  src='https://[your_domain].imgix.net/[image]'

  aggresiveLoad={bool} // whether to wait until the component has mounted to render the image, useful for auto-sizing, defaults to false
  auto={array} // array of values to pass to Imgix's auto param, defaults to ['format']
  bg={bool} // whether to render the image as a background of the component, defaults to false
  component={string} // wrapper component to use, defaults to 'img' for inline, and 'div' when bg is true
  className={string}
  faces={bool} // whether to crop to faces, defaults to true
  fit={string} // see Imgix's API, defaults to 'crop'
  fluid={bool} // whether to fit the image requested to the size of the component rendered, defaults to true
  precision={number} // round to nearest x for image width and height, useful for caching, defaults to 100

/>
```

Author: [Frederick Fogerty](http://twitter.com/fredfogerty)

License: ISC




```