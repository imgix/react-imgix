## [HEAD]
> Unreleased

- Nothing yet :)

[HEAD]: https://github.com/imgix/react-imgix/compare/v2.2.0...HEAD]


## [v2.2.0]
> Feb 23, 2016

- **Feature:** `forceLayout` api, accessed by `refs.imgix.forceLayout()` ([#15])

[v2.2.0]: https://github.com/imgix/react-imgix/compare/v2.1.2...v2.2.0]
[#15]: https://github.com/imgix/react-imgix/pull/15

## [v2.1.2]
> Feb 18, 2016

* Update to Babel 6 ([#10])
* Change child props behaviour to only pass down props not used, not every prop ([#9])

[v2.1.2]: https://github.com/imgix/react-imgix/compare/v2.1.0...v2.1.2]
[#10]: https://github.com/imgix/react-imgix/pull/10
[#9]: https://github.com/imgix/react-imgix/pull/9

## [v2.1.0]
> Nov 18, 2015

- **Feature:** `generateSrcSet` prop to generate a `srcSet` attribute for images, only when in `img` mode. Enabled by default. See [here](https://css-tricks.com/responsive-images-youre-just-changing-resolutions-use-srcset/) for more ([#4])

[v2.1.0]: https://github.com/imgix/react-imgix/compare/v2.0.0...v2.1.0]
[#4]: https://github.com/imgix/react-imgix/pull/4


## [v2.0.0]
> Nov 5, 2015

- **Breaking:** React 0.13 no longer supported. React 0.13 users should use `v1.x`
- **Breaking:** Sets `background-size: cover` on the element when the `bg` prop is passed
- `react` and `react-dom` added as peer dependencies
- No longer imports the entire imgix.js library. Instead we just build the url ourselves.
- **Feature:** Added `entropy` prop to support [Point of Interest Cropping](http://blog.imgix.com/2015/10/21/automatic-point-of-interest-cropping-with-imgix%202.html)

[v2.0.0]: https://github.com/imgix/react-imgix/compare/v1.0.0...v2.0.0]


## Pre 2.0