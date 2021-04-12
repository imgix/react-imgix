import PropTypes from "prop-types";
import React from "react";
import "./array-findindex";
import { config } from "./common";
import { buildSrc, buildChildProps } from "./constructUrl";

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

const SHARED_IMGIX_AND_SOURCE_PROP_TYPES = Object.assign(
  {},
  COMMON_PROP_TYPES,
  {
    disableQualityByDPR: PropTypes.bool,
    disableSrcSet: PropTypes.bool,
    disableLibraryParam: PropTypes.bool,
    imgixParams: PropTypes.object,
    sizes: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    src: PropTypes.string.isRequired,
  }
);

/**
 * Combines default imgix params with custom imgix params to make a imgix params config object
 */
function imgixParams(props) {
  return { ...defaultImgixParams, ...props.imgixParams };
}

/**
 * React component used to render <img> elements with Imgix
 */
class ReactImgix extends React.PureComponent {
  static propTypes = Object.assign({}, SHARED_IMGIX_AND_SOURCE_PROP_TYPES);
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

    const attributeConfig = Object.assign(
      {},
      defaultAttributeMap,
      this.props.attributeConfig
    );

    const childProps = buildChildProps(this, attributeConfig, "img");

    return <img {...childProps} />;
  }
}
ReactImgix.displayName = "ReactImgix";

/**
 * React component used to render <picture> elements with Imgix
 */
class PictureImpl extends React.PureComponent {
  static propTypes = Object.assign({}, COMMON_PROP_TYPES, {
    children: PropTypes.any,
  });
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
class SourceImpl extends React.PureComponent {
  static propTypes = Object.assign({}, SHARED_IMGIX_AND_SOURCE_PROP_TYPES);
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
    const attributeConfig = Object.assign(
      {},
      defaultAttributeMap,
      this.props.attributeConfig
    );

    const childProps = buildChildProps(this, attributeConfig, "source");

    // for now we'll take media from htmlAttributes which isn't ideal because
    //   a) this isn't an <img>
    //   b) passing objects as props means that react will always rerender
    //      since objects dont respond correctly to ===

    return <source {...childProps} />;
  }
}
SourceImpl.displayName = "ReactImgixSource";

const ReactImgixWrapped = ReactImgix;
const Picture = PictureImpl;
const Source = SourceImpl;

export default ReactImgixWrapped;
export {
  ReactImgix as __ReactImgixImpl, // for testing
  Picture,
  Source,
  SourceImpl as __SourceImpl, // for testing
  PictureImpl as __PictureImpl, // for testing
};
