import Imgix from "react-imgix";
import * as ReactDOM from "react-dom";
import { Background } from "react-imgix-bg";
import targetWidths from "targetWidths";

import React from "react";
import { mount, shallow } from "enzyme";

const src = "https://assets.imgix.net/examples/pione.jpg";
let containerDiv;
let sut;
beforeEach(() => {
  containerDiv = global.document.createElement("div");
  global.document.body.appendChild(containerDiv);
});

afterEach(() => {
  global.document.body.removeChild(containerDiv);
});

const fullRender = markup => {
  return ReactDOM.render(markup, containerDiv);
};

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

describe("Background Mode", () => {
  const shouldBehaveLikeBg = function(size = "cover") {
    it("the element should have backgroundImage and backgroundSize set", () => {
      expect(sut.getDOMNode().style).toMatchObject({
        backgroundImage: expect.stringContaining(src),
        backgroundSize: size
      });
    });
  };
  it("renders a div", () => {
    const sut = renderIntoContainer(<Background src={src} />);

    expect(sut.getDOMNode().tagName).toBe("DIV");
  });
  it("sets the size of the background image to the size of the containing element", async () => {
    const targetWidth = 200;
    const sut = await new Promise((resolve, reject) => {
      const el = (
        <div>
          <style>{`.bg-img { width: ${targetWidth}px; height: 250px}`}</style>
          <Background
            src={`${src}`}
            onMounted={() => {}}
            htmlAttributes={{}}
            className="bg-img"
          >
            <div>Content</div>
          </Background>
        </div>
      );
      const renderedEl = renderIntoContainer(el);
      setTimeout(() => resolve(renderedEl), 1000);
    });

    const container = sut.find(".bg-img");

    const bgImageSrc = container
      .first()
      .getDOMNode()
      .style.backgroundImage.slice(5, -2);

    const bgImageSrcURL = new URL(bgImageSrc);

    const closestWidthFromTargetWidths = targetWidths.reduce(
      (acc, value, i) => {
        // <= ensures that the largest value is used
        if (Math.abs(value - targetWidth) <= Math.abs(acc - targetWidth)) {
          return value;
        }
        return acc;
      },
      Number.MAX_VALUE
    );
    console.log("closestWidthFromTargetWidths", closestWidthFromTargetWidths);

    expect(bgImageSrcURL.searchParams.get("w")).toBe("200");
    expect(bgImageSrcURL.searchParams.get("h")).toBe("250");
    expect(bgImageSrcURL.searchParams.get("fit")).toBe("crop");
  });
  it("useds width and height from props, when provided", async () => {
    const sut = await new Promise((resolve, reject) => {
      const el = (
        <div>
          <style>{`.bg-img { width: 200px; height: 250px}`}</style>
          <Background
            src={`${src}`}
            width={300}
            height={350}
            className="bg-img"
          >
            <div>Content</div>
          </Background>
        </div>
      );
      const renderedEl = renderIntoContainer(el);
      setTimeout(() => resolve(renderedEl), 1000);
    });

    const container = sut.find(".bg-img").first();

    const bgImageSrc = container
      .getDOMNode()
      .style.backgroundImage.slice(5, -2);

    const bgImageSrcURL = new URL(bgImageSrc);

    expect(bgImageSrcURL.searchParams.get("w")).toBe("300");
    expect(bgImageSrcURL.searchParams.get("h")).toBe("350");
    expect(container.getDOMNode().style.width).toBe("300px");
    expect(container.getDOMNode().style.height).toBe("350px");
  });

  describe("without the backgroundSize prop set", () => {
    beforeEach(async () => {
      sut = await new Promise((resolve, reject) => {
        const el = (
          <Background
            src={src}
            htmlAttributes={{ style: { backgroundSize: null } }}
          />
        );
        const renderedEl = renderIntoContainer(el);
        setTimeout(() => resolve(renderedEl), 1000);
      });
    });
    shouldBehaveLikeBg("");
  });

  describe("with the backgroundSize prop set to 'contain'", () => {
    beforeEach(async () => {
      sut = await new Promise((resolve, reject) => {
        const el = (
          <Background
            src={src}
            htmlAttributes={{ style: { backgroundSize: "contain" } }}
          />
        );
        const renderedEl = renderIntoContainer(el);
        setTimeout(() => resolve(renderedEl), 1000);
      });
    });
    shouldBehaveLikeBg("contain");
  });

  it("uses a width from targetWidths?");
  it("respects className", () => {
    const sut = renderIntoContainer(
      <Background src={src} className="custom-class-name" />
    );

    expect(sut.getDOMNode().className).toBe("custom-class-name");
  });
  it("can disable library param");
  it("can override html properties");
  it("onMounted?");

  it("dpr scaling?");
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
  let script;
  beforeEach(async () => {
    script = await injectScript(
      "https://cdnjs.cloudflare.com/ajax/libs/lazysizes/4.1.2/lazysizes.min.js"
    );
  });
  afterEach(async () => {
    document.head.removeChild(script);
    script = null;
  });
  it("lazy loading", async () => {
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
  });

  it("LQIP", async () => {
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
    await new Promise((resolve, reject) => {
      const mutationObserver = new MutationObserver(function(mutations) {
        actualSrc = renderedImageElement.getAttribute("src");
        const actualSrcSet = renderedImageElement.getAttribute("srcset");

        expect(actualSrc).toContain(src);
        expect(actualSrcSet).toContain(src);
        resolve();
      });

      mutationObserver.observe(renderedImageElement, {
        attributes: true
      });

      let actualSrc = renderedImageElement.src;
      expect(actualSrc).toBe(lqipSrc);

      lazySizes.loader.unveil(renderedImageElement);
    });
  }).timeout(10000);
});
