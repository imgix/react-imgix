import React from "react";
import Measure, { withContentRect } from "react-measure";
import constructUrl from "./constructUrl";
import targetWidths from "./targetWidths";
import findClosest from "./findClosest";

const PACKAGE_VERSION = require("../package.json").version;

const noop = () => {};

const findNearestWidth = actualWidth => findClosest(actualWidth, targetWidths);

const toFixed = (dp, value) => +value.toFixed(dp);

const BackgroundImpl = props => {
  const {
    measureRef,
    measure,
    contentRect,
    imgixParams = {},
    onLoad,
    disableLibraryParam,
    src,
    children,
    className = ""
  } = props;
  const { w: forcedWidth, h: forcedHeight } = imgixParams;
  const hasDOMDimensions = contentRect.bounds.top != null;
  const htmlAttributes = props.htmlAttributes || {};
  const dpr = toFixed(2, imgixParams.dpr || global.devicePixelRatio || 1);
  const ref = htmlAttributes.ref;
  const onRef = el => {
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
  const isReady = width != null && height != null;

  const commonProps = {
    ...htmlAttributes
  };

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
    const srcOptions = {
      fit: "crop",
      ...imgixParams,
      ...(disableLibraryParam ? {} : { ixlib: `react-${PACKAGE_VERSION}` }),
      width,
      height,
      dpr
    };

    return constructUrl(src, srcOptions);
  })();

  const style = {
    ...htmlAttributes.style,
    backgroundImage: `url(${renderedSrc})`,
    backgroundSize:
      (htmlAttributes.style || {}).backgroundSize !== undefined
        ? htmlAttributes.style.backgroundSize
        : "cover"
  };

  return (
    <div {...commonProps} className={className} ref={onRef} style={style}>
      {children}
    </div>
  );
};
const Background = withContentRect("bounds")(BackgroundImpl);

export { Background, BackgroundImpl as __BackgroundImpl };
