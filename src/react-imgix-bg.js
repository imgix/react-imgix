import React from "react";
import Measure, { withContentRect } from "react-measure";
import { constructUrl } from "./constructUrl";

// class Background extends React.Component {
//   render() {
//     return <div />;

// 		return <Measure>
// 		 {({ measureRef }) => {

// 		 }}
// 		</Measure>;
//   }
// }

const Background = withContentRect("bounds")(
  ({
    measureRef,
    measure,
    contentRect,
    imgixParams,
    htmlAttributes,
    onLoad,
    disableLibraryParam
  }) => {
    const isLoaded = contentRect.bounds.top != null;
    const src = (() => {
      if (!isLoaded) {
        return undefined;
      }

      // TODO: continue from here.
      const srcOptions = {
        ...imgixParams,
        ...(disableLibraryParam ? {} : { ixlib: `react-${PACKAGE_VERSION}` }),
        ...(fixedSize && height ? { height } : {}),
        ...(fixedSize && width ? { width } : {})
      };

      return constructUrl({});
    })();

    return (
      <div ref={measureRef}>
        Some content here
        <pre>{JSON.stringify(contentRect, null, 2)}</pre>
      </div>
    );
  }
);

export { Background };
