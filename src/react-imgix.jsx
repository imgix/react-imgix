import PropTypes from "prop-types";
import React, { Component } from "react";
import "./array-findindex";
import { compose, config } from "./common";
import { PACKAGE_VERSION } from "./constants";
import constructUrl, { buildSrcSet } from "./constructUrl";
import extractQueryParams from "./extractQueryParams";
import { ShouldComponentUpdateHOC } from "./HOCs";

const NODE_ENV = process.env.NODE_ENV;

const buildKey = (idx) => `react-imgix-${idx}`;

const defaultImgixParams = {
  auto: ["format"],
};

const defaultAttributeMap = {
  src: "src",
  srcSet: "srcSet",
  sizes: "sizes",
};

const noop = () => {};

const COMMON_PROP_TYPES = {
  className: PropTypes.string,
  onMounted: PropTypes.func,
  htmlAttributes: PropTypes.object,
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
  src: PropTypes.string.isRequired,
};

/**
 * Validates that an aspect ratio is in the format w:h. If false is returned, the aspect ratio is in the wrong format.
 */
function aspectRatioIsValid(aspectRatio) {
  if (typeof aspectRatio !== "string") {
    return false;
  }

  return /^\d+(\.\d+)?:\d+(\.\d+)?$/.test(aspectRatio);
}

const setParentRef = (parentRef, el) => {
  if (!parentRef) {
    return;
  }

  // assign ref based on if it's a callback vs object
  if (typeof parentRef === "function") {
    parentRef(el);
  } else {
    parentRef.current = el;
  }
};

const buildSrcSetPairWithFixedHeight = (url, targetWidth, fixedHeight, _) =>
  url + "&h=" + fixedHeight + "&w=" + targetWidth + " " + targetWidth + "w";

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
  imgixParams,
  disableQualityByDPR,
}) {
  const [rawSrc, params] = extractQueryParams(inputSrc);
  const fixedSize = width != null || height != null;

  const srcOptions = {
    ...params,
    ...imgixParams,
    ...(disableLibraryParam ? {} : { ixlib: `react-${PACKAGE_VERSION}` }),
    ...(fixedSize && height ? { height } : {}),
    ...(fixedSize && width ? { width } : {}),
  };

  if (disableSrcSet) {
    const src = constructUrl(rawSrc, srcOptions);
    return { src, src };
  }

  if (fixedSize) {
    const srcSet = buildSrcSet(
      rawSrc,
      srcOptions,
      {
        disableVariableQuality: disableQualityByDPR,
      },
      width,
      height
    );

    const src = constructUrl(rawSrc, srcOptions);
    return { src, srcSet };
  } else {
    const { w, h, ...urlParams } = srcOptions;
    const srcSet = buildSrcSet(rawSrc, { ...urlParams });

    const aspectRatio = imgixParams.ar;
    let showARWarning =
      aspectRatio != null && aspectRatioIsValid(aspectRatio) === false;
    if (
      NODE_ENV !== "production" &&
      showARWarning &&
      config.warnings.invalidARFormat
    ) {
      console.warn(
        `[Imgix] The aspect ratio passed ("${aspectRatio}") is not in the correct format. The correct format is "W:H".`
      );
    }
    const src = constructUrl(rawSrc, srcOptions);
    return { src, srcSet };
  }
}

/**
 * Combines default imgix params with custom imgix params to make a imgix params config object
 */
function imgixParams(props) {
  return { ...defaultImgixParams, ...props.imgixParams };
}

/**
 * React component used to render <img> elements with Imgix
 */
class ReactImgix extends Component {
  static propTypes = { ...SHARED_IMGIX_AND_SOURCE_PROP_TYPES };
  static defaultProps = {
    disableSrcSet: false,
    onMounted: noop,
  };

  constructor(props) {
    super(props);
    this.imgRef = null;
  }

  componentDidMount() {
    this.props.onMounted(this.imgRef);
  }

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

    const { src, srcSet } = buildSrc({
      ...this.props,
      type: "img",
      imgixParams: imgixParams(this.props),
    });

    const attributeConfig = {
      ...defaultAttributeMap,
      ...this.props.attributeConfig,
    };

    const childProps = {
      ...this.props.htmlAttributes,
      [attributeConfig.sizes]: this.props.sizes,
      className: this.props.className,
      width: width <= 1 ? null : width,
      height: height <= 1 ? null : height,
      [attributeConfig.src]: src,
      ref: (el) => {
        this.imgRef = el;
        if (
          this.props.htmlAttributes !== undefined &&
          "ref" in this.props.htmlAttributes
        ) {
          setParentRef(this.props.htmlAttributes.ref, this.imgRef);
        }
      },
    };

    if (!disableSrcSet) {
      childProps[attributeConfig.srcSet] = srcSet;
    }

    return <img {...childProps} />;
  }
}
ReactImgix.displayName = "ReactImgix";

/**
 * React component used to render <picture> elements with Imgix
 */
class PictureImpl extends Component {
  static propTypes = { ...COMMON_PROP_TYPES, children: PropTypes.any };
  static defaultProps = { onMounted: noop };

  constructor(props) {
    super(props);
    this.pictureRef = null;
  }

  componentDidMount() {
    this.props.onMounted(this.pictureRef);
  }

  render() {
    const { children } = this.props;

    // make sure all of our children have key set, otherwise we get react warnings
    let _children =
      React.Children.map(children, (child, idx) =>
        React.cloneElement(child, {
          key: buildKey(idx),
          _inPicture: true,
        })
      ) || [];

    /*
    We need to make sure an <img /> or <Imgix /> is the last child so we look for one in children
      a. if we find one, move it to the last entry if it's not already there
      b. if we don't find one, warn the user as they probably want to pass one.
    */

    // look for an <img> or <ReactImgix type='img'> - at the bare minimum we have to have a single <img> element or else it will not work.
    let imgIdx = _children.findIndex(
      (c) =>
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

    return (
      <picture ref={(el) => (this.pictureRef = el)} children={_children} />
    );
  }
}
PictureImpl.displayName = "ReactImgixPicture";

/**
 * React component used to render <source> elements with Imgix
 */
class SourceImpl extends Component {
  static propTypes = { ...SHARED_IMGIX_AND_SOURCE_PROP_TYPES };
  static defaultProps = {
    disableSrcSet: false,
    onMounted: noop,
  };

  constructor(props) {
    super(props);
    this.sourceRef = null;
  }

  componentDidMount() {
    this.props.onMounted(this.sourceRef);
  }

  render() {
    const { disableSrcSet, width, height } = this.props;

    const { src, srcSet } = buildSrc({
      ...this.props,
      type: "source",
      imgixParams: imgixParams(this.props),
    });

    const attributeConfig = {
      ...defaultAttributeMap,
      ...this.props.attributeConfig,
    };

    const childProps = {
      ...this.props.htmlAttributes,
      [attributeConfig.sizes]: this.props.sizes,
      className: this.props.className,
      width: width <= 1 ? null : width,
      height: height <= 1 ? null : height,
      ref: (el) => {
        this.sourceRef = el;
        if (
          this.props.htmlAttributes !== undefined &&
          "ref" in this.props.htmlAttributes
        ) {
          setParentRef(this.props.htmlAttributes.ref, this.sourceRef);
        }
      },
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

const ReactImgixWrapped = compose(ShouldComponentUpdateHOC)(ReactImgix);
const Picture = compose(ShouldComponentUpdateHOC)(PictureImpl);
const Source = compose(ShouldComponentUpdateHOC)(SourceImpl);

export default ReactImgixWrapped;
export {
  ReactImgix as __ReactImgixImpl, // for testing
  Picture,
  Source,
  SourceImpl as __SourceImpl, // for testing
  PictureImpl as __PictureImpl, // for testing
};
