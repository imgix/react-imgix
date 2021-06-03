import React from 'react'
import { useImgixContext } from "../HOCs"

/**
 * Merges the `src` object into the `destination` object. Destination values are
 * not overwritten by source values. Destination properties that resolve to 
 * `undefined` or `null` are overwritten if a destination value exists. It 
 * recursively merges the `imgixParams` and `htmlAttributes` values.
 *
 * @param {Object} src - The Provider component's props object
 * @param {Object} destination - The child component's props object
 * @returns Object with the combined values from `src` & `destination` Objects
 *
 * @example
 *  const src = {
 *    width: 100,
 *    height: 200,
 *    imgixParams: { ar: "1:2", dpr: 2},
 *    htmlAttributes: { styles: "width: 50" }
 *  }
 *  const destination = {
 *    width: 101,
 *    height: 201,
 *    imgixParams: { dpr: 1 },
 *    htmlAttributes: { styles: "width: 100" }
 *  }
 *  const result = mergeProps(src, destination);
 *
 *  {
 *    width: 101,
 *    height: 201,
 *    imgixParams: { ar: "1:2", dpr: 1 },
 *    htmlAttributes: { styles: "width: 100" }
 *  }
 * 
 */
export const mergeProps = (src, destination) => {
  if (src == null && destination !== null) {
    return destination
  }
  if (src !== null && destination == null) {
    return src;
  }
  if (src == null && destination == null) {
    return {}
  }

  const newProps = { ...destination }

  for (const [k, v] of Object.entries(src)) {
    if (newProps[k] == null && v !== null) {
      newProps[k] = v
    }
    // recursively merge imgixParams and htmlAttributes
    if (k === "imgixParams" || k === "htmlAttributes") {
      if (v !== null) {
        newProps[k] = mergeProps(src[k], newProps[k])
      }
    }
  }
  return newProps;
}

/**
 * `mergeComponentPropsHOF` tries to invoke `React.useContext()`. If context is 
 * `undefined`, context is being accessed outside of an `ImgixContext` provider 
 * and the Component is returned as is.
 *
 * Otherwise, it merges a Component's props with the `ImgixContext` props and 
 * return a Component with the merged `props`.
 * @param {React.Element <typeof Component} Component -  with defined `props`.
 * @returns Component with merged `props`.
 */
export const mergeComponentPropsHOF = (Component) => (props) => {
  const contextProps = useImgixContext();
  if (contextProps == null) {
    return <Component {...props} />
  }

  const childProps = mergeProps(contextProps, props);
  return <Component {...childProps} />;
}
