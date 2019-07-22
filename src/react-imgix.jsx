import "./array-findindex";

import ReactDOM from "react-dom";
import React, { Component } from "react";
import PropTypes from "prop-types";

import targetWidths from "./targetWidths";
import constructUrl from "./constructUrl";
import extractQueryParams from "./extractQueryParams";
import { deprecatePropsHOC, ShouldComponentUpdateHOC } from "./HOCs";

import { warning, shallowEqual, compose, config } from "./common";
import { DPR_QUALITY_VALUES } from "./constants";

const PACKAGE_VERSION = require("../package.json").version;
const NODE_ENV = process.env.NODE_ENV;

const buildKey = idx => `react-imgix-${idx}`;

const validTypes = ["img", "picture", "source"];

const defaultImgixParams = {
  auto: ["format"],
  fit: "crop"
};

const defaultAttributeMap = {
  src: "src",
  srcSet: "srcSet",
  sizes: "sizes"
};

const noop = () => {};

const COMMON_PROP_TYPES = {
  className: PropTypes.string,
  onMounted: PropTypes.func,
  htmlAttributes: PropTypes.object
};

const SHARED_IMGIX_AND_SOURCE_PROP_TYPES = {
  ...COMMON_PROP_TYPES,
  disableQualityByDPR: PropTypes.bool,
  disableSrcSet: PropTypes.bool,
  disableLibraryParam: PropTypes.bool,
  imgixParams: PropTypes.object,
  sizes: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  src: PropTypes.string.isRequired
};

/**
 * Parse an aspect ratio in the format w:h to a decimal. If false is returned, the aspect ratio is in the wrong format.
 */
function parseAspectRatio(aspectRatio) {
  if (typeof aspectRatio !== "string") {
    return false;
  }
  const isValidFormat = str => /^\d+(\.\d+)?:\d+(\.\d+)?$/.test(str);
  if (!isValidFormat(aspectRatio)) {
    return false;
  }

  const [width, height] = aspectRatio.split(":");

  return parseFloat(width) / parseFloat(height);
}

const buildSrcSetPairWithFixedHeight = (url, targetWidth, fixedHeight, _) =>
  url + "&h=" + fixedHeight + "&w=" + targetWidth + " " + targetWidth + "w";

const buildSrcSetPairWithAspectRatio = (
  url,
  targetWidth,
  _,
  aspectRatioDecimal
) =>
  url +
  "&h=" +
  Math.ceil(targetWidth / aspectRatioDecimal) +
  "&w=" +
  targetWidth +
  " " +
  targetWidth +
  "w";

const buildSrcSetPairWithTargetWidth = (url, targetWidth, _1, _2) =>
  url + "&w=" + targetWidth + " " + targetWidth + "w";

const buildDprSrcWithQuality = (url, quality, dpr) =>
  url + "&q=" + quality + "&dpr=" + dpr + " " + dpr + "x";

const buildDprSrcWithoutQuality = (url, _, dpr) =>
  url + "&dpr=" + dpr + " " + dpr + "x";

const buildDprSrcWithQualityByDpr = (url, quality, dpr) =>
  url + "&q=" + quality + "&dpr=" + dpr + " " + dpr + "x";

/**
 * Build a imgix source url with parameters from a raw url
 */
function buildSrc({
  src: inputSrc,
  width,
  height,
  disableLibraryParam,
  disableSrcSet,
  type,
  imgixParams,
  aspectRatio,
  disableQualityByDPR
}) {
  const fixedSize = width != null || height != null;

  const [rawSrc, params] = extractQueryParams(inputSrc);

  const srcOptions = {
    ...params,
    ...imgixParams,
    ...(disableLibraryParam ? {} : { ixlib: `react-${PACKAGE_VERSION}` }),
    ...(fixedSize && height ? { height } : {}),
    ...(fixedSize && width ? { width } : {})
  };

  const src = constructUrl(rawSrc, srcOptions);

  let srcSet;

  if (disableSrcSet) {
    srcSet = src;
  } else {
    if (fixedSize) {
      const { q, ...urlParams } = srcOptions;
      const constructedUrl = constructUrl(rawSrc, urlParams);

      let srcFn = buildDprSrcWithQualityByDpr;
      if (q) {
        srcFn = buildDprSrcWithQuality;
      } else if (disableQualityByDPR) {
        srcFn = buildDprSrcWithoutQuality;
      }

      srcSet = "";
      const len = DPR_QUALITY_VALUES.length;
      for (let i = 0; i < len; i++) {
        const quality = DPR_QUALITY_VALUES[i];
        srcSet += srcFn(constructedUrl, q || quality, i + 1) + ", ";
      }
      srcSet = srcSet.slice(0, -2);
    } else {
      const { width, w, height, ...urlParams } = srcOptions;
      const constructedUrl = constructUrl(rawSrc, urlParams);

      const aspectRatioDecimal = parseAspectRatio(aspectRatio);
      // false indicates invalid
      let showARWarning = aspectRatio != null && aspectRatioDecimal === false;

      let srcFn = buildSrcSetPairWithTargetWidth;
      if (height) {
        srcFn = buildSrcSetPairWithFixedHeight;
      } else if (aspectRatioDecimal) {
        srcFn = buildSrcSetPairWithAspectRatio;
      }
      srcSet = "";
      const len = targetWidths.length;
      for (let i = 0; i < len; i++) {
        const targetWidth = targetWidths[i];
        srcSet +=
          srcFn(constructedUrl, targetWidth, height, aspectRatioDecimal) + ", ";
      }
      srcSet = srcSet.slice(0, -2);

      if (showARWarning && config.warnings.invalidARFormat) {
        console.warn(
          `[Imgix] The aspect ratio passed ("${aspectRatio}") is not in the correct format. The correct format is "W:H".`
        );
      }
    }
  }

  return {
    src,
    srcSet
  };
}

/**
 * Combines default imgix params with custom imgix params to make a imgix params config object
 */
function imgixParams(props) {
  const params = {
    ...defaultImgixParams,
    ...props.imgixParams
  };

  let fit = false;
  if (params.crop != null) fit = "crop";
  if (params.fit) fit = params.fit;

  if (params.ar) {
    delete params.ar;
  }

  return {
    ...params,
    fit
  };
}

/**
 * React component used to render <img> elements with Imgix
 */
class ReactImgix extends Component {
  static propTypes = {
    ...SHARED_IMGIX_AND_SOURCE_PROP_TYPES
  };
  static defaultProps = {
    disableSrcSet: false,
    onMounted: noop
  };

  componentDidMount = () => {
    const node = ReactDOM.findDOMNode(this);
    this.props.onMounted(node);
  };

  render() {
    const { disableSrcSet, type, width, height } = this.props;

    // Pre-render checks
    if (NODE_ENV !== "production" && config.warnings.sizesAttribute) {
      if (
        this.props.width == null &&
        this.props.height == null &&
        this.props.sizes == null &&
        !this.props._inPicture
      ) {
        console.warn(
          "If width and height are not set, a sizes attribute should be passed."
        );
      }
    }

    const htmlAttributes = this.props.htmlAttributes || {};

    const { src, srcSet } = buildSrc({
      ...this.props,
      type: "img",
      imgixParams: imgixParams(this.props),
      aspectRatio: (this.props.imgixParams || {}).ar
    });

    const attributeConfig = {
      ...defaultAttributeMap,
      ...this.props.attributeConfig
    };
    const childProps = {
      ...this.props.htmlAttributes,
      [attributeConfig.sizes]: this.props.sizes,
      className: this.props.className,
      width: width <= 1 ? null : width,
      height: height <= 1 ? null : height,
      [attributeConfig.src]: src
    };
    if (!disableSrcSet) {
      childProps[attributeConfig.srcSet] = srcSet;
    }

    if (type === "bg") {
      // TODO: Remove in v9
      throw new Error(
        `type='bg' has been removed in this version of react-imgix. If you would like this re-implemented please give this issues a thumbs up: https://github.com/imgix/react-imgix/issues/160`
      );
    }

    if (type === "source") {
      // TODO: Remove in v9
      throw new Error(
        `type='source' has been changed to <Source />. Please see the upgrade guide at: https://github.com/imgix/react-imgix#7x-to-80`
      );
    }
    if (type === "picture") {
      // TODO: Remove in v9
      throw new Error(
        `type='picture' has been changed to <Picture />. Please see the upgrade guide at: https://github.com/imgix/react-imgix#7x-to-80`
      );
    }
    return <img {...childProps} />;
  }
}
ReactImgix.displayName = "ReactImgix";

/**
 * React component used to render <picture> elements with Imgix
 */
class PictureImpl extends Component {
  static propTypes = {
    ...COMMON_PROP_TYPES,
    children: PropTypes.any
  };
  static defaultProps = {
    onMounted: noop
  };

  componentDidMount = () => {
    const node = ReactDOM.findDOMNode(this);
    this.props.onMounted(node);
  };
  render() {
    const { children } = this.props;

    // make sure all of our children have key set, otherwise we get react warnings
    let _children =
      React.Children.map(children, (child, idx) =>
        React.cloneElement(child, {
          key: buildKey(idx),
          _inPicture: true
        })
      ) || [];

    /*
		We need to make sure an <img /> or <Imgix /> is the last child so we look for one in children
		  a. if we find one, move it to the last entry if it's not already there
		  b. if we don't find one, warn the user as they probably want to pass one.
		*/

    // look for an <img> or <ReactImgix type='img'> - at the bare minimum we have to have a single <img> element or else it will not work.
    let imgIdx = _children.findIndex(
      c =>
        c.type === "img" ||
        c.type === ReactImgix ||
        c.type === ReactImgixWrapped
    );

    if (imgIdx === -1 && config.warnings.fallbackImage) {
      console.warn(
        "No fallback <img /> or <Imgix /> found in the children of a <picture> component. A fallback image should be passed to ensure the image renders correctly at all dimensions."
      );
    } else if (imgIdx !== _children.length - 1) {
      // found one, need to move it to the end
      _children.push(_children.splice(imgIdx, 1)[0]);
    }

    return <picture children={_children} />;
  }
}
PictureImpl.displayName = "ReactImgixPicture";

/**
 * React component used to render <source> elements with Imgix
 */
class SourceImpl extends Component {
  static propTypes = {
    ...SHARED_IMGIX_AND_SOURCE_PROP_TYPES
  };
  static defaultProps = {
    disableSrcSet: false,
    onMounted: noop
  };

  componentDidMount = () => {
    const node = ReactDOM.findDOMNode(this);
    this.props.onMounted(node);
  };
  render() {
    const { disableSrcSet, width, height } = this.props;

    const htmlAttributes = this.props.htmlAttributes || {};

    const { src, srcSet } = buildSrc({
      ...this.props,
      type: "source",
      imgixParams: imgixParams(this.props)
    });

    const attributeConfig = {
      ...defaultAttributeMap,
      ...this.props.attributeConfig
    };
    const childProps = {
      ...this.props.htmlAttributes,
      [attributeConfig.sizes]: this.props.sizes,
      className: this.props.className,
      width: width <= 1 ? null : width,
      height: height <= 1 ? null : height
    };

    // inside of a <picture> element a <source> element ignores its src
    // attribute in favor of srcSet so we set that with either an actual
    // srcSet or a single src
    if (disableSrcSet) {
      childProps[attributeConfig.srcSet] = src;
    } else {
      childProps[attributeConfig.srcSet] = `${srcSet}`;
    }
    // for now we'll take media from htmlAttributes which isn't ideal because
    //   a) this isn't an <img>
    //   b) passing objects as props means that react will always rerender
    //      since objects dont respond correctly to ===

    return <source {...childProps} />;
  }
}
SourceImpl.displayName = "ReactImgixSource";

const ReactImgixWrapped = compose(
  deprecatePropsHOC,
  ShouldComponentUpdateHOC
)(ReactImgix);
const Picture = compose(ShouldComponentUpdateHOC)(PictureImpl);
const Source = compose(ShouldComponentUpdateHOC)(SourceImpl);

export default ReactImgixWrapped;
export {
  ReactImgix as __ReactImgixImpl, // for testing
  Picture,
  Source,
  SourceImpl as __SourceImpl, // for testing
  PictureImpl as __PictureImpl // for testing
};
