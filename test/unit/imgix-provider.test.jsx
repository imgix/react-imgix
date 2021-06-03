import { mount, shallow } from "enzyme";
import React from "react";
import ReactImgix from "../../src/index";
import { ImgixProvider } from "../../es/HOCs/imgixProvider";

const providerProps = {
  domain: "sdk-test.imgix.net",
  sizes: "100vw",
};

const imageProps = {
  src: "https://assets.imgix.net/examples/pione.jpg",
  sizes: "50vw",
};

describe("ImgixProvider", () => {
  test("should not have context value defined if Provider has no props", () => {
    const wrappedComponent = (
      <ImgixProvider>
        <ReactImgix {...imageProps} />
      </ImgixProvider>
    );

    const expectedProps = {
      children: (
        <ReactImgix
          src="https://assets.imgix.net/examples/pione.jpg"
          sizes="50vw"
        />
      ),
      value: {},
    };

    const renderedComponent = shallow(wrappedComponent);
    expect(renderedComponent.props()).toEqual(expectedProps);
  });

  test("should set the context value to the Provider props", () => {
    const wrappedComponent = (
      <ImgixProvider {...providerProps}>
        <ReactImgix {...imageProps} />
      </ImgixProvider>
    );

    // ensure Provider value correctly set
    const expectedProps = {
      children: (
        <ReactImgix
          src="https://assets.imgix.net/examples/pione.jpg"
          sizes="50vw"
        />
      ),
      value: { domain: "sdk-test.imgix.net", sizes: "100vw" },
    };

    const renderedComponent = shallow(wrappedComponent);
    expect(renderedComponent.props()).toEqual(expectedProps);
  });

  test('should log error when has no consumers', () => {
    jest.spyOn(global.console, 'error').mockImplementation(() => {})

    const wrappedComponent = (
      <ImgixProvider {...providerProps}>
      </ImgixProvider>
    )

    shallow(wrappedComponent)

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("ImgixProvider must have at least one Imgix child component")
    );

    jest.clearAllMocks();
  })
});
