import "./array-findindex";

import ReactDOM from "react-dom";
import React, { Component } from "react";
import PropTypes from "prop-types";

import targetWidths from "./targetWidths";
import processImage from "./support";
import { invariant } from "./common";

const PACKAGE_VERSION = require("../package.json").version;
const NODE_ENV = process.env.NODE_ENV;

const isStringNotEmpty = str =>
  str && typeof str === "string" && str.length > 0;
const buildKey = idx => `react-imgix-${idx}`;

const validTypes = ["bg", "img", "picture", "source"];

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
    defaultHeight: PropTypes.number,
    defaultWidth: PropTypes.number,
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
      disableSrcSet
    } = props;

    let crop = false;
    if (faces) crop = "faces";
    if (entropy) crop = "entropy";
    if (props.crop) crop = props.crop;

    let fit = false;
    if (entropy) fit = "crop";
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

    const src = processImage(this.props.src, srcOptions);

    let srcSet;

    if (disableSrcSet) {
      srcSet = src;
    } else {
      if (fixedSize) {
        const dpr2 = processImage(this.props.src, { ...srcOptions, dpr: 2 });
        const dpr3 = processImage(this.props.src, { ...srcOptions, dpr: 3 });
        srcSet = `${dpr2} 2x, ${dpr3} 3x`;
      } else {
        const buildSrcSetPair = targetWidth => {
          const url = processImage(this.props.src, {
            ...srcOptions,
            width: targetWidth
          });
          return `${url} ${targetWidth}w`;
        };
        srcSet = targetWidths.map(buildSrcSetPair).join(", ");
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
      bg,
      children,
      component,
      customParams,
      crop,
      entropy,
      faces,
      fit,
      disableSrcSet,
      src_,
      type,
      width,
      height,
      ...other
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
        if (!component) {
          _component = "div";
        }
        delete childProps.sizes;
        childProps.style = {
          backgroundSize: "cover",
          backgroundImage: isStringNotEmpty(src) ? `url('${src}')` : null,
          ...childProps.style
        };
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
        //    b. if we don't find one, create one.

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
          // didn't find one or empty array - either way make a new component to
          // put at the end. we pass in almost all of our props as defaults to
          // our children, exceptions are:
          //
          //    bg - only <source> and <img> elements are allowable as children of
          //         <picture> so we strip this option
          //    children - we don't want to get recursive here
          //    component - same reason as bg
          //    type - specifically we're adding an img type so we hard-code this,
          //           also letting type=picture through would infinitely loop

          let imgProps = {
            auto,
            customParams,
            crop,
            entropy,
            faces,
            fit,
            disableSrcSet,
            src,
            type: "img",
            width,
            height,
            ...other,
            // make sure to set a unique key too
            key: buildKey(_children.length + 1)
          };

          // we also remove className and styles if they exist - those passed in
          // to our top-level component are set there, if you want them set on
          // the child <img> element you can use `imgProps`.
          delete imgProps.className;
          delete imgProps.styles;

          // ..except if you have passed in imgProps you need those to not disappear,
          // so we'll remove the imgProps attribute from our imgProps object (ugh!)
          // and apply them now:
          imgProps.imgProps = { ...this.props.imgProps };
          ["className", "styles"].forEach(k => {
            if (imgProps.imgProps[k]) {
              imgProps[k] = imgProps.imgProps[k];
              delete imgProps.imgProps[k];
            }
          });

          // have to strip out props set to undefined or empty objects since they
          // will override any defaultProps in the child
          Object.keys(imgProps).forEach(k => {
            if (
              imgProps[k] === undefined ||
              (Object.keys(imgProps[k]).length === 0 &&
                imgProps[k].constructor === Object)
            )
              delete imgProps[k];
          });

          _children.push(<ReactImgix {...imgProps} />);
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
