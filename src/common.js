export { default as warning } from "warning";
export { default as shallowEqual } from "shallowequal";
export { default as config } from "./config";

// Taken from https://github.com/reduxjs/redux/blob/v4.0.0/src/compose.js
export function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}
