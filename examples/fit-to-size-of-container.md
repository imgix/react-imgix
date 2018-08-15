# Fit to size of container

This example is designed to implement the behaviour of react-imgix v7 and below. This behaviour was removed in v8 as `sizes` was a browser standard, and also worked with server rendering. Here is a way it can be implemented in user-land while still using react-imgix.

This example is hosted on CodeSandbox so you can play around with it: https://codesandbox.io/s/wjk9j0wow

The relevant parts of this are copied here:

```js
import { withContentRect } from "react-measure";
import Imgix from "react-imgix";

const ReactiveImgix = withContentRect("bounds")(
  ({ measureRef, measure, contentRect, ...other }) => {
    if (!contentRect.bounds.height) {
      return (
        <img
          ref={measureRef}
          {...other.imgProps}
          // This url should work in all browsers that react-imgix used to support.
          src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
        />
      );
    }
    const { height, width } = contentRect.bounds;
    return (
      <Imgix
        height={height}
        width={width}
        {...other}
        htmlAttributes={{ ref: measureRef, ...other.imgProps }}
      />
    );
  }
);

function App() {
  return (
    <div className="App">
      <h1>React-Imgix fluid example</h1>
      <h2>
        Play around with the browser size or the sizes in styles.css to see the
        image below respond.
      </h2>
      <ReactiveImgix src="//assets.imgix.net/examples/pione.jpg" />
    </div>
  );
}
```
