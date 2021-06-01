import * as React from 'react'
import { PARAMS_EXP_MAP } from "./constants"

/**
 * Creates a 1-step, or complete, URL from `domain` and `src` Strings.
 *
 * - First, the function checks if src has a defined `domain`. If it does, it 
 * checks to see if `src` has a scheme, and prepends "http" or "https" as needed
 * - Otherwise, formatSrc formats `domain` and `src` Strings.
 *   - First it strips the two strings of the  leading and `/` or trailing `/` 
 *     slash characters.
 *   - Then, it joins the two strings on a `/` character. IE, 
 *    `strippedDomain + "/" + strippedSrc`.
 *   - If `domain` String argument `null` or `undefined`, the function returns
 *    the original `src` String.
 *
 * @param {String} src - URL that is either 1-step or 2-step
 * @param {String} domain - Domain string, optional
 * @returns 1-step, or complete, URL String. Ex, _assets.ix.net/foo/bar.jpg_
 */
export function formatSrc(src, domain, useHTTPS = true) {
  // ignore if already has protocol
  if (src.indexOf("://") !== -1){
    return src
  } else {
    let strippedDomain = domain ? domain.replace(/^\/|\/$/g, '') : ""
    let strippedSrc = src.replace(/^\/|\/$/g, '')
    return domain ? "https://" +  strippedDomain + "/" + strippedSrc : src
  }
}

/**
 * A function that formats the following values in the props Object:
 *
 * - `width`: if negative gets set to `null`.
 * - `height`: if negative gets set to `null`.
 * - `src`: concatenated to `domain` if `src` defined and has no domain.
 *
 * @param {Object} props 
 * @returns A formatted `props` Object.
 */
export const formatProps = (props) => {
  const width = !props.width || props.width <= 1 ? null : props.width
  const height = !props.height || props.height <= 1 ? null : props.height
  const src = props.src ? formatSrc(props.src, props.domain) : null

  return Object.assign( {}, props, { width, height, src,} )
}

/**
 * Function that shortens params keys according to the imgix spec.
 * @param {Object} params - imgixParams object
 * @returns imgixParams object with shortened keys
 * @see https://www.imgix.com/docs/reference
 */
export const collapseImgixParams = (params) => {
  if (params == null) {
    return params;
  }
  const compactedParams = {}
  for (const [k, v] of Object.entries(params)) {
    if (PARAMS_EXP_MAP[k]) {
      compactedParams[PARAMS_EXP_MAP[k]] = v
    } else {
      compactedParams[k] = v
    }
  }
  return compactedParams
}

/**
 * `processPropsHOF` takes a Component's props and formats them to adhere to the 
 * ImgixClient's specifications.
 * 
 * @param {React.Element<typeof Component>} Component - A react component with
 * defined `props`.
 * @returns A React Component who's `props` have been formatted and 
 * `imgixParams` have been collapsed.
 */
export const processPropsHOF = (Component) => (props) => {
  const formattedProps = formatProps(props)
  const formattedImgixParas = collapseImgixParams(formattedProps.imgixParams)

  return <Component {...formattedProps} imgixParams={formattedImgixParas} />
}