import React from "react";
import { withContentRect } from "react-measure";
import { PACKAGE_VERSION } from "./constants";
import constructUrl from "./constructUrl";
import extractQueryParams from "./extractQueryParams";
import findClosest from "./findClosest";
import targetWidths from "./targetWidths";
import { shallowEqual } from "./common";

const findNearestWidth = (actualWidth) =>
  findClosest(actualWidth, targetWidths);

const toFixed = (dp, value) => +value.toFixed(dp);

export const __shouldComponentUpdate = (props, nextProps) => {
  const contentRect = props.contentRect;
  const bounds = contentRect.bounds;
  const { width: prevWidth, height: prevHeight } = bounds;

  const nextContentRect = nextProps.contentRect;
  const nextBounds = nextContentRect.bounds;
  const { width: nextWidth, height: nextHeight } = nextBounds;

  // If neither of the previous nor next dimensions are present,
  // re-render.
  if (!nextWidth || !nextHeight || !prevWidth || !prevHeight) {
    return true;
  }

  // The component has been rendered at least twice by this point
  // and both the previous and next dimensions should be defined.
  // Only update if the nextWidth is greater than the prevWidth.
  if (prevWidth && nextWidth && nextWidth > prevWidth) {
    return true;
  }

  // Similarly, only update if the next height is greater than
  // the previous height.
  if (prevHeight && nextHeight && nextHeight > prevHeight) {
    return true;
  }

  const customizer = (oldProp, newProp, key) => {
    // these keys are ignored from prop checking process
    if (key === "contextRect" || key === "measure" || key === "measureRef") {
      return true;
    }

    if (key === "children") {
      return oldProp == newProp;
    }

    if (key === "imgixParams") {
      return shallowEqual(oldProp, newProp, (a, b) => {
        if (Array.isArray(a)) {
          return shallowEqual(a, b);
        }
        return undefined;
      });
    }

    if (key === "htmlAttributes") {
      return shallowEqual(oldProp, newProp);
    }

    return undefined; // handled by shallowEqual
  };

  // If we made it here, we need to check if the "top-level"
  // props have changed (e.g. disableLibraryParam).
  const propsEqual = shallowEqual(props, nextProps, customizer);

  return !(propsEqual);
}

class BackgroundImpl extends React.Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps) {
    return __shouldComponentUpdate(this.props, nextProps);
  }

  render() {
    const {
      measureRef,
      contentRect,
      imgixParams = {},
      onLoad,
      disableLibraryParam,
      src,
      children,
      className = "",
    } = this.props;
    const { w: forcedWidth, h: forcedHeight } = imgixParams;
    const hasDOMDimensions =
      contentRect.bounds.width != null && contentRect.bounds.height != null;
    const htmlAttributes = this.props.htmlAttributes || {};
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
    const isReady = width != null && height != null;

    const commonProps = {
      ...htmlAttributes,
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
  }
}
const Background = withContentRect("bounds")(BackgroundImpl);

export { Background, BackgroundImpl as __BackgroundImpl };
