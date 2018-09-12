import Imgix from "react-imgix";

import React from "react";
import { mount, shallow } from "enzyme";

const src = "https://assets.imgix.net/examples/pione.jpg";
let containerDiv;
beforeEach(() => {
  containerDiv = global.document.createElement("div");
  global.document.body.appendChild(containerDiv);
});

afterEach(() => {
  global.document.body.removeChild(containerDiv);
});

const renderIntoContainer = element => {
  return mount(element, { attachTo: containerDiv });
};

const renderAndWaitForImageLoad = async element => {
  return new Promise((resolve, reject) => {
    let renderedEl;
    const elementWithOnMounted = React.cloneElement(element, {
      onMounted: () => {},
      htmlAttributes: {
        ...(element.props.htmlAttributes || {}),
        onLoad: () => {
          setImmediate(() => resolve(renderedEl));
        }
      }
    });
    renderedEl = renderIntoContainer(elementWithOnMounted);
  });
};

describe("When in default mode", () => {
  const renderImage = () =>
    renderIntoContainer(<Imgix src={src} sizes="100px" />);

  it("an <img> should be rendered", () => {
    expect(renderImage().find("img")).toHaveLength(1);
  });
  it("the rendered element's src should be set", () => {
    expect(
      renderImage()
        .find("img")
        .props().src
    ).toContain(src);
  });

  it("should render properly with an alt tag set", async () => {
    const renderedImage = await renderAndWaitForImageLoad(
      <Imgix
        src={`${src}`}
        sizes="532px"
        htmlAttributes={{
          alt: "This is alt text"
        }}
      />
    );

    let { width, height } = renderedImage.getDOMNode().getBoundingClientRect();

    expect({
      width: Math.round(width),
      height: Math.round(height)
    }).toMatchObject({
      width: 532,
      height: 800
    });
  });
});

function injectScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.async = true;
    script.src = src;
    script.addEventListener("load", () => resolve(script));
    script.addEventListener("error", () => reject("Error loading script."));
    script.addEventListener("abort", () => reject("Script loading aborted."));
    document.head.appendChild(script);
  });
}

describe("Lazysizes support", () => {
  it("lazy loading", async () => {
    const script = await injectScript(
      "https://cdnjs.cloudflare.com/ajax/libs/lazysizes/4.1.2/lazysizes.min.js"
    );
    const component = (
      <Imgix
        className="lazyload"
        src={src}
        width={100}
        height={100}
        attributeConfig={{
          src: "data-src",
          srcSet: "data-srcset",
          sizes: "data-sizes"
        }}
      />
    );

    const renderedImage = renderIntoContainer(component);
    const renderedImageElement = renderedImage.getDOMNode();
    lazySizes.loader.unveil(renderedImageElement);
    await new Promise(resolve => setTimeout(resolve, 1)); // Timeout allows DOM to update

    const actualSrc = renderedImageElement.getAttribute("src");
    const actualSrcSet = renderedImageElement.getAttribute("srcset");

    expect(actualSrc).toContain(src);
    expect(actualSrcSet).toContain(src);

    document.head.removeChild(script);
  });

  it("LQIP", async () => {
    const script = await injectScript(
      "https://cdnjs.cloudflare.com/ajax/libs/lazysizes/4.1.2/lazysizes.min.js"
    );
    const lqipSrc = `${src}?w=10&h=10`;
    const component = (
      <Imgix
        className="lazyload"
        src={src}
        width={100}
        height={100}
        attributeConfig={{
          src: "data-src",
          srcSet: "data-srcset",
          sizes: "data-sizes"
        }}
        htmlAttributes={{
          src: lqipSrc
        }}
      />
    );

    const renderedImage = renderIntoContainer(component);
    const renderedImageElement = renderedImage.getDOMNode();

    let actualSrc = renderedImageElement.src;
    expect(actualSrc).toBe(lqipSrc);

    lazySizes.loader.unveil(renderedImageElement);
    await new Promise(resolve => setTimeout(resolve, 8000)); // Timeout allows DOM to update

    actualSrc = renderedImageElement.getAttribute("src");
    const actualSrcSet = renderedImageElement.getAttribute("srcset");

    expect(actualSrc).toContain(src);
    expect(actualSrcSet).toContain(src);

    document.head.removeChild(script);
  }).timeout(10000);
});
