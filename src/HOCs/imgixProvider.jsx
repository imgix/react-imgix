import React, { useContext, createContext } from 'react'

const ImgixContext = createContext()

/**
 * `useImgixContext()` tries to invoke `React.useContext()`. If context is 
 * `undefined`, we know that the context is being accessed outside of a 
 * provider, and therefore throw an `Error`.
 * @returns Hook that gets context value from the nearest`ImgixProvider`.
 */
function useImgixContext() {
  return useContext(ImgixContext)
}

/**
 * Creates a Provider component that passes `reactImgixProps` as the Context 
 * for child components who use the `useImgixContext()` custom hook or 
 * `React.useContext()` API.
 * @param {React.Element <typeof Component>} children 
 * @param {Object} reactImgixProps 
 * @returns Component
 */
function ImgixProvider({children, ...reactImgixProps}) {
  const value = reactImgixProps

  if ( children == null || children.length < 1) {
    console.error("ImgixProvider must have at least one Imgix child component")
  }
  return <ImgixContext.Provider value={value}>{children}</ImgixContext.Provider>
}


//TODO(luis): do we still need this?
// const propsProcessorHOF = (Component) => (props) => {
//   const collapsedImgixParams = collapseImgixParam(props.imgixParams);
//   return <Component {...props} imgixParams={collapsedImgixParams} />
// }

export {ImgixProvider, useImgixContext}

