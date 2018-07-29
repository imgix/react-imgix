import "./array-findindex";

import ReactDOM from "react-dom";
import React, { Component } from "react";
import PropTypes from "prop-types";

import targetWidths from "./targetWidths";
import constructUrl from "./constructUrl";

const PACKAGE_VERSION = require("../package.json").version;
const NODE_ENV = process.env.NODE_ENV;

const isStringNotEmpty = str =>
  str && typeof str === "string" && str.length > 0;
const buildKey = idx => `react-imgix-${idx}`;

const validTypes = ["img", "picture", "source"];

export default class ReactImgix extends Component {
  static propTypes = {
    auto: PropTypes.array,
    children: PropTypes.any,
    className: PropTypes.string,
    component: PropTypes.string,
    crop: PropTypes.string,
    customParams: PropTypes.object,
    entropy: PropTypes.bool,
    faces: PropTypes.bool,
    fit: PropTypes.string,
    disableSrcSet: PropTypes.bool,
    onMounted: PropTypes.func,
    sizes: PropTypes.string,
    src: PropTypes.string.isRequired,
    type: PropTypes.oneOf(validTypes),
    width: PropTypes.number,
    height: PropTypes.number,
    disableLibraryParam: PropTypes.bool
  };
  static defaultProps = {
    auto: ["format"],
    entropy: false,
    faces: true,
    fit: "crop",
    disableSrcSet: false,
    onMounted: () => {},
    type: "img"
  };

  componentDidMount = () => {
    const node = ReactDOM.findDOMNode(this);
    this.props.onMounted(node);
  };

  buildSrcs = () => {
    const props = this.props;
    const {
      width,
      height,
      entropy,
      faces,
      auto,
      customParams,
      disableLibraryParam,
      disableSrcSet,
      type
    } = props;

    let crop = false;
    if (faces) crop = "faces";
    if (entropy) crop = "entropy";
    if (props.crop) crop = props.crop;

    let fit = false;
    if (entropy || faces) fit = "crop";
    if (props.fit) fit = props.fit;

    const fixedSize = width != null || height != null;

    const srcOptions = {
      auto,
      ...customParams,
      crop,
      fit,
      ...(disableLibraryParam ? {} : { ixlib: `react-${PACKAGE_VERSION}` }),
      ...(fixedSize && height ? { height } : {}),
      ...(fixedSize && width ? { width } : {})
    };

    const src = constructUrl(this.props.src, srcOptions);

    let srcSet;

    if (disableSrcSet) {
      srcSet = src;
    } else {
      if (fixedSize || type === "source") {
        const dpr2 = constructUrl(this.props.src, { ...srcOptions, dpr: 2 });
        const dpr3 = constructUrl(this.props.src, { ...srcOptions, dpr: 3 });
        srcSet = `${dpr2} 2x, ${dpr3} 3x`;
      } else {
        const buildSrcSetPair = targetWidth => {
          const url = constructUrl(this.props.src, {
            ...srcOptions,
            width: targetWidth
          });
          return `${url} ${targetWidth}w`;
        };
        const addFallbackSrc = srcSet => srcSet.concat(src);
        srcSet = addFallbackSrc(targetWidths.map(buildSrcSetPair)).join(", ");
      }
    }

    return {
      src,
      srcSet
    };
  };

  render() {
    const {
      auto,
      children,
      component,
      customParams,
      crop,
      entropy,
      faces,
      fit,
      disableSrcSet,
      type,
      width,
      height
    } = this.props;

    // Pre-render checks
    if (NODE_ENV !== "production") {
      if (
        type === "img" &&
        width == null &&
        height == null &&
        this.props.sizes == null &&
        !this.props._inPicture
      ) {
        console.warn(
          "If width and height are not set, a sizes attribute should be passed."
        );
      }
    }

    let _component = component;
    const imgProps = this.props.imgProps || {};

    let _children = children;

    const { src, srcSet } = this.buildSrcs();

    let childProps = {
      ...this.props.imgProps,
      sizes: this.props.sizes,
      className: this.props.className,
      width: width <= 1 ? null : width,
      height: height <= 1 ? null : height,
      alt: imgProps.alt
    };

    switch (type) {
      case "bg":
        // TODO: Remove in v9
        throw new Error(
          `type='bg' has been removed in this version of react-imgix. If you would like this re-implemented please give this issues a thumbs up: https://github.com/imgix/react-imgix/issues/160`
        );
        break;
      case "img":
        if (!component) {
          _component = "img";
        }

        if (!disableSrcSet) {
          childProps.srcSet = srcSet;
        }
        childProps.src = src;
        break;
      case "source":
        if (!component) {
          _component = "source";
        }

        // strip out the "alt" tag from childProps since it's not allowed
        delete childProps.alt;
        delete childProps.src;

        // inside of a <picture> element a <source> element ignores its src
        // attribute in favor of srcSet so we set that with either an actual
        // srcSet or a single src
        if (disableSrcSet) {
          childProps.srcSet = src;
        } else {
          childProps.srcSet = `${src}, ${srcSet}`;
        }
        // for now we'll take media from imgProps which isn't ideal because
        //   a) this isn't an <img>
        //   b) passing objects as props means that react will always rerender
        //      since objects dont respond correctly to ===
        break;
      case "picture":
        if (!component) {
          _component = "picture";
        }

        // strip out the "alt" tag from childProps since it's not allowed
        delete childProps.alt;

        //
        // we need to make sure an img is the last child so we look for one
        //    in children
        //    a. if we find one, move it to the last entry if it's not already there
        //    b. if we don't find one, warn the user as they probably want to pass one.

        // make sure all of our children have key set, otherwise we get react warnings
        _children =
          React.Children.map(children, (child, idx) =>
            React.cloneElement(child, {
              key: buildKey(idx),
              _inPicture: true
            })
          ) || [];

        // look for an <img> or <ReactImgix type='img'> - at the bare minimum we
        // have to have a single <img> element or else ie will not work.
        let imgIdx = _children.findIndex(
          c =>
            c.type === "img" ||
            (c.type === ReactImgix && c.props.type === "img")
        );

        if (imgIdx === -1) {
          console.warn(
            "No fallback image found in the children of a <picture> component. A fallback image should be passed to ensure the image renders correctly at all dimensions."
          );
        } else if (imgIdx !== _children.length - 1) {
          // found one, need to move it to the end
          _children.splice(
            _children.length - 1,
            0,
            _children.splice(imgIdx, 1)[0]
          );
        }
        break;
      default:
        break;
    }
    return React.createElement(_component, childProps, _children);
  }
}
