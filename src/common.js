export { default as CONSTANTS } from "./constants";
export { default as warning } from "warning";
export { default as shallowEqual } from "shallowequal";

// Taken from https://github.com/reduxjs/redux/blob/master/src/compose.js
export function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}