import { mount } from "enzyme";
import React from "react";
import ReactImgix from "../../src/index";

const imageProps = {
  src: "https://assets.imgix.net/examples/pione.jpg",
  sizes: "50vw",
  disableSrcSet: true,
  disableLibraryParam: true,
};

describe("ReactImgix", () => {
  test("should set alt prop on the react component", () => {
    const component = <ReactImgix {...imageProps} alt="a cute dog" />;

    const expectedImageTagProps = {
      alt: "a cute dog",
      sizes: "50vw",
      className: undefined,
      width: undefined,
      height: undefined,
      src: "https://assets.imgix.net/examples/pione.jpg?auto=format",
    };

    const renderedComponent = mount(component);
    const renderedImageTagProps = renderedComponent.find("img").props();

    expect(renderedImageTagProps).toEqual(expectedImageTagProps);
  });
});
