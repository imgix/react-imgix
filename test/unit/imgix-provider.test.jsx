import { mount, shallow } from "enzyme";
import React from "react";
import ReactImgix, { ImgixProvider, Background } from "../../src/index";

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
        <Background {...imageProps} />
      </ImgixProvider>
    );

    const renderedComponent = shallow(wrappedComponent);

    // Inspect the rendered children directly
    const renderedChildren = renderedComponent.children();

    expect(renderedChildren.length).toBe(2); // Assuming you have two children
    expect(renderedChildren.at(0).props()).toEqual({
      src: 'https://assets.imgix.net/examples/pione.jpg',
      sizes: imageProps.sizes,
    });

    expect(renderedChildren.at(1).props()).toEqual({
      src: 'https://assets.imgix.net/examples/pione.jpg',
      sizes: imageProps.sizes,
    });

    expect(renderedComponent.prop('value')).toEqual({});
  });

  test("should set the context value to the Provider props", () => {
    const wrappedComponent = (
      <ImgixProvider {...providerProps}>
        <ReactImgix {...imageProps} />
        <Background {...imageProps} />
      </ImgixProvider>
    );

    const renderedComponent = shallow(wrappedComponent);

    // Inspect the rendered children directly
    const renderedChildren = renderedComponent.children();

    const expectedProps = {
      value: { domain: "sdk-test.imgix.net", sizes: "100vw" },
    };

    expect(renderedChildren.length).toBe(2); // Assuming you have two children
    expect(renderedChildren.at(0).props()).toEqual({
      src: 'https://assets.imgix.net/examples/pione.jpg',
      sizes: '50vw',
    });
    expect(renderedChildren.at(1).props()).toEqual({
      src: 'https://assets.imgix.net/examples/pione.jpg',
      sizes: '50vw',
    });

    expect(renderedComponent.prop('value')).toEqual(expectedProps.value);
  });

  test("should merge the Provider and Child props", () => {
    const modifiedProps = {
      ...imageProps,
      src: "examples/pione.jpg",
      sizes: null,
    };

    const wrappedComponent = (
      <ImgixProvider {...providerProps}>
        <ReactImgix {...modifiedProps} />
        <Background {...modifiedProps} />
      </ImgixProvider>
    );

    // ensure Provider and Child props are merged as intended
    const expectedProps = {
      domain: "sdk-test.imgix.net",
      height: undefined,
      imgixParams: undefined,
      onMounted: undefined,
      sizes: null,
      src: "https://sdk-test.imgix.net/examples/pione.jpg",
      width: undefined,
      };

      const expectedReactImgixProps = {
        ...expectedProps,
        disableSrcSet: false,
      };

      const expectedBgProps = {
        ...expectedProps,
      };

    // The order of the childAt() needs to update if number of HOCs change.
    const renderedComponent = mount(wrappedComponent); //ImgixProvider

    const renderedProps = renderedComponent
      .childAt(0) // mergePropsHOF
      .childAt(0) // processPropsHOF
      .childAt(0) // shouldComponentUpdateHOC
      .childAt(0) // ChildComponent
      .props();

      const renderedBackgroundProps = renderedComponent
      .childAt(1) // mergePropsHOF
      .childAt(0) // processPropsHOF
      .childAt(0) // withContentRect
      .props();

    // remove noop function that breaks tests
    renderedProps.onMounted = undefined;

    expect(renderedProps).toEqual(expectedReactImgixProps);
    expect(renderedBackgroundProps).toEqual(expectedBgProps);
  });

  test("should log error when has no consumers", () => {
    jest.spyOn(global.console, "error").mockImplementation(() => {});

    const wrappedComponent = <ImgixProvider {...providerProps}></ImgixProvider>;

    const expectedProps = {
      children: undefined,
      value: providerProps,
    };

    const renderedComponent = shallow(wrappedComponent);

    expect(renderedComponent.props()).toEqual(expectedProps);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining(
        "ImgixProvider must have at least one Imgix child component"
      )
    );

    jest.clearAllMocks();
  });
});
