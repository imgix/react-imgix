import React, { Component } from "react";

import { warning, shallowEqual } from "../common";

const ShouldComponentUpdateHOC = (WrappedComponent) => {
  class ShouldComponentUpdateHOC extends Component {
    shouldComponentUpdate = (nextProps) => {
      const props = this.props;
      warning(
        nextProps.onMounted == this.props.onMounted,
        "props.onMounted() is changing between renders. This is probably not intended. Ensure that a class method is being passed to Imgix rather than a function that is created every render. If this is intended, ignore this warning."
      );

      const customizer = (oldProp, newProp, key) => {
        switch (key) {
          case "children":
          case "htmlAttributes":
          case "attributeConfig":
            return shallowEqual(oldProp, newProp);

          case "imgixParams":
            return shallowEqual(oldProp, newProp, (a, b) => {
              return Array.isArray(a) ? shallowEqual(a, b) : undefined;
            });

          default:
            return undefined;
        }
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
