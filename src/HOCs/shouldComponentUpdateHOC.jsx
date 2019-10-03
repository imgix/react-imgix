import React, { Component } from "react";

import { warning, shallowEqual } from "../common";

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
        if (key === "htmlAttributes") {
          return shallowEqual(oldProp, newProp);
        }
        if (key === "attributeConfig") {
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
  ShouldComponentUpdateHOC.displayName = `ShouldComponentUpdateHOC(${WrappedComponent.displayName})`;
  return ShouldComponentUpdateHOC;
};

export { ShouldComponentUpdateHOC };
