/*
Copyright © 2015 by Coursera
Licensed under the Apache License 2.0, seen https://github.com/coursera/react-imgix/blob/master/LICENSE

Minor syntax modifications have been made
*/

import ImgixClient from "@imgix/js-core";
import extractQueryParams from "./extractQueryParams";
import { config } from "./common";
const PACKAGE_VERSION = require("../package.json").version;

// @see https://www.imgix.com/docs/reference
var PARAM_EXPANSION = Object.freeze({
  // Adjustment
  brightness: "bri",
  contrast: "con",
  exposure: "exp",
  gamma: "gam",
  highlights: "high",
  hue: "hue",
  invert: "invert",
  saturation: "sat",
  shaddows: "shad",
  sharpness: "sharp",
  "unsharp-mask": "usm",
  "unsharp-radius": "usmrad",
  vibrance: "vib",

  // Automatic
  "auto-features": "auto",

  // Background
  "background-color": "bg",

  // Blend
  blend: "blend",
  "blend-mode": "bm",
  "blend-align": "ba",
  "blend-alpha": "balph",
  "blend-padding": "bp",
  "blend-width": "bw",
  "blend-height": "bh",
  "blend-fit": "bf",
  "blend-crop": "bc",
  "blend-size": "bs",
  "blend-x": "bx",
  "blend-y": "by",

  // Border & Padding
  border: "border",
  padding: "pad",

  // Face Detection
  "face-index": "faceindex",
  "face-padding": "facepad",
  faces: "faces",

  // Format
  "chroma-subsampling": "chromasub",
  "color-quantization": "colorquant",
  download: "dl",
  DPI: "dpi",
  format: "fm",
  "lossless-compression": "lossless",
  quality: "q",

  // Mask
  "mask-image": "mask",

  // Mask
  "noise-blur": "nr",
  "noise-sharpen": "nrs",

  // Palette n/a
  // PDF n/a
  // Pixel Density n/a

  // Rotation
  "flip-direction": "flip",
  orientation: "or",
  "rotation-angle": "rot",

  // Size
  "crop-mode": "crop",
  "fit-mode": "fit",
  "image-height": "h",
  "image-width": "w",

  // Stylize
  blurring: "blur",
  halftone: "htn",
  monotone: "mono",
  pixelate: "px",
  "sepia-tone": "sepia",

  // Trim TODO
  // Watermark TODO

  // Extra
  height: "h",
  width: "w",
});

var DEFAULT_OPTIONS = Object.freeze({
  auto: "format", // http://www.imgix.com/docs/reference/automatic#param-auto
});

/**
 * Construct a URL for an image with an Imgix proxy, expanding image options
 * per the [API reference docs](https://www.imgix.com/docs/reference).
 * @param  {String} src         src of raw image
 * @param  {Object} longOptions map of image API options, in long or short form per expansion rules
 * @return {String}             URL of image src transformed by Imgix
 */
function constructUrl(src, longOptions) {
  const params = compactParamKeys(longOptions);
  const { client, pathComponents } = extractClientAndPathComponents(src);
  return client.buildURL(pathComponents.join("/"), params);
}

function compactParamKeys(longOptions, width, height) {
  const params = Object.keys(longOptions).reduce((acc, key) => {
    if (PARAM_EXPANSION[key]) {
      acc[PARAM_EXPANSION[key]] = longOptions[key];
    } else {
      acc[key] = longOptions[key];
    }
    return acc;
  }, {});

  if (width) {
    params["w"] = width;
  }

  if (height) {
    params["h"] = height;
  }
  return params;
}

function extractClientAndPathComponents(src) {
  const [scheme, rest] = src.split("://");
  const [domain, ...pathComponents] = rest.split("/");
  let useHTTPS = scheme == "https";

  const client = new ImgixClient({
    domain: domain,
    useHTTPS: useHTTPS,
    includeLibraryParam: false,
  });

  return { client, pathComponents };
}

function buildSrcSet(rawSrc, params = {}, options = {}, width, height) {
  const { client, pathComponents } = extractClientAndPathComponents(rawSrc);
  const compactedParams = compactParamKeys(params, width, height);
  return client.buildSrcSet(pathComponents.join("/"), compactedParams, options);
}

function buildURLPublic(src, imgixParams = {}, options = {}) {
  const { disableLibraryParam } = options;

  const [rawSrc, params] = extractQueryParams(src);

  return constructUrl(rawSrc, {
    ...params,
    ...imgixParams,
    ...(disableLibraryParam ? {} : { ixlib: `react-${PACKAGE_VERSION}` }),
  });
}

/**
 * Validates that an aspect ratio is in the format w:h. If false is returned, the aspect ratio is in the wrong format.
 */
function aspectRatioIsValid(aspectRatio) {
  if (typeof aspectRatio !== "string") {
    return false;
  }

  return /^\d+(\.\d+)?:\d+(\.\d+)?$/.test(aspectRatio);
}

function warnInvalidAspectRatio(aspectRatio, config) {
  const NODE_ENV = process.env.NODE_ENV;
  const showARWarning =
    aspectRatio != "" && aspectRatioIsValid(aspectRatio) === false;
  if (
    NODE_ENV !== "production" &&
    showARWarning &&
    config.warnings.invalidARFormat
  ) {
    console.warn(
      `[Imgix] The aspect ratio passed ("${aspectRatio}") is not in the correct format. The correct format is "W:H".`
    );
  }
}

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
    warnInvalidAspectRatio(imgixParams.ar || "", config);

    const { w, h, ...urlParams } = srcOptions;
    const src = constructUrl(rawSrc, srcOptions);
    const srcSet = buildSrcSet(rawSrc, { ...urlParams });

    return { src, srcSet };
  }
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

function buildChildProps(obj, src, attributeConfig, width, height, refType) {
  const childProps = {
    ...obj.props.htmlAttributes,
    [attributeConfig.sizes]: obj.props.sizes,
    className: obj.props.className,
    width: width <= 1 ? null : width,
    height: height <= 1 ? null : height,
    [attributeConfig.src]: src,
    ref: (el) => {
      obj[refType] = el;
      if (
        obj.props.htmlAttributes !== undefined &&
        "ref" in obj.props.htmlAttributes
      ) {
        setParentRef(obj.props.htmlAttributes.ref, obj[refType]);
      }
    },
  };
  return childProps;
}

export default constructUrl;

export { buildURLPublic, buildSrc, buildChildProps };
