import { mount } from "enzyme";
import React from "react";
import ReactImgix from "../../src/index";

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
});
