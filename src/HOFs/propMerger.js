import React from 'react'
import { useImgixContext } from "../HOCs"

/**
 * Merges the `src` object into the `destination` object. Destination values are
 * overwritten by source values. Source properties that resolve to `undefined` 
 * are skipped if a destination value exists.
 * 
 * @param {Object} src - The Provider component's props object
 * @param {Object} destination - The child component's props object
 * @returns Object with the combined values from `src` & `destination` Objects
 * @example
 * let src = {foo: 'bar'}
 * let destination = {foo: 'baz', bar: 'baz'}
 * let result = mergeProps(src, destination)
 * result => {foo: 'bar', bar: 'baz'}
 * 
 */
export function mergeProps(src = {}, destination = {}) {
  // ensure the arguments are not modified
  Object.freeze(src);
  Object.freeze(destination);

  const newProps = { ...destination }

  for (const [k, v] of Object.entries(src)) {
    if (newProps[k] == null) {
      newProps[k] = v;
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

  if (contextProps === undefined) {
    return <Component {...props} />
  }

  const childProps = mergeProps(contextProps, props);
  return <Component {...childProps} />;
}
