
v4.1.0 / 2016-11-15
==================

	* **Added:** `crop` prop to override `crop` url parameter [#57] - @rbliss

[#57]: https://github.com/imgix/react-imgix/pull/57

  * Enable passing in specific crop options, useful for fallbacks (#57)
  * Add additional tests testing crop prop overriding faces and entropy props
  * Enable passing in specific crop options, useful for specifying fallbacks to the ‘faces’ crop option
  * Add server-side rendering note to `aggressiveLoad`
  * Merge pull request #53 from imgix/fred-new-node-versions
  * lts => 6
  * Avoid blank background urls and src attributes (#51)
  * Update node versions supported
  * chore(package): update standard to version 8.2.0 (#47)
  * chore(package): update mocha to version 3.0.1 (#37)

v4.0.0 / 2016-06-07
==================

  * **Breaking:** Images with a height of 1 (i.e. 1 x image height) were being rendered as 1px high images. Oops. Now it no longer does that.  ([#27])

[#27]: https://github.com/imgix/react-imgix/pull/27

v3.0.0 / 2016-05-11
===================

  * Bump version to 3.0.0
  * Merge pull request #24 from imgix/23-aggressiveLoad-typo
  * Rename `aggresiveLoad` to `aggressiveLoad`.
  * Merge pull request #20 from imgix/url-and-base64-encoding
  * Ensure all query keys + B64 variants are encoded.
  * Make version links work in changelog
  * Add Changelog

v2.2.0 / 2016-02-23
===================

  * **Feature:** `forceLayout` api, accessed by `refs.imgix.forceLayout()` ([#15])

[#15]: https://github.com/imgix/react-imgix/pull/15


  * 2.2.0
  * Merge pull request #15 from theolampert/master
  * exposes forceLayout method to parent component

v2.1.2 / 2016-02-18
===================

  * Update to Babel 6 ([#10])
  * Change child props behaviour to only pass down props not used, not every prop ([#9])

[#10]: https://github.com/imgix/react-imgix/pull/10
[#9]: https://github.com/imgix/react-imgix/pull/9


  * Bump version to 2.1.2
  * Merge pull request #9 from imgix/better-child-props
  * Change child props behaviour to only pass down props not used, not every prop
  * Merge pull request #10 from imgix/babel-6
  * Add `transform-object-assign` Babel plugin.
  * Change test commands
  * Update code to pass new class spec
  * Add babel 6 presets
  * Update tests to babel 6
  * Upgrade deps to babel 6
  * Change urls in package.json to imgix repo
  * Add code climate badge to readme

v2.1.1 / 2015-11-18
===================

  * **Feature:** `generateSrcSet` prop to generate a `srcSet` attribute for images, only when in `img` mode. Enabled by default. See [here](https://css-tricks.com/responsive-images-youre-just-changing-resolutions-use-srcset/) for more ([#4])

[#4]: https://github.com/imgix/react-imgix/pull/4


  * 2.1.1
  * Add generateSrcSet prop to Readme
  * Bump to 2.1.0
  * Merge pull request #4 from ekosz/patch-1
  * Automatically set srcSet attributes
  * Merge pull request #3 from ekosz/patch-1
  * Document customParams in README
  * Update README.md

v2.0.0 / 2015-11-05
===================

  * **Breaking:** React 0.13 no longer supported. React 0.13 users should use `v1.x`
  * **Breaking:** Sets `background-size: cover` on the element when the `bg` prop is passed
  * `react` and `react-dom` added as peer dependencies
  * No longer imports the entire imgix.js library. Instead we just build the url ourselves.
  * **Feature:** Added `entropy` prop to support [Point of Interest Cropping](http://blog.imgix.com/2015/10/21/automatic-point-of-interest-cropping-with-imgix%202.html)



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

v1.0.4 / 2015-10-04
===================

  * 1.0.4
  * Don't mutate props (oops)
  * Update README.md

v1.0.3 / 2015-09-24
===================

  * 1.0.3
  * Fix typo in Readme, add import usage

v1.0.2 / 2015-09-23
===================

  * 1.0.2
  * Add installation instructions to README

v1.0.1 / 2015-09-23
===================

  * 1.0.1
  * Add readme
  * Remove unused resize prop

v1.0.0 / 2015-09-23
===================

  * 1.0.0
  * No tests are fine
  * Add npm_debug.log to .gitignore and .npmignore
  * Change to babel stage 0
  * Add ReactImgix component
  * Initial Commit

