# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [9.0.3](https://github.com/imgix/react-imgix/compare/v9.0.2...v9.0.3) (2020-11-19)

### [9.0.2](https://github.com/imgix/react-imgix/compare/v9.0.1...v9.0.2) (2020-04-02)


### Bug Fixes

* **background:** fortify `hasDOMDimensions` check for null height ([#592](https://github.com/imgix/react-imgix/issues/592)) ([c7fb86e](https://github.com/imgix/react-imgix/commit/c7fb86e))

### [9.0.1](https://github.com/imgix/react-imgix/compare/v9.0.0...v9.0.1) (2019-11-22)


### Bug Fixes

* prevent overwriting htmlAttributes.ref ([#496](https://github.com/imgix/react-imgix/issues/496)) ([e15e1b2](https://github.com/imgix/react-imgix/commit/e15e1b2))

# [9.0.0](https://github.com/imgix/react-imgix/compare/v8.6.3...v9.0.0) (2019-11-01)

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

### Refactor

* refactor: use ar parameter instead of calculating aspect ratio ([#462](https://github.com/imgix/react-imgix/pull/462)) ([fbe8082](https://github.com/imgix/react-imgix/commit/fbe8082ddce2d61b31bf19bf72b4d4b492ea0751))
* refactor: replace findDOMNode with callback refs ([#476](https://github.com/imgix/react-imgix/pull/476)) ([db3a1d7](https://github.com/imgix/react-imgix/commit/db3a1d70037b485fada972fe68b885d8ac6e4fb9))

### Bug Fixes

* remove default fit parameter ([#484](https://github.com/imgix/react-imgix/issues/484)) ([fbe8082](https://github.com/imgix/react-imgix/commit/fbe8082))

### Chore

* chore(clean): remove all deprecatedProps and types ([#483](https://github.com/imgix/react-imgix/pull/483])) ([d036132](https://github.com/imgix/react-imgix/commit/d0361323e46152ff8698e8e1d3bb2a44f79342c4))

### [8.6.4](https://github.com/imgix/react-imgix/compare/v8.6.3...v8.6.4) (2019-08-08)


### Features

* perf: optimize URL handling ([#414](https://github.com/imgix/react-imgix/pull/414)) ([8d14dcb](https://github.com/imgix/react-imgix/commit/8d14dcb))
* perf: optimize `constructUrl` function ([#418](https://github.com/imgix/react-imgix/pull/418)) ([8d392a0](https://github.com/imgix/react-imgix/commit/8d392a0))
* perf: use string concatenation instead of template strings ([#420](https://github.com/imgix/react-imgix/pull/420)) ([f41cc73](https://github.com/imgix/react-imgix/commit/f41cc73))
* perf: use `Object.assign` instead of spread operator ([#423](https://github.com/imgix/react-imgix/pull/423)) ([29b25d5](https://github.com/imgix/react-imgix/commit/29b25d5))



### [8.6.3](https://github.com/imgix/react-imgix/compare/v8.6.2...v8.6.3) (2019-07-11)


### Bug Fixes

* render <Source> element as a fluid image by default ([#404](https://github.com/imgix/react-imgix/issues/404)) ([10a5434](https://github.com/imgix/react-imgix/commit/10a5434))
* width query param overrides in srcSet ([#406](https://github.com/imgix/react-imgix/issues/406)) ([5791d11](https://github.com/imgix/react-imgix/commit/5791d11))



# [8.6.2](https://github.com/imgix/react-imgix/compare/v8.6.1...v8.6.2) (2019-07-05)


### Features

* perf: optimize url construction ([#395](https://github.com/imgix/react-imgix/issues/395)) ([25c0012](https://github.com/imgix/react-imgix/commit/25c0012))



## [8.6.1](https://github.com/imgix/react-imgix/compare/v8.6.0...v8.6.1) (2019-04-17)


### Bug Fixes

* **deps:** pin react-measure version to avoid regression ([#343](https://github.com/imgix/react-imgix/issues/343)) ([3344502](https://github.com/imgix/react-imgix/commit/3344502))



# [8.6.0](https://github.com/imgix/react-imgix/compare/v8.5.1...v8.6.0) (2019-04-04)


### Bug Fixes

* ensure `fit` parameter will respect overriding value, fixes [#268](https://github.com/imgix/react-imgix/issues/268) ([#311](https://github.com/imgix/react-imgix/issues/311)) ([15b0073](https://github.com/imgix/react-imgix/commit/15b0073)), fixes [#268](https://github.com/imgix/react-imgix/issues/268)


### Features

* append variable q parameters per dpr when rendering a fixed-size image ([#322](https://github.com/imgix/react-imgix/issues/322)) ([6594cea](https://github.com/imgix/react-imgix/commit/6594cea)), resolves [#129](https://github.com/imgix/react-imgix/issues/129)



<a name="8.5.1"></a>
## [8.5.1](https://github.com/imgix/react-imgix/compare/v8.5.0...v8.5.1) (2018-12-21)



<a name="8.5.0"></a>
# [8.5.0](https://github.com/imgix/react-imgix/compare/v8.4.0...v8.5.0) (2018-12-21)


### Features

* add container to render image as background behind children [WIP] ([#236](https://github.com/imgix/react-imgix/issues/236)) ([5c3ecf6](https://github.com/imgix/react-imgix/commit/5c3ecf6)), closes [#160](https://github.com/imgix/react-imgix/issues/160)



<a name="8.4.0"></a>
# [8.4.0](https://github.com/imgix/react-imgix/compare/v8.3.1...v8.4.0) (2018-11-26)


### Features

* expose url builder api ([#225](https://github.com/imgix/react-imgix/issues/225)) ([ae9b31b](https://github.com/imgix/react-imgix/commit/ae9b31b)), closes [#131](https://github.com/imgix/react-imgix/issues/131)
* use exponential increase for srcset widths ([#224](https://github.com/imgix/react-imgix/issues/224)) ([bc5660c](https://github.com/imgix/react-imgix/commit/bc5660c))



<a name="8.3.1"></a>
## [8.3.1](https://github.com/imgix/react-imgix/compare/v8.3.0...v8.3.1) (2018-11-06)



<a name="8.3.0"></a>
# [8.3.0](https://github.com/imgix/react-imgix/compare/v8.2.0...v8.3.0) (2018-10-11)


### Features

* add aspect ratio support by calculating client-side ([#201](https://github.com/imgix/react-imgix/issues/201)) ([7ce0411](https://github.com/imgix/react-imgix/commit/7ce0411)), closes [#161](https://github.com/imgix/react-imgix/issues/161)



<a name="8.2.0"></a>
# [8.2.0](https://github.com/imgix/react-imgix/compare/v8.1.0...v8.2.0) (2018-10-01)


### Features

* make warnings able to be disabled ([#168](https://github.com/imgix/react-imgix/issues/168)) ([4ef0299](https://github.com/imgix/react-imgix/commit/4ef0299))



<a name="8.1.0"></a>
# [8.1.0](https://github.com/imgix/react-imgix/compare/v8.0.1...v8.1.0) (2018-09-13)


### Features

* add HTML attribute configuration, enabling use of third-party libraries e.g. lazysizes ([#166](https://github.com/imgix/react-imgix/issues/166)) ([8ced390](https://github.com/imgix/react-imgix/commit/8ced390))



<a name="8.0.1"></a>
## [8.0.1](https://github.com/imgix/react-imgix/compare/v8.0.0...v8.0.1) (2018-08-26)


### Bug Fixes

* update typo in warnings about old type prop ([b9fa1e5](https://github.com/imgix/react-imgix/commit/b9fa1e5))



<a name="8.0.0"></a>
# [8.0.0](https://github.com/imgix/react-imgix/compare/v7.2.0...v8.0.0) (2018-08-15)

This is a very large update to this library with a lot of breaking changes. We apologise for any issues this may cause, and we have tried to reduce the number of breaking changes. We have also worked to batch up all these changes into one release to reduce its impacts. We do not plan on making breaking changes for a while after this, and will be focussed on adding features.

The largest change in this major version bump is the move to width-based `srcSet` and `sizes` for responsiveness. This has a host of benefits, including better server rendering, better responsiveness, less potential for bugs, and perfomance improvements. This does mean that the old fitting-to-container-size behaviour has been removed. If this is necessary, an example of how this can be achieved can be found [here](./examples/fit-to-size-of-container.md)

Please see the [Upgrade Guide](https://github.com/imgix/react-imgix#7x-to-80) for more details on what to change.

### Bug Fixes

* warn the user when no <img> passed as a child to <picture> fixes [#90](https://github.com/imgix/react-imgix/issues/90) ([#151](https://github.com/imgix/react-imgix/issues/151)) ([aab9358](https://github.com/imgix/react-imgix/commit/aab9358))


### Features

* implement responsiveness with srcSet and sizes ([#159](https://github.com/imgix/react-imgix/issues/159)) ([fa68df6](https://github.com/imgix/react-imgix/commit/fa68df6)), closes [#158](https://github.com/imgix/react-imgix/issues/158)
* reduce props API surface area ([#162](https://github.com/imgix/react-imgix/issues/162)) ([9fb0cb9](https://github.com/imgix/react-imgix/commit/9fb0cb9))
* refactor picture and source behaviour into different components ([#163](https://github.com/imgix/react-imgix/issues/163)) ([64d9b8a](https://github.com/imgix/react-imgix/commit/64d9b8a))


### BREAKING CHANGES

* picture and source types have been changed to components.
* faces is no longer set by default.
* srcSet behaviour has changed to use sizes + srcSets
* type=bg has been removed
* the following props have been removed: aggressiveLoad, component, fluid, precision, defaultHeight, defaultWidth
* generateSrcSet has been changed to disableSrcSet
* A fallback image will no longer be created when using react-imgix in picture mode



<a name="7.2.0"></a>
# [7.2.0](https://github.com/imgix/react-imgix/compare/v7.1.1...v7.2.0) (2018-06-30)


### Bug Fixes

* alt text no longer cause images to render at wrong dimensions ([#146](https://github.com/imgix/react-imgix/issues/146)) ([d3183a6](https://github.com/imgix/react-imgix/commit/d3183a6)), closes [#41](https://github.com/imgix/react-imgix/issues/41)
* typo in CONTRIBUTING ([74b996e](https://github.com/imgix/react-imgix/commit/74b996e))


### Features

* add ixlib url parameter to help Imgix support and analytics ([#145](https://github.com/imgix/react-imgix/issues/145)) ([44f3d32](https://github.com/imgix/react-imgix/commit/44f3d32))



<a name="7.1.1"></a>

## [7.1.1](https://github.com/imgix/react-imgix/compare/v7.1.0...v7.1.1) (2017-12-15)

<a name="7.1.0"></a>

# [7.1.0](https://github.com/imgix/react-imgix/compare/v7.0.0...v7.1.0) (2017-12-15)

### Features

- document default height/width props ([#126](https://github.com/imgix/react-imgix/issues/126)) ([a792592](https://github.com/imgix/react-imgix/commit/a792592))

<a name="7.0.0"></a>

# [7.0.0](https://github.com/imgix/react-imgix/compare/v6.0.2...v7.0.0) (2017-11-17)

### Chores

- **deps:** update all deps, move to react 16 for testing ([#120](https://github.com/imgix/react-imgix/issues/120)) ([99f1f14](https://github.com/imgix/react-imgix/commit/99f1f14))

### BREAKING CHANGES

- **deps:** only React v16 is now actively supported

# v6.0.2 / 2017-10-26

- Add single quotes to background url. (#119) - thanks @nickhavenly

# v6.0.0 / 2017-05-05

### Breaking Changes

- **React 0.14 no longer supported.** This `react-imgix` version drops official support for React 0.14. This package will probably still work with 0.14, but we will not accept bugs or issues relating to React 0.14.
- **bg prop removed**. This prop was deprecated in the past, and has now been removed. Please upgrade all usages to: `type='bg'`.

### Important Note

Since this package now uses `prop-types`, when using a React version below 15.5, there will be duplicate propTypes. To fix this, please upgrade to 15.5, which no longer exports React.PropTypes.

### Thanks

A massive thanks for @modosc for helping with this release, and upgrading to React 15.5.

- fix React 15.5 warnings (#104) - @modosc
- pull in prop-types from a separate module, fix sinon deprecation warning (#102)
- Update travis config
- Run prettier on code
- Change prettier to 120 line length
- Use prettier rather than standard
- Add prettier
- Update deps

# v5.4.0 / 2017-04-06

- add onMounted callback with access to underlying node (#94)

# v5.3.0 / 2017-03-24

- Background Size adjustments (#89)
- fix typo - deprecated warning (#81)

# v5.2.0 / 2016-12-02

- Picture element (#60) - thanks @modosc

# v5.1.0 / 2016-11-15

- **Added:** `crop` prop to override `crop` url parameter #57 - @rbliss
- Add additional tests testing crop prop overriding faces and entropy props
- Enable passing in specific crop options, useful for specifying fallbacks to the ‘faces’ crop option
- Add server-side rendering note to `aggressiveLoad`
- Merge pull request #53 from imgix/fred-new-node-versions
- lts => 6
- Avoid blank background urls and src attributes (#51)
- Update node versions supported
- chore(package): update standard to version 8.2.0 (#47)
- chore(package): update mocha to version 3.0.1 (#37)

# v5.0.0 / 2016-07-22

- **Breaking:** Unused props on the Imgix component are no longer passed down, use imgProps instead. #34 - @theolampert

# v4.0.0 / 2016-06-07

- **Breaking:** Images with a height of 1 (i.e. 1 x image height) were being rendered as 1px high images. Oops. Now it no longer does that. ([#27])

[#27]: https://github.com/imgix/react-imgix/pull/27

# v3.0.0 / 2016-05-11

- Bump version to 3.0.0
- Merge pull request #24 from imgix/23-aggressiveLoad-typo
- Rename `aggresiveLoad` to `aggressiveLoad`.
- Merge pull request #20 from imgix/url-and-base64-encoding
- Ensure all query keys + B64 variants are encoded.
- Make version links work in changelog
- Add Changelog

# v2.2.0 / 2016-02-23

- **Feature:** `forceLayout` api, accessed by `refs.imgix.forceLayout()` ([#15])

[#15]: https://github.com/imgix/react-imgix/pull/15

- 2.2.0
- Merge pull request #15 from theolampert/master
- exposes forceLayout method to parent component

# v2.1.2 / 2016-02-18

- Update to Babel 6 ([#10])
- Change child props behaviour to only pass down props not used, not every prop ([#9])

[#10]: https://github.com/imgix/react-imgix/pull/10
[#9]: https://github.com/imgix/react-imgix/pull/9

- Bump version to 2.1.2
- Merge pull request #9 from imgix/better-child-props
- Change child props behaviour to only pass down props not used, not every prop
- Merge pull request #10 from imgix/babel-6
- Add `transform-object-assign` Babel plugin.
- Change test commands
- Update code to pass new class spec
- Add babel 6 presets
- Update tests to babel 6
- Upgrade deps to babel 6
- Change urls in package.json to imgix repo
- Add code climate badge to readme

# v2.1.1 / 2015-11-18

- **Feature:** `generateSrcSet` prop to generate a `srcSet` attribute for images, only when in `img` mode. Enabled by default. See [here](https://css-tricks.com/responsive-images-youre-just-changing-resolutions-use-srcset/) for more ([#4])

[#4]: https://github.com/imgix/react-imgix/pull/4

- 2.1.1
- Add generateSrcSet prop to Readme
- Bump to 2.1.0
- Merge pull request #4 from ekosz/patch-1
- Automatically set srcSet attributes
- Merge pull request #3 from ekosz/patch-1
- Document customParams in README
- Update README.md

# v2.0.0 / 2015-11-05

- **Breaking:** React 0.13 no longer supported. React 0.13 users should use `v1.x`
- **Breaking:** Sets `background-size: cover` on the element when the `bg` prop is passed
- `react` and `react-dom` added as peer dependencies
- No longer imports the entire imgix.js library. Instead we just build the url ourselves.
- **Feature:** Added `entropy` prop to support [Point of Interest Cropping](http://blog.imgix.com/2015/10/21/automatic-point-of-interest-cropping-with-imgix%202.html)

* 2.0.0
* Add entropy to propTypes
* And point of interest cropping as 'entropy' prop
* Merge pull request #1 from imgix/feature/remove-imgixjs
* Remove imgix.js from component
* Remove imgix.js depenency
* Use local uri builder than than imgix.js
* :art:
* Copy support.js from coursera/react-imgix, rather than importing the whole imgix.js library
* Upgrade api to React 0.14, introduces breaking change as we no longer support React 0.13
* Add react to peer dependencies
* Move from chai to mjackson/expect for tests
* Use a react version matrix for Travis
* Change other urls due to repo transfer
* Change Travis url due to transfer of repo
* Add code style badge
* Ignore npm-debug.log
* Running the tests didn't actually make it into the test commit -.-
* Don't support old versions of node
* Add badges to README
* Add .travis.yml
* Add some initial tests with mocha
* Set backgroundSize: cover on component when it's in background mode
* Add license

# v1.0.4 / 2015-10-04

- 1.0.4
- Don't mutate props (oops)
- Update README.md

# v1.0.3 / 2015-09-24

- 1.0.3
- Fix typo in Readme, add import usage

# v1.0.2 / 2015-09-23

- 1.0.2
- Add installation instructions to README

# v1.0.1 / 2015-09-23

- 1.0.1
- Add readme
- Remove unused resize prop

# v1.0.0 / 2015-09-23

- 1.0.0
- No tests are fine
- Add npm_debug.log to .gitignore and .npmignore
- Change to babel stage 0
- Add ReactImgix component
- Initial Commit
