import React from "react";
import Measure, { withContentRect } from "react-measure";
import constructUrl from "./constructUrl";
import targetWidths from "./targetWidths";
const PACKAGE_VERSION = require("../package.json").version;

const findNearestWidth = actualWidth =>
  targetWidths.reduce((currentCandidate, candidateWidth) => {
    // <= ensures that the largest value is used
    if (
      Math.abs(candidateWidth - actualWidth) <=
      Math.abs(currentCandidate - actualWidth)
    ) {
      return candidateWidth;
    }
    return currentCandidate;
  }, Number.MAX_VALUE);

const BackgroundImpl = props => {
  // TODO: Should width and height go in imgixParams, or as a top-level prop
  const {
    measureRef,
    measure,
    contentRect,
    imgixParams = {},
    onLoad,
    disableLibraryParam,
    src,
    children,
    className,
    width: forcedWidth,
    height: forcedHeight
  } = props;
  // const { w: forcedWidth, h: forcedHeight } = imgixParams;
  const isLoaded = contentRect.bounds.top != null;
  const imgProps = props.imgProps || {};
  const htmlAttributes = props.htmlAttributes || {};

  // console.log("-------------------------------------------");
  // console.log("isLoaded", isLoaded);
  if (!isLoaded) {
    return (
      <div className={className} ref={measureRef}>
        {children}
      </div>
    );
  }

  // const fixed

  const width =
    forcedWidth != null
      ? forcedWidth
      : // : findNearestWidth(contentRect.bounds.width);
        contentRect.bounds.width;
  const height =
    forcedHeight != null ? forcedHeight : contentRect.bounds.height;

  const renderedSrc = (() => {
    if (!isLoaded) {
      return undefined;
    }

    const srcOptions = {
      ...imgixParams,
      ...(disableLibraryParam ? {} : { ixlib: `react-${PACKAGE_VERSION}` }),
      width,
      height,
      fit: "crop",
      backgroundSize: "cover"
    };

    return constructUrl(src, srcOptions);
  })();

  // console.log("htmlAttributes", htmlAttributes);
  const style = {
    ...htmlAttributes.style,
    backgroundImage: `url(${renderedSrc})`,
    backgroundSize:
      (htmlAttributes.style || {}).backgroundSize !== undefined
        ? htmlAttributes.style.backgroundSize
        : "cover",
    ...(forcedHeight != null ? { height: forcedHeight } : {}),
    ...(forcedWidth != null ? { width: forcedWidth } : {})
  };

  return (
    <div
      className={className}
      ref={measureRef}
      {...props.htmlAttributes}
      style={style}
    >
      {children}
    </div>
  );
};
const Background = withContentRect("bounds")(BackgroundImpl);

export { Background, BackgroundImpl as __BackgroundImpl };
