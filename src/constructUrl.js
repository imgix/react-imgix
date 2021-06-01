/*
Copyright © 2015 by Coursera
Licensed under the Apache License 2.0, seen https://github.com/coursera/react-imgix/blob/master/LICENSE

Minor syntax modifications have been made
*/

const PACKAGE_VERSION = require("../package.json").version;
import extractQueryParams from "./extractQueryParams";
import ImgixClient from "@imgix/js-core";

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
  shadows: "shad",
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
  if (!src) {
    return "";
  }
  const params = compactParamKeys(longOptions);
  const { client, pathComponents } = extractClientAndPathComponents(src);
  return client.buildURL(pathComponents.join("/"), params);
}

function compactParamKeys(longOptions) {
  const keys = Object.keys(longOptions);
  const keysLength = keys.length;
  const params = {};
  for (let i = 0; i < keysLength; i++) {
    let key = keys[i];
    if (PARAM_EXPANSION[key]) {
      params[PARAM_EXPANSION[key]] = longOptions[key];
    } else {
      params[key] = longOptions[key];
    }
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

function buildURLPublic(src, imgixParams = {}, options = {}) {
  const { disableLibraryParam } = options;

  const [rawSrc, params] = extractQueryParams(src);

  return constructUrl(
    rawSrc,
    Object.assign(
      {},
      params,
      imgixParams,
      disableLibraryParam ? {} : { ixlib: `react-${PACKAGE_VERSION}` }
    )
  );
}

export default constructUrl;

export { buildURLPublic, compactParamKeys, extractClientAndPathComponents };
