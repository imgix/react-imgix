import { mount } from "enzyme";
import React from "react";
import ReactImgix, { ImgixProvider, Source, Background } from "../../src/index";

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

  test("Background should not encode the src path if disablePathEncoding is set to true", () => {
    const encodedSrc =
      "https://sdk-test.imgix.net/%26%24%2B%2C%3A%3B%3D%3F%40%23.jpg";
    // Force BG to render immediately by giving it w,h params, contentRect bounds
    // and a measureRef that points to null
    const component = (
      <Background
        className="bg-test"
        src={encodedSrc}
        disablePathEncoding
        disableLibraryParam
        measureRef={() => null}
        imgixParams={{ w: 100, h: 100 }}
        contentRect={{ bounds: { top: 10, width: 100, height: 100 } }}
      >
        <div>Content</div>
      </Background>
    );
    const expectedBgUrl = `url(${encodedSrc}?fit=crop&w=100&h=100&dpr=1)`;

    const renderedComponent = mount(component);
    const renderedBg = renderedComponent.find("div.bg-test").props();

    expect(renderedBg.style.backgroundImage).toMatch(expectedBgUrl);
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
