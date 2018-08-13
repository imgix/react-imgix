import "./array-findindex";

import ReactDOM from "react-dom";
import React, { Component } from "react";
import PropTypes from "prop-types";

import targetWidths from "./targetWidths";
import constructUrl from "./constructUrl";

import { warning, shallowEqual } from "./common";

const PACKAGE_VERSION = require("../package.json").version;
const NODE_ENV = process.env.NODE_ENV;

const isStringNotEmpty = str =>
  str && typeof str === "string" && str.length > 0;
const buildKey = idx => `react-imgix-${idx}`;

const validTypes = ["img", "picture", "source"];

const defaultImgixParams = {
  auto: ["format"],
  fit: "crop"
};

const noop = () => {};

class ReactImgix extends Component {
  static propTypes = {
    children: PropTypes.any,
    className: PropTypes.string,
    disableSrcSet: PropTypes.bool,
    onMounted: PropTypes.func,
    sizes: PropTypes.string,
    src: PropTypes.string.isRequired,
    type: PropTypes.oneOf(validTypes),
    width: PropTypes.number,
    height: PropTypes.number,
    disableLibraryParam: PropTypes.bool,
    imgixParams: PropTypes.object
  };
  static defaultProps = {
    disableSrcSet: false,
    onMounted: noop,
    type: "img"
  };

  componentDidMount = () => {
    const node = ReactDOM.findDOMNode(this);
    this.props.onMounted(node);
  };

  shouldComponentUpdate = nextProps => {
    warning(
      nextProps.onMounted == this.props.onMounted,
      "props.onMounted() is changing between renders. This is probably not intended. Ensure that a class method is being passed to Imgix rather than a function that is created every render. If this is intended, ignore this warning."
    );

    const customizer = (oldProp, newProp, key) => {
      if (key === "children") {
        return shallowEqual(oldProp, newProp);
      }
      if (key === "imgixParams") {
        return shallowEqual(oldProp, newProp, (a, b) => {
          if (Array.isArray(a)) {
            return shallowEqual(a, b);
          }
          return undefined;
        });
      }
      if (key === "imgProps") {
        return shallowEqual(oldProp, newProp);
      }
      return undefined; // handled by shallowEqual
    };
    const propsAreEqual = shallowEqual(props, nextProps, customizer);
    return !propsAreEqual;
  };

  buildSrcs = () => {
    const props = this.props;
    const { width, height, disableLibraryParam, disableSrcSet, type } = props;
    const imgixParams = this.imgixParams();

    const fixedSize = width != null || height != null;

    const srcOptions = {
      ...imgixParams,
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

  imgixParams = () => {
    const params = {
      ...defaultImgixParams,
      ...this.props.imgixParams
    };

    let fit = false;
    if (params.crop != null) fit = "crop";
    if (params.fit) fit = params.fit;

    return {
      ...params,
      fit
    };
  };

  render() {
    const { children, disableSrcSet, type, width, height } = this.props;

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

    let _component = undefined;
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
        _component = "img";

        if (!disableSrcSet) {
          childProps.srcSet = srcSet;
        }
        childProps.src = src;
        break;
      case "source":
        _component = "source";

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
        _component = "picture";

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
            ((c.type === ReactImgix || c.type === ReactImgixWrapped) &&
              c.props.type === "img")
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

const DEPRECATED_PROPS = ["auto", "crop", "fit"];
const deprecateProps = WrappedComponent => {
  const WithDeprecatedProps = props => {
    const imgixParams = {
      ...(props.customParams || {}),
      ...props.imgixParams
    };
    const propsWithOutDeprecated = {
      ...props,
      imgixParams
    };
    DEPRECATED_PROPS.forEach(deprecatedProp => {
      warning(
        !(deprecatedProp in props),
        `The prop '${deprecatedProp}' has been deprecated and will be removed in v9. Please update the usage to <Imgix imgixParams={{${deprecatedProp}: value}} />`
      );

      if (deprecatedProp in props) {
        delete propsWithOutDeprecated[deprecatedProp];
        imgixParams[deprecatedProp] = props[deprecatedProp];
      }
    });
    warning(
      !("customParams" in props),
      `The prop 'customParams' has been replaced with 'imgixParams' and will be removed in v9. Please update usage to <Imgix imgixParams={customParams} />`
    );
    delete propsWithOutDeprecated.customParams;

    if (props.faces) {
      warning(
        false,
        `The prop 'faces' has been deprecated and will be removed in v9. Please update the usage to <Imgix imgixParams={{crop: 'faces'}} />`
      );
      delete propsWithOutDeprecated.faces;
      if (!imgixParams.crop) {
        imgixParams.crop = "faces";
      }
    }
    if (props.entropy) {
      warning(
        false,
        `The prop 'entropy' has been deprecated and will be removed in v9. Please update the usage to <Imgix imgixParams={{crop: 'entropy'}} />`
      );
      delete propsWithOutDeprecated.entropy;
      if (!imgixParams.crop) {
        imgixParams.crop = "entropy";
      }
    }

    return <WrappedComponent {...propsWithOutDeprecated} />;
  };
  WithDeprecatedProps.propTypes = {
    ...ReactImgix.propTypes,
    auto: PropTypes.array,
    customParams: PropTypes.object,
    crop: PropTypes.string,
    entropy: PropTypes.bool,
    faces: PropTypes.bool,
    fit: PropTypes.string
  };
  WithDeprecatedProps.defaultProps = {
    imgixParams: {}
  };
  WithDeprecatedProps.displayName = "ReactImgix";

  return WithDeprecatedProps;
};

const ReactImgixWrapped = deprecateProps(ReactImgix);
export default ReactImgixWrapped;
export { ReactImgix as __ReactImgix };
