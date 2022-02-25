import { mount } from "enzyme";
import React from "react";
import ReactImgix, { ImgixProvider, Source } from "../../src/index";

const imageProps = {
  src: "https://assets.imgix.net/examples/space bridge.jpg",
};

describe("ReactImgix", () => {
  test("should encode src path", () => {
    const component = <ReactImgix {...imageProps} />;

    const expectedSrc = "https://assets.imgix.net/examples/space%20bridge.jpg";

    const renderedComponent = mount(component);
    const renderedImageTagProps = renderedComponent.find("img").props();

    expect(renderedImageTagProps.src).toMatch(expectedSrc);
  });
  test("should not encode the src path if disablePathEncoding is set to true", () => {
    const component = <ReactImgix {...imageProps} disablePathEncoding />;

    const expectedSrc = "https://assets.imgix.net/examples/space bridge.jpg";

    const renderedComponent = mount(component);
    const renderedImageTagProps = renderedComponent.find("img").props();

    expect(renderedImageTagProps.src).toMatch(expectedSrc);
  });
  test("should encode the srcset", () => {
    const component = <ReactImgix {...imageProps} />;

    const expectedSrc = "https://assets.imgix.net/examples/space%20bridge.jpg";

    const renderedComponent = mount(component);
    const renderedImageTagProps = renderedComponent.find("img").props();

    expect(renderedImageTagProps.srcSet).toMatch(expectedSrc);
  });
  test("should not encode the srcset if disablePathEncoding is set to true", () => {
    const component = <ReactImgix {...imageProps} disablePathEncoding />;

    const expectedSrc = "https://assets.imgix.net/examples/space bridge.jpg";

    const renderedComponent = mount(component);
    const renderedImageTagProps = renderedComponent.find("img").props();

    expect(renderedImageTagProps.srcSet).toMatch(expectedSrc);
  });
  it("should not encode the src or srcset path if disablePathEncoding is set on <ImgixProvider>", () => {
    const providerProps = {
      disablePathEncoding: true,
    };
    const wrappedComponent = (
      <ImgixProvider {...providerProps}>
        <ReactImgix {...imageProps} />
      </ImgixProvider>
    );

    const expectedSrc = "https://assets.imgix.net/examples/space bridge.jpg";

    const renderedComponent = mount(wrappedComponent);
    const renderedImageTagProps = renderedComponent.find("img").props();
    expect(renderedImageTagProps.src).toMatch(expectedSrc);
    expect(renderedImageTagProps.srcSet).toMatch(expectedSrc);
  });
});
describe("Source", () => {
  test("should encode srcSet path", () => {
    const component = <Source {...imageProps} />;

    const expectedSrc = "https://assets.imgix.net/examples/space%20bridge.jpg";

    const renderedComponent = mount(component);
    const renderedSourceTagProps = renderedComponent.find("source").props();

    expect(renderedSourceTagProps.srcSet).toMatch(expectedSrc);
  });
  test("should not encode the srcSet path if disablePathEncoding is set to true", () => {
    const component = <Source {...imageProps} disablePathEncoding />;

    const expectedSrc = "https://assets.imgix.net/examples/space bridge.jpg";

    const renderedComponent = mount(component);
    const renderedSourceTagProps = renderedComponent.find("source").props();

    expect(renderedSourceTagProps.srcSet).toMatch(expectedSrc);
  });
  test("should encode the srcset path if disableSrcSet is true", () => {
    const component = <Source {...imageProps} disableSrcSet />;

    const expectedSrc = "https://assets.imgix.net/examples/space%20bridge.jpg";

    const renderedComponent = mount(component);
    const renderedSourceTagProps = renderedComponent.find("source").props();

    expect(renderedSourceTagProps.srcSet).toMatch(expectedSrc);
  });
  test("should not encode the srcset path if disablePathEncoding and disableSrcSet are set to true", () => {
    const component = (
      <Source {...imageProps} disableSrcSet disablePathEncoding />
    );

    const expectedSrc = "https://assets.imgix.net/examples/space bridge.jpg";

    const renderedComponent = mount(component);
    const renderedSourceTagProps = renderedComponent.find("source").props();

    expect(renderedSourceTagProps.srcSet).toMatch(expectedSrc);
  });
});
