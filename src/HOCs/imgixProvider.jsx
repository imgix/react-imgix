import React, { useContext, createContext } from 'react'

const ImgixContext = createContext()

/**
 * `useImgixContext()` tries to invoke `React.useContext()`. If no context
 * is available, this function returns `undefined`. 
 * @returns The context defined by the closest parent `ImgixProvider`.
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
 * @returns React.Element
 */
function ImgixProvider({children, ...reactImgixProps}) {
  const value = reactImgixProps

  if ( children == null || children.length < 1) {
    console.error("ImgixProvider must have at least one Imgix child component")
  }
  return <ImgixContext.Provider value={value}>{children}</ImgixContext.Provider>
}

export {ImgixProvider, useImgixContext}
