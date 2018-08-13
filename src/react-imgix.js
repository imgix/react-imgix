import "./array-findindex";

import ReactDOM from "react-dom";
import React, { Component } from "react";
import PropTypes from "prop-types";

import targetWidths from "./targetWidths";
import constructUrl from "./constructUrl";

import { warning, shallowEqual, compose } from "./common";

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

const COMMON_PROP_TYPES = {
  className: PropTypes.string,
  // TODO: onMounted for picture
  onMounted: PropTypes.func,
  imgProps: PropTypes.object
};

const SHARED_IMGIX_AND_SOURCE_PROP_TYPES = {
  ...COMMON_PROP_TYPES,
  disableSrcSet: PropTypes.bool,
  disableLibraryParam: PropTypes.bool,
  imgixParams: PropTypes.object,
  sizes: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  src: PropTypes.string.isRequired
};

const ShouldComponentUpdateHOC = WrappedComponent => {
  class ShouldComponentUpdateHOC extends Component {
    shouldComponentUpdate = nextProps => {
      const props = this.props;
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
        // TODO: change imgProps to htmlAttributes
        if (key === "imgProps") {
          return shallowEqual(oldProp, newProp);
        }
        return undefined; // handled by shallowEqual
      };
      const propsAreEqual = shallowEqual(props, nextProps, customizer);
      return !propsAreEqual;
    };
    render() {
      return <WrappedComponent {...this.props} />;
    }
  }
  ShouldComponentUpdateHOC.displayName = `ShouldComponentUpdateHOC(${
    WrappedComponent.displayName
  })`;
  return ShouldComponentUpdateHOC;
};

function buildSrc({
  src: rawSrc, // saucy!
  width,
  height,
  disableLibraryParam,
  disableSrcSet,
  type,
  imgixParams
}) {
  const fixedSize = width != null || height != null;

  const srcOptions = {
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
    if (fixedSize || type === "source") {
      const dpr2 = constructUrl(rawSrc, { ...srcOptions, dpr: 2 });
      const dpr3 = constructUrl(rawSrc, { ...srcOptions, dpr: 3 });
      srcSet = `${dpr2} 2x, ${dpr3} 3x`;
    } else {
      const buildSrcSetPair = targetWidth => {
        const url = constructUrl(rawSrc, {
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
}
function imgixParams(props) {
  const params = {
    ...defaultImgixParams,
    ...props.imgixParams
  };

  let fit = false;
  if (params.crop != null) fit = "crop";
  if (params.fit) fit = params.fit;

  return {
    ...params,
    fit
  };
}

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
    if (NODE_ENV !== "production") {
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

    const imgProps = this.props.imgProps || {};

    const { src, srcSet } = buildSrc({
      ...this.props,
      type: "img",
      imgixParams: imgixParams(this.props)
    });

    let childProps = {
      ...this.props.imgProps,
      sizes: this.props.sizes,
      className: this.props.className,
      width: width <= 1 ? null : width,
      height: height <= 1 ? null : height,
      alt: imgProps.alt,
      src
    };
    if (!disableSrcSet) {
      childProps.srcSet = srcSet;
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
        `type='picture' has been changed to <Picture />. Please see the upgrade guide at: https://github.com/imgix/react-imgix#7x-to-80`
      );
    }
    if (type === "picture") {
      throw new Error(
        `type='picture' has been changed to <Picture />. Please see the upgrade guide at: https://github.com/imgix/react-imgix#7x-to-80`
      );
    }
    return <img {...childProps} />;
  }
}
ReactImgix.displayName = "ReactImgix";

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
  WithDeprecatedProps.displayName = `WithDeprecatedProps(${
    WrappedComponent.displayName
  })`;

  return WithDeprecatedProps;
};

const ReactImgixWrapped = compose(
  deprecateProps,
  ShouldComponentUpdateHOC
)(ReactImgix);
export default ReactImgixWrapped;
export { ReactImgix as __ReactImgixImpl }; // for testing

class PictureImpl extends Component {
  static propTypes = {
    ...COMMON_PROP_TYPES,
    children: PropTypes.any
  };
  render() {
    const { children } = this.props;
    // TODO: remove?
    // strip out the "alt" tag from childProps since it's not allowed
    // delete childProps.alt;

    //
    // we need to make sure an img is the last child so we look for one
    //    in children
    //    a. if we find one, move it to the last entry if it's not already there
    //    b. if we don't find one, warn the user as they probably want to pass one.

    // make sure all of our children have key set, otherwise we get react warnings
    let _children =
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
        c.type === ReactImgix ||
        c.type === ReactImgixWrapped
    );

    if (imgIdx === -1) {
      console.warn(
        "No fallback image found in the children of a <picture> component. A fallback image should be passed to ensure the image renders correctly at all dimensions."
      );
    } else if (imgIdx !== _children.length - 1) {
      // found one, need to move it to the end
      _children.splice(_children.length - 1, 0, _children.splice(imgIdx, 1)[0]);
    }

    return <picture children={_children} />;
  }
}
PictureImpl.displayName = "ReactImgixPicture";

const Picture = compose(ShouldComponentUpdateHOC)(PictureImpl);

class SourceImpl extends Component {
  static propTypes = {
    ...SHARED_IMGIX_AND_SOURCE_PROP_TYPES
    // TODO: add media?
  };
  render() {
    const { children, disableSrcSet, type, width, height } = this.props;

    const imgProps = this.props.imgProps || {};

    const { src, srcSet } = buildSrc({
      ...this.props,
      type: "source",
      imgixParams: imgixParams(this.props)
    });

    let childProps = {
      ...this.props.imgProps,
      sizes: this.props.sizes,
      className: this.props.className,
      width: width <= 1 ? null : width,
      height: height <= 1 ? null : height
    };
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

    return <source {...childProps} />;
  }
}
SourceImpl.displayName = "ReactImgixSource";

const Source = compose(ShouldComponentUpdateHOC)(SourceImpl);

export {
  Picture,
  Source,
  SourceImpl as __SourceImpl, // for testing
  PictureImpl as __PictureImpl // for testing
};
