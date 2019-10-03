import React, { Component } from "react";
import PropTypes from "prop-types";

import { warning } from "../common";

const DEPRECATED_PROPS = ["auto", "crop", "fit"];
const deprecatePropsHOC = WrappedComponent => {
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
    ...WrappedComponent.propTypes,
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
  WithDeprecatedProps.displayName = `WithDeprecatedProps(${WrappedComponent.displayName})`;

  return WithDeprecatedProps;
};

export { deprecatePropsHOC };
