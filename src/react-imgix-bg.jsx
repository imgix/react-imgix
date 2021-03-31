import React from "react";
import Measure, { withContentRect } from "react-measure";
import { PACKAGE_VERSION } from './constants';
import constructUrl from "./constructUrl";
import extractQueryParams from "./extractQueryParams";
import findClosest from "./findClosest";
import targetWidths from "./targetWidths";


const noop = () => {};

const findNearestWidth = (actualWidth) =>
  findClosest(actualWidth, targetWidths);

const toFixed = (dp, value) => +value.toFixed(dp);

const BackgroundImpl = (props) => {
  const {
    measureRef,
    measure,
    contentRect,
    imgixParams = {},
    onLoad,
    disableLibraryParam,
    src,
    children,
    className = "",
  } = props;
  const { w: forcedWidth, h: forcedHeight } = imgixParams;
  const hasDOMDimensions =
    contentRect.bounds.width != null && contentRect.bounds.height != null;
  const htmlAttributes = props.htmlAttributes || {};
  const dpr = toFixed(2, imgixParams.dpr || global.devicePixelRatio || 1);
  const ref = htmlAttributes.ref;
  const onRef = (el) => {
    measureRef(el);
    if (typeof ref === "function") {
      ref(el);
    }
  };

  const { width, height } = (() => {
    const bothWidthAndHeightPassed =
      forcedWidth != null && forcedHeight != null;

    if (bothWidthAndHeightPassed) {
      return { width: forcedWidth, height: forcedHeight };
    }

    if (!hasDOMDimensions) {
      return { width: undefined, height: undefined };
    }
    const ar = contentRect.bounds.width / contentRect.bounds.height;

    const neitherWidthNorHeightPassed =
      forcedWidth == null && forcedHeight == null;
    if (neitherWidthNorHeightPassed) {
      const width = findNearestWidth(contentRect.bounds.width);
      const height = Math.ceil(width / ar);
      return { width, height };
    }
    if (forcedWidth != null) {
      const height = Math.ceil(forcedWidth / ar);
      return { width: forcedWidth, height };
    } else if (forcedHeight != null) {
      const width = Math.ceil(forcedHeight * ar);
      return { width, height: forcedHeight };
    }
  })();

  const commonProps = {
    ...htmlAttributes,
  };

  const isReady = width != null && height != null;
  if (!isReady) {
    return (
      <div
        {...commonProps}
        className={`react-imgix-bg-loading ${className}`}
        ref={onRef}
      >
        {children}
      </div>
    );
  }

  const renderedSrc = (() => {
    const [rawSrc, params] = extractQueryParams(src);
    const srcOptions = {
      ...params,
      fit: "crop",
      ...imgixParams,
      ...(disableLibraryParam ? {} : { ixlib: `react-${PACKAGE_VERSION}` }),
      width,
      height,
      dpr,
    };

    return constructUrl(rawSrc, srcOptions);
  })();

  const style = {
    ...htmlAttributes.style,
    backgroundImage: `url(${renderedSrc})`,
    backgroundSize:
      (htmlAttributes.style || {}).backgroundSize !== undefined
        ? htmlAttributes.style.backgroundSize
        : "cover",
  };

  return (
    <div {...commonProps} className={className} ref={onRef} style={style}>
      {children}
    </div>
  );
};

export class NewBackground extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dimensions: {
        width: 2,
        height: 2,
      },
    };
  }

  shouldComponentUpdate(_nextProps, nextState) {
    return this.state.dimensions.width !== nextState.dimensions.width;
  }

  render() {
    if (!(this.props.width || (this.props.width && this.props.height))) {
      return (
        <div
          {...this.props.htmlAttributes}
          className={`${this.props.className} react-imgix-bg-loading`}
        >
          {this.props.children}
        </div>
      );
    }

    const { width, height } = this.state.dimensions;
    const [rawSrc, params] = extractQueryParams(this.props.src);

    /* Idk if we should be spreading arbitrary props... anywhere...?
    ** For possible <noscript> reasons? */
    const srcOptions = {
      ...params,
      fit: "crop",
      ...this.props.imgixParams, /* !!! */
      ...(this.props.disableLibraryParam ? {} : { ixlib: `react-${PACKAGE_VERSION}` }),
      ...width, /* !!! */
      ...height, /* !!! */
    };

    const imgURL = constructUrl(rawSrc, srcOptions);

    const style = {
      ...(this.htmlAttributes ? this.htmlAttributes.style : {}),
      /* Apply border-box to make widths inclusive of padding, etc. */
      boxSizing: "border-box",
      /* Apply 2px border for debugging. */
      border: "2px solid magenta",
      backgroundImage: `url(${imgURL})`,
    };

    return (
      <Measure
        bounds
        onResize={(contentRect) => {
          this.setState({
            dimensions: {
              // Only care about `width` and `height` for now
              width: contentRect.bounds.width,
              height: contentRect.bounds.height,
            },
          });
        }}
      >
        {({ measureRef }) => (
          <div ref={measureRef} style={style} className={this.props.className}>
            {width}, {height}
            {this.props.children}
          </div>
        )}
      </Measure>
    );
  }
}
const Background = withContentRect("bounds")(NewBackground);

export { Background, NewBackground as __BackgroundImpl };
