import Imgix from "react-imgix";
import * as ReactDOM from "react-dom";
import { Background } from "react-imgix-bg";
import targetWidths from "targetWidths";
import Uri from "jsuri";

import React from "react";
import { mount, shallow } from "enzyme";

const isIE = (() => {
  const ua = window.navigator.userAgent;
  const isIE = /MSIE|Trident/.test(ua);
  return isIE;
})();

const src = "https://assets.imgix.net/examples/pione.jpg";

const DELAY = 70;
const findClosestWidthFromTargetWidths = (targetWidth) =>
  targetWidths.reduce((acc, value, i) => {
    // <= ensures that the largest value is used
    if (Math.abs(value - targetWidth) <= Math.abs(acc - targetWidth)) {
      return value;
    }
    return acc;
  }, Number.MAX_VALUE);
const findURIfromSUT = (sut) => {
  const container = sut.find(".bg-img").first();

  if (!container) {
    throw new Error("Cannot find container.");
  }

  const bgImageStyle = container.getDOMNode().style;

  if (!bgImageStyle.backgroundImage) {
    throw new Error(
      "Cannot find style.background-image on background div. The element probably hasn't had time to measure the size of the DOM element."
    );
  }

  const bgImageSrc = (() => {
    const bgImage = bgImageStyle.backgroundImage;
    // Mobile Safari trims speech marks from url('') styles, so this checks if they've been trimmed or not
    if (bgImage.startsWith('url("') || bgImage.startsWith("url('")) {
      return bgImageStyle.backgroundImage.slice(5, -2);
    }
    return bgImageStyle.backgroundImage.slice(4, -1);
  })();

  const bgImageSrcURI = new Uri(bgImageSrc);
  return bgImageSrcURI;
};

const renderBGAndWaitUntilLoaded = async (element) => {
  return new Promise((resolve, reject) => {
    let running;
    let waitUntilHasStyle = (maxTimes = 20, delay = 10, n = 0) => {
      if (!el) {
        return;
      }
      // Find the element which has the class "bg-img"
      const bgImageEl = (() => {
        if (el.getDOMNode().classList.contains("bg-img")) {
          return el.getDOMNode();
        }
        if (el.getDOMNode().querySelector(".bg-img")) {
          return el.getDOMNode().querySelector(".bg-img");
        }
        return undefined;
      })();
      // Check if the element has loaded, which is shown by a truthy `background-image`
      if (bgImageEl.style.backgroundImage) {
        return resolve(el);
      }

      if (n >= maxTimes) {
        return reject("Tries exceeded to wait for component to be ready");
      }
      setTimeout(() => waitUntilHasStyle(maxTimes, delay, n + 1), delay);
    };
    const onRef = (ref) => {
      if (running) {
        return;
      }
      running = true;
      setTimeout(waitUntilHasStyle, 10);
    };
    const addRef = (element) =>
      React.cloneElement(element, {
        ...element.props,
        htmlAttributes: {
          ...element.props.htmlAttributes,
          ref: onRef,
        },
        className: "bg-img " + (element.props.className || ""),
      });
    const isRootBackground = element.type === Background;
    const elementWithRef = (() => {
      if (isRootBackground) {
        return addRef(element);
      }
      return React.cloneElement(element, {
        children: React.Children.map(element.props.children, (child) => {
          const isBackground = child.type === Background;
          if (!isBackground) {
            return child;
          }

          return addRef(child);
        }),
      });
    })();

    const el = renderIntoContainer(elementWithRef);
  });
};

let containerDiv;
let sut;
beforeEach(() => {
  containerDiv = global.document.createElement("div");
  global.document.body.appendChild(containerDiv);
});

afterEach(() => {
  global.document.body.removeChild(containerDiv);
});

const fullRender = (markup) => {
  return ReactDOM.render(markup, containerDiv);
};

const renderIntoContainer = (element) => {
  return mount(element, { attachTo: containerDiv });
};

const renderAndWaitForImageLoad = async (element) => {
  return new Promise((resolve, reject) => {
    let renderedEl;
    const elementWithOnMounted = React.cloneElement(element, {
      onMounted: () => {},
      htmlAttributes: {
        ...(element.props.htmlAttributes || {}),
        onLoad: () => {
          element.props.htmlAttributes &&
            element.props.htmlAttributes.onLoad &&
            element.props.htmlAttributes.onLoad();
          setImmediate(() => resolve(renderedEl));
        },
        onError: () => {
          element.props.htmlAttributes &&
            element.props.htmlAttributes.onError &&
            element.props.htmlAttributes.onError();
          setImmediate(() => resolve(renderedEl));
        },
      },
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
    expect(renderImage().find("img").props().src).toContain(src);
  });

  context("htmlAttributes", () => {
    it("'onLoad' calls the callback", async () => {
      let onLoadCalled = false;

      await renderAndWaitForImageLoad(
        <Imgix
          src={src}
          w={10} // for speed
          h={10} // for speed
          htmlAttributes={{
            onLoad: () => {
              onLoadCalled = true;
            },
          }}
        />
      );

      expect(onLoadCalled).toBe(true);
    });
    it("'onError' calls the callback", async () => {
      let onErrorCalled = false;

      await renderAndWaitForImageLoad(
        <Imgix
          src="https://badurlcom"
          w={10} // for speed
          h={10} // for speed
          htmlAttributes={{
            onError: () => {
              onErrorCalled = true;
            },
          }}
        />
      );

      expect(onErrorCalled).toBe(true);
    });
  });
});

describe("Background Mode", () => {
  ///////////////////////
  // Common test cases
  const shouldRenderNoBGImage = (element) => {
    const sut = renderIntoContainer(element);

    const container = sut.find(".bg-img").first();

    const bgImage = container.getDOMNode().style.backgroundImage;

    expect(bgImage).toEqual(expect.not.stringContaining("url"));
  };
  const shouldBehaveLikeBg = function (size = "cover") {
    it("the element should have backgroundImage and backgroundSize set", () => {
      const style = sut.find(".bg-img").first().getDOMNode().style;
      expect({
        backgroundImage: style.backgroundImage,
        backgroundSize: style.backgroundSize,
      }).toMatchObject({
        backgroundImage: expect.stringContaining(src),
        backgroundSize: size,
      });
    });
  };
  const shouldHaveDimensions = async (
    { width: expectedWidth, height: expectedHeight },
    element
  ) => {
    const sut = await new Promise((resolve, reject) => {
      const renderedEl = renderIntoContainer(element);
      setTimeout(() => resolve(renderedEl), DELAY);
    });

    const bgImageSrcURL = findURIfromSUT(sut);

    expect(bgImageSrcURL.getQueryParamValue("w")).toBe("" + expectedWidth);
    expect(bgImageSrcURL.getQueryParamValue("h")).toBe("" + expectedHeight);
  };

  //////////////////////////////
  // Tests
  it("renders a div", () => {
    const sut = renderIntoContainer(<Background src={src} />);

    expect(sut.getDOMNode().tagName).toBe("DIV");
  });

  describe("when neither width nor height are passed", () => {
    it("renders nothing at first", () => {
      shouldRenderNoBGImage(
        <Background src={`${src}`} className="bg-img">
          <div>Content</div>
        </Background>
      );
    });

    it("sets the size of the background image to the size of the containing element", async () => {
      const targetWidth = 105;
      const targetHeight = 110;
      const aspectRatio = targetWidth / targetHeight;
      const sut = await renderBGAndWaitUntilLoaded(
        <div>
          <style>{`.bg-img { width: ${targetWidth}px; height: ${targetHeight}px}`}</style>
          <Background src={`${src}`} className="bg-img">
            <div>Content</div>
          </Background>
        </div>
      );

      const bgImageSrcURL = findURIfromSUT(sut);

      const expectedWidth = findClosestWidthFromTargetWidths(targetWidth);
      const expectedHeight = Math.round(expectedWidth / aspectRatio);

      expect(bgImageSrcURL.getQueryParamValue("w")).toBe(`${expectedWidth}`);
      expect(bgImageSrcURL.getQueryParamValue("h")).toBe(`${expectedHeight}`);
      expect(bgImageSrcURL.getQueryParamValue("fit")).toBe("crop");
    });
  });
  describe("when both width and height provided", () => {
    it("renders immediately when both width and height provided", () => {
      const sut = renderIntoContainer(
        <Background
          src={`${src}`}
          imgixParams={{
            w: 300,
            h: 350,
          }}
          className="bg-img"
        >
          <div>Content</div>
        </Background>
      );

      const bgImageSrcURL = findURIfromSUT(sut);

      expect(bgImageSrcURL.getQueryParamValue("w")).toBe("300");
      expect(bgImageSrcURL.getQueryParamValue("h")).toBe("350");
    });
    it("sets width and height to values passed", async () => {
      const sut = await renderBGAndWaitUntilLoaded(
        <div>
          <style>{`.bg-img { width: 200px; height: 250px}`}</style>
          <Background
            src={`${src}`}
            imgixParams={{
              w: 300,
              h: 350,
            }}
            className="bg-img"
          >
            <div>Content</div>
          </Background>
        </div>
      );

      const bgImageSrcURL = findURIfromSUT(sut);

      expect(bgImageSrcURL.getQueryParamValue("w")).toBe("300");
      expect(bgImageSrcURL.getQueryParamValue("h")).toBe("350");
    });
  });

  describe("when only width is passed", () => {
    it("renders nothing at first", () => {
      shouldRenderNoBGImage(
        <Background
          src={`${src}`}
          imgixParams={{
            w: 200,
          }}
          className="bg-img"
        >
          <div>Content</div>
        </Background>
      );
    });
    it("sets height dynamically", async () => {
      await shouldHaveDimensions(
        { width: 200, height: 210 },
        <div>
          <style>{`.bg-img { width: 100px; height: 105px}`}</style>
          <Background
            src={`${src}`}
            imgixParams={{
              w: 200,
            }}
            className="bg-img"
          >
            <div>Content</div>
          </Background>
        </div>
      );
    });
  });
  describe("when only height is passed", () => {
    it("renders nothing at first", () => {
      shouldRenderNoBGImage(
        <Background
          src={`${src}`}
          imgixParams={{
            h: 210,
          }}
          className="bg-img"
        >
          <div>Content</div>
        </Background>
      );
    });
    it("sets width dynamically", async () => {
      await shouldHaveDimensions(
        { width: 200, height: 210 },
        <div>
          <style>{`.bg-img { width: 100px; height: 105px}`}</style>
          <Background
            src={`${src}`}
            imgixParams={{
              h: 210,
            }}
            className="bg-img"
          >
            <div>Content</div>
          </Background>
        </div>
      );
    });
  });

  describe("without the backgroundSize prop set", () => {
    beforeEach(async () => {
      sut = await renderBGAndWaitUntilLoaded(
        <div>
          <style>{`.bg-img { width: 10px; height: 10px}`}</style>
          <Background
            src={src}
            className="bg-img"
            htmlAttributes={{ style: { backgroundSize: null } }}
          />
        </div>
      );
    });
    shouldBehaveLikeBg("");
  });

  describe("with the backgroundSize prop set to 'contain'", () => {
    beforeEach(async () => {
      sut = await renderBGAndWaitUntilLoaded(
        <div>
          <style>{`.bg-img { width: 10px; height: 10px}`}</style>
          <Background
            src={src}
            htmlAttributes={{ style: { backgroundSize: "contain" } }}
          />
        </div>
      );
    });
    shouldBehaveLikeBg("contain");
  });
  it("respects className", () => {
    const sut = renderIntoContainer(
      <Background src={src} className="custom-class-name" />
    );

    expect(sut.getDOMNode().classList.contains("custom-class-name")).toBe(true);
  });
  it("can disable library param", async () => {
    const sut = await renderBGAndWaitUntilLoaded(
      <Background src={src} disableLibraryParam />
    );

    expect(sut.getDOMNode().style.backgroundImage).not.toContain("ixlib=");
  });
  describe("can override html properties", () => {
    it("before loading", () => {
      const sut = renderIntoContainer(
        <Background src={src} htmlAttributes={{ alt: "Alt tag" }} />
      );

      expect(sut.getDOMNode().getAttribute("alt")).toBe("Alt tag");
    });
    it("after loaded", async () => {
      const sut = await renderBGAndWaitUntilLoaded(
        <Background src={src} htmlAttributes={{ alt: "Alt tag" }} />
      );

      expect(sut.getDOMNode().getAttribute("alt")).toBe("Alt tag");
    });
  });

  it("scales the background image by the devices dpr", async () => {
    // window.devicePixelRatio is not allowed in IE.
    if (isIE) {
      return;
    }
    const oldDPR = global.devicePixelRatio;
    global.devicePixelRatio = 2;

    const targetWidth = 105;
    const targetHeight = 110;
    const sut = await renderBGAndWaitUntilLoaded(
      <div>
        <style>{`.bg-img { width: 10px; height: 10px}`}</style>
        <Background src={`${src}`} htmlAttributes={{}} className="bg-img">
          <div>Content</div>
        </Background>
      </div>
    );

    const bgImageSrcURL = findURIfromSUT(sut);

    expect(bgImageSrcURL.getQueryParamValue("dpr")).toBe("2");

    global.devicePixelRatio = oldDPR;
  });
  it("the dpr can be overriden", async () => {
    // IE doesn't allow us to override window.devicePixelRatio
    if (isIE) {
      return;
    }
    const oldDPR = window.devicePixelRatio;
    window.devicePixelRatio = 2;

    const targetWidth = 105;
    const targetHeight = 110;
    const sut = await renderBGAndWaitUntilLoaded(
      <div>
        <style>{`.bg-img { width: 10px; height: 10px}`}</style>
        <Background
          src={`${src}`}
          imgixParams={{
            dpr: 3,
          }}
          htmlAttributes={{}}
          className="bg-img"
        >
          <div>Content</div>
        </Background>
      </div>
    );

    const bgImageSrcURL = findURIfromSUT(sut);

    expect(bgImageSrcURL.getQueryParamValue("dpr")).toBe("3");

    window.devicePixelRatio = oldDPR;
  });
  it("the dpr is rounded to 2dp", async () => {
    const targetWidth = 105;
    const targetHeight = 110;
    const sut = await renderBGAndWaitUntilLoaded(
      <div>
        <style>{`.bg-img { width: 10px; height: 10px}`}</style>
        <Background
          src={`${src}`}
          imgixParams={{
            dpr: 3.444,
          }}
          htmlAttributes={{}}
          className="bg-img"
        >
          <div>Content</div>
        </Background>
      </div>
    );

    const bgImageSrcURL = findURIfromSUT(sut);

    expect(bgImageSrcURL.getQueryParamValue("dpr")).toBe("3.44");
  });

  it("window resize", async () => {
    const sut = await renderBGAndWaitUntilLoaded(
      <div style={{ width: 1000 }} className="fake-window">
        <style>{`.bg-img { width: 50%; height: 10px}`}</style>
        <Background
          src={`${src}`}
          imgixParams={{
            h: 10,
          }}
          className="bg-img"
        >
          <div>Content</div>
        </Background>
      </div>
    );

    const fakeWindowEl = document.querySelector(".fake-window");

    // Simulate browser resize
    const BROWSER_WIDTH = 500;
    fakeWindowEl.style.width = BROWSER_WIDTH + "px";

    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    const bgImageSrcURL = findURIfromSUT(sut);

    const expectedWidth = BROWSER_WIDTH / 2;
    expect(bgImageSrcURL.getQueryParamValue("w")).toBe("" + expectedWidth);
  });

  it("can pass ref to component", async () => {
    let ref = false;
    const onRef = (el) => {
      ref = el;
    };
    const sut = await new Promise((resolve, reject) => {
      const el = (
        <div>
          <style>{`.bg-img { width: 10px; height: 10px}`}</style>
          <Background
            src={`${src}`}
            htmlAttributes={{ ref: onRef }}
            className="bg-img"
          >
            <div>Content</div>
          </Background>
        </div>
      );
      const renderedEl = renderIntoContainer(el);
      setTimeout(() => resolve(renderedEl), DELAY);
    });

    expect(ref).toBeTruthy();
    expect(ref instanceof HTMLElement).toBe(true);
    expect(findURIfromSUT(sut).getQueryParamValue("w")).toBe("100");
  });
  it("the fit parameter defaults to 'crop'", async () => {
    const sut = await renderBGAndWaitUntilLoaded(
      <div>
        <Background src={src} className="bg-img">
          <div>Content</div>
        </Background>
      </div>
    );

    const bgImageSrcURL = findURIfromSUT(sut);
    expect(bgImageSrcURL.getQueryParamValue("fit")).toBe("crop");
  });
  it("the fit parameter can be overriden", async () => {
    const sut = await renderBGAndWaitUntilLoaded(
      <div>
        <Background src={src} className="bg-img" imgixParams={{ fit: "clip" }}>
          <div>Content</div>
        </Background>
      </div>
    );

    const bgImageSrcURL = findURIfromSUT(sut);
    expect(bgImageSrcURL.getQueryParamValue("fit")).toBe("clip");
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
          sizes: "data-sizes",
        }}
      />
    );

    const renderedImage = renderIntoContainer(component);
    const renderedImageElement = renderedImage.getDOMNode();
    lazySizes.loader.unveil(renderedImageElement);
    await new Promise((resolve) => setTimeout(resolve, 1)); // Timeout allows DOM to update

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
          sizes: "data-sizes",
        }}
        htmlAttributes={{
          src: lqipSrc,
        }}
      />
    );

    const renderedImage = renderIntoContainer(component);
    const renderedImageElement = renderedImage.getDOMNode();
    await new Promise((resolve, reject) => {
      const mutationObserver = new MutationObserver(function (mutations) {
        actualSrc = renderedImageElement.getAttribute("src");
        const actualSrcSet = renderedImageElement.getAttribute("srcset");

        expect(actualSrc).toContain(src);
        expect(actualSrcSet).toContain(src);
        resolve();
      });

      mutationObserver.observe(renderedImageElement, {
        attributes: true,
      });

      let actualSrc = renderedImageElement.src;
      expect(actualSrc).toBe(lqipSrc);

      lazySizes.loader.unveil(renderedImageElement);
    });
  }).timeout(10000);
});
