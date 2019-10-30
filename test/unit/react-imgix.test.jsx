import sinon from "sinon";
import React from "react";
import { shallow as enzymeShallow, mount } from "enzyme";
import { shallowUntilTarget } from "../helpers";
import targetWidths from "targetWidths";
import { DPR_QUALITY } from "../../src/constants";

import Imgix, {
  __ReactImgixImpl,
  Picture,
  Source,
  __SourceImpl,
  __PictureImpl
} from "react-imgix";

function shallow(element, target = __ReactImgixImpl, shallowOptions) {
  return shallowUntilTarget(element, target, {
    shallowOptions: shallowOptions || {
      disableLifecycleMethods: true
    }
  });
}
const shallowSource = element => shallow(element, __SourceImpl);
const shallowPicture = element => shallow(element, __PictureImpl);

const src = "http://domain.imgix.net/image.jpg";
let sut;
let oldConsole, log;

beforeEach(() => {
  oldConsole = global.console;
  delete console.log;
  console.error = console.log;
  log = console.log.bind(console);
});
afterEach(() => {
  global.console = oldConsole;
});

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

describe("When in default mode", () => {
  it("the rendered element's type should be img", () => {
    const sut = shallow(<Imgix src={src} sizes="100vw" />);
    expect(sut.type()).toBe("img");
  });
  describe("srcset", () => {
    it("the rendered element should have a srcSet set correctly", async () => {
      const sut = shallow(<Imgix src={src} sizes="100vw" />);
      const srcset = sut.props().srcSet;
      expect(srcset).not.toBeUndefined();
      expect(srcset.split(", ")[0].split(" ")).toHaveLength(2);
      const aSrcFromSrcSet = srcset.split(", ")[0].split(" ")[0];
      expect(aSrcFromSrcSet).toContain(src);
      const aWidthFromSrcSet = srcset.split(", ")[0].split(" ")[1];
      expect(aWidthFromSrcSet).toMatch(/^\d+w$/);
    });
    it("returns the expected number of `url widthDescriptor` pairs", function() {
      const sut = shallow(<Imgix src={src} sizes="100vw" />);
      const srcset = sut.props().srcSet;

      expect(srcset.split(",").length).toEqual(targetWidths.length);
    });

    it("should not exceed the bounds of [100, 8192]", () => {
      const sut = shallow(<Imgix src={src} sizes="100vw" />);
      const srcset = sut.props().srcSet;

      const srcsetWidths = srcset
        .split(", ")
        .map(srcset => srcset.split(" ")[1])
        .map(width => width.slice(0, -1))
        .map(Number.parseFloat);

      const min = Math.min(...srcsetWidths);
      const max = Math.max(...srcsetWidths);

      expect(min).not.toBeLessThan(100);
      expect(max).not.toBeGreaterThan(8192);
    });

    // 18% used to allow +-1% for rounding
    it("should not increase more than 18% every iteration", () => {
      const INCREMENT_ALLOWED = 0.18;

      const sut = shallow(<Imgix src={src} sizes="100vw" />);
      const srcset = sut.props().srcSet;

      const srcsetWidths = srcset
        .split(", ")
        .map(srcset => srcset.split(" ")[1])
        .map(width => width.slice(0, -1))
        .map(Number.parseFloat);

      let prev = srcsetWidths[0];

      for (let index = 1; index < srcsetWidths.length; index++) {
        const element = srcsetWidths[index];
        expect(element / prev).toBeLessThan(1 + INCREMENT_ALLOWED);
        prev = element;
      }
    });

    describe("supports varying q to dpr matching when rendering a fixed-size image", () => {
      it("generates predefined q and dpr pairs", async () => {
        const sut = shallow(<Imgix src={src} width={100} />);
        const srcset = sut.props().srcSet.split(", ");

        expect(srcset[0].split(" ")[0]).toContain("q=" + DPR_QUALITY.q_dpr1);
        expect(srcset[1].split(" ")[0]).toContain("q=" + DPR_QUALITY.q_dpr2);
        expect(srcset[2].split(" ")[0]).toContain("q=" + DPR_QUALITY.q_dpr3);
        expect(srcset[3].split(" ")[0]).toContain("q=" + DPR_QUALITY.q_dpr4);
        expect(srcset[4].split(" ")[0]).toContain("q=" + DPR_QUALITY.q_dpr5);
      });
      it("allows q to dpr matching to be disabled", async () => {
        const sut = shallow(
          <Imgix src={src} width={100} disableQualityByDPR={true} />
        );
        const srcset = sut.props().srcSet.split(", ");

        expect(srcset[0].split(" ")[0]).not.toContain(
          "q=" + DPR_QUALITY.q_dpr1
        );
        expect(srcset[1].split(" ")[0]).not.toContain(
          "q=" + DPR_QUALITY.q_dpr2
        );
        expect(srcset[2].split(" ")[0]).not.toContain(
          "q=" + DPR_QUALITY.q_dpr3
        );
        expect(srcset[3].split(" ")[0]).not.toContain(
          "q=" + DPR_QUALITY.q_dpr4
        );
        expect(srcset[4].split(" ")[0]).not.toContain(
          "q=" + DPR_QUALITY.q_dpr5
        );
      });
      it("allows the q parameter to be overriden when explicitly passed in", async () => {
        const q_override = 100;
        const sut = shallow(
          <Imgix src={src} width={100} imgixParams={{ q: q_override }} />
        );
        const srcset = sut.props().srcSet.split(", ");

        expect(srcset[0].split(" ")[0]).toContain("q=" + q_override);
        expect(srcset[1].split(" ")[0]).toContain("q=" + q_override);
        expect(srcset[2].split(" ")[0]).toContain("q=" + q_override);
        expect(srcset[3].split(" ")[0]).toContain("q=" + q_override);
        expect(srcset[4].split(" ")[0]).toContain("q=" + q_override);
      });
    });
  });
});

describe("When in image mode", () => {
  it("a callback passed through the onMounted prop should be called", () => {
    const onMountedSpy = sinon.spy();
    const sut = mount(
      <Imgix
        src={"https://mysource.imgix.net/demo.png"}
        sizes="100vw"
        onMounted={onMountedSpy}
      />
    );

    expect(onMountedSpy.callCount).toEqual(1);
    const onMountArg = onMountedSpy.lastCall.args[0];
    expect(onMountArg).toBeInstanceOf(HTMLImageElement);
  });
});

describe("When in <source> mode", () => {
  const sizes =
    "(max-width: 30em) 100vw, (max-width: 50em) 50vw, calc(33vw - 100px)";
  const htmlAttributes = {
    media: "(min-width: 1200px)",
    type: "image/webp"
  };
  const shouldBehaveLikeSource = function(renderImage) {
    it("a <source> component should be rendered", () => {
      expect(renderImage().type()).toBe("source");
    });

    it("srcSet prop should exist", () => {
      expect(renderImage().props().srcSet).not.toBeUndefined();
    });

    it("props.sizes should be defined and equal to the image's props", () =>
      expect(renderImage().props().sizes).toEqual(sizes));

    Object.keys(htmlAttributes)
      .filter(k => k !== "alt")
      .forEach(k => {
        it(`props.${k} should be defined and equal to the image's props`, () => {
          expect(renderImage().props()[k]).toBe(htmlAttributes[k]);
        });
      });
    it("an ixlib param should be added to the src", () => {
      renderImage()
        .props()
        .srcSet.split(",")
        .forEach(srcSet => expectUrlToContainIxLibParam(srcSet));
    });
  };

  describe("by default", () => {
    const renderImage = () => {
      return shallowSource(
        <Source src={src} htmlAttributes={htmlAttributes} sizes={sizes} />
      );
    };

    shouldBehaveLikeSource(renderImage);
    it("props.srcSet should be set to a valid src", () => {
      expect(renderImage().props().srcSet).toContain(src);
    });

    it("should have a srcSet set correctly", async () => {
      const srcset = renderImage().props().srcSet;
      expect(srcset).not.toBeUndefined();
      expect(srcset.split(", ")[0].split(" ")).toHaveLength(2);
      const aSrcFromSrcSet = srcset.split(", ")[0].split(" ")[0];
      expect(aSrcFromSrcSet).toContain(src);
      const aWidthFromSrcSet = srcset.split(", ")[0].split(" ")[1];
      expect(aWidthFromSrcSet).toMatch(/^\d+w$/);
    });

    it("returns the expected number of `url widthDescriptor` pairs", function() {
      const srcset = renderImage().props().srcSet;

      expect(srcset.split(",").length).toEqual(targetWidths.length);
    });

    it("should not exceed the bounds of [100, 8192]", () => {
      const srcset = renderImage().props().srcSet;

      const srcsetWidths = srcset
        .split(", ")
        .map(srcset => srcset.split(" ")[1])
        .map(width => width.slice(0, -1))
        .map(Number.parseFloat);

      const min = Math.min(...srcsetWidths);
      const max = Math.max(...srcsetWidths);

      expect(min).not.toBeLessThan(100);
      expect(max).not.toBeGreaterThan(8192);
    });
  });

  describe("in fixed width mode", () => {
    const renderImage = () => {
      return shallowSource(
        <Source
          src={src}
          width={100}
          htmlAttributes={htmlAttributes}
          sizes={sizes}
        />
      );
    };

    it("srcSet should be in the form src 1x, src 2x, src 3x, src 4x, src 5x", () => {
      const srcSet = renderImage().props().srcSet;

      const srcSets = srcSet.split(", ");
      expect(srcSets).toHaveLength(5);
      srcSets.forEach(srcSet => {
        expect(srcSet).toContain(src);
      });
      expect(srcSets[0].split(" ")[1]).toBe("1x");
      expect(srcSets[1].split(" ")[1]).toBe("2x");
      expect(srcSets[2].split(" ")[1]).toBe("3x");
      expect(srcSets[3].split(" ")[1]).toBe("4x");
      expect(srcSets[4].split(" ")[1]).toBe("5x");
    });
  });

  describe("with disableSrcSet prop", () => {
    const renderImage = () =>
      shallowSource(
        <Source
          src={src}
          disableSrcSet
          htmlAttributes={htmlAttributes}
          sizes={sizes}
        />
      );

    shouldBehaveLikeSource(renderImage);
    it("props.srcSet should include the specified src passed as props", () => {
      expect(renderImage().props().srcSet).toMatch(new RegExp(`^${src}`));
    });
  });
  it("a callback passed through the onMounted prop should be called", () => {
    const onMountedSpy = sinon.spy();
    const sut = mount(
      <Source
        src={"https://mysource.imgix.net/demo.png"}
        sizes="100vw"
        onMounted={onMountedSpy}
      />
    );

    expect(onMountedSpy.callCount).toEqual(1);
    const onMountArg = onMountedSpy.lastCall.args[0];
    expect(onMountArg).toBeInstanceOf(HTMLSourceElement);
  });
});

describe("When in picture mode", () => {
  let children, lastChild;
  const parentAlt = "parent alt";
  const childAlt = "child alt";

  const shouldBehaveLikePicture = function() {
    it("every child should have a key", () => {
      expect(children.everyWhere(c => c.key() !== undefined)).toBe(true);
    });

    it("a picture should be rendered", () => {
      expect(sut.type()).toBe("picture");
    });

    it("alt tag should not exist", () => {
      expect(sut.props().alt).toBe(undefined);
    });

    it("an <img> or a <Imgix> should be the last child", () => {
      // If the number of HOCs for ReactImgix is changed, there may need to be a change in the number of .first().shallow() calls
      const lastChildElement = lastChild
        .first()
        .shallow()
        .first()
        .shallow(); // hack from https://github.com/airbnb/enzyme/issues/539#issuecomment-239497107 until a better solution is implemented
      if (lastChildElement.type().hasOwnProperty("name")) {
        expect(lastChildElement.name()).toBe(__ReactImgixImpl.displayName);
        expect(
          lastChildElement.shallow({ disableLifecycleMethods: true }).type()
        ).toBe("img");
      } else {
        expect(lastChildElement.type()).toBe("img");
      }
    });
  };

  it("should throw an error when no children passed", () => {
    const oldConsole = global.console;
    global.console = { warn: jest.fn() };

    shallowPicture(<Picture src={src} width={100} height={100} />);

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("No fallback <img /> or <Imgix /> found")
    );

    global.console = oldConsole;
  });

  describe("with a <Imgix> passed as a child", () => {
    beforeEach(() => {
      sut = shallowPicture(
        <Picture
          src={src}
          agressiveLoad
          imgixParams={{ crop: "faces" }}
          htmlAttributes={{ alt: parentAlt }}
        >
          <Imgix src={src} htmlAttributes={{ alt: childAlt }} />
        </Picture>
      );
      children = sut.children();
      lastChild = children.last();
    });

    shouldBehaveLikePicture();
    it("only one child should exist", () => {
      expect(children).toHaveLength(1);
    });
    it.skip("props should not be passed down to children", () => {
      expect(
        lastChild
          .first()
          .shallow() // hack from https://github.com/airbnb/enzyme/issues/539#issuecomment-239497107 until a better solution is implemented
          .props()
      ).toMatchObject({
        imgixParams: {
          crop: "faces"
        },
        htmlAttributes: {
          alt: childAlt
        }
      });
    });
  });

  describe("with an <img> passed as a child", () => {
    beforeEach(() => {
      sut = shallowPicture(
        <Picture
          src={src}
          imgixParams={{ crop: "faces" }}
          htmlAttributes={{ alt: parentAlt }}
        >
          <img src={src} alt={childAlt} />
        </Picture>
      );
      children = sut.children();
      lastChild = children.last();
    });

    shouldBehaveLikePicture();
    it("only one child should exist", () => {
      expect(children).toHaveLength(1);
    });
    it("props should not be passed down to children", () => {
      const lastChildProps = lastChild.props();
      expect(lastChildProps).toMatchObject({
        alt: childAlt
      });
    });
  });

  it("a callback passed through the onMounted prop should be called", () => {
    const onMountedSpy = sinon.spy();
    sut = mount(
      <Picture onMounted={onMountedSpy} foo={1}>
        <img />
      </Picture>
    );

    expect(onMountedSpy.callCount).toEqual(1);
    const onMountArg = onMountedSpy.lastCall.args[0];
    expect(onMountArg).toBeInstanceOf(HTMLPictureElement);
  });
});

describe("When using the component", () => {
  let className = "img--enabled";
  beforeEach(() => {
    sut = shallow(
      <Imgix
        src={src}
        sizes="100vw"
        imgixParams={{ auto: ["format", "enhance"] }}
        className={className}
      />
    );
  });
  it("the auto param should alter the url correctly", () => {
    expectSrcsToContain(sut, "auto=format%2Cenhance");
  });
  it("the rendered element should contain the class name provided", () => {
    expect(sut.props().className).toContain(className);
  });
  it("the fit param should alter the fit query pararmeter correctly", () => {
    expectSrcsTo(sut, expect.not.stringContaining("fit=crop"));
  });
  it("the keys of custom url parameters should be url encoded", () => {
    const helloWorldKey = "hello world";
    const expectedKey = "hello%20world";
    sut = shallow(
      <Imgix
        src={"https://mysource.imgix.net/demo.png"}
        sizes="100vw"
        imgixParams={{
          [helloWorldKey]: "interesting"
        }}
      />
    );

    expectSrcsToContain(sut, `${expectedKey}=interesting`);
    expectSrcsTo(
      sut,
      expect.not.stringContaining(`${helloWorldKey}=interesting`)
    );
  });
  it("the values of custom url parameters should be url encoded", () => {
    const helloWorldValue = '/foo"> <script>alert("hacked")</script><';
    const expectedValue =
      "%2Ffoo%22%3E%20%3Cscript%3Ealert(%22hacked%22)%3C%2Fscript%3E%3C";
    sut = shallow(
      <Imgix
        src={"https://mysource.imgix.net/demo.png"}
        sizes="100vw"
        imgixParams={{
          hello_world: helloWorldValue
        }}
      />
    );

    expectSrcsToContain(sut, `hello_world=${expectedValue}`);
    expectSrcsTo(
      sut,
      expect.not.stringContaining(`hello_world=${helloWorldValue}`)
    );
  });
  it("the base64 custom parameter values should be base64 encoded", () => {
    const txt64Value = "I cannøt belîév∑ it wors! 😱";
    const expectedValue = "SSBjYW5uw7h0IGJlbMOuw6l24oiRIGl0IHdvcu-jv3MhIPCfmLE";
    sut = shallow(
      <Imgix
        src={"https://mysource.imgix.net/~text"}
        sizes="100vw"
        imgixParams={{
          txt64: txt64Value
        }}
      />
    );

    expectSrcsToContain(sut, `txt64=${expectedValue}`);
    expectSrcsTo(sut, expect.not.stringContaining(`txt64=${txt64Value}`));
  });
  it("a custom height should alter the height query parameter correctly", () => {
    const height = 300;
    sut = shallow(
      <Imgix src={"https://mysource.imgix.net/demo.png"} height={height} />
    );

    expectSrcsToContain(sut, `h=${height}`);
  });

  it("a height prop between 0 and 1 should not be passed as a prop to the child element rendered", () => {
    const height = 0.5;
    sut = shallow(
      <Imgix src={"https://mysource.imgix.net/demo.png"} height={height} />
    );

    expect(sut.props().height).toBeFalsy();
  });

  it("a height prop greater than 1 should be passed to the the child element rendered", () => {
    const height = 300;
    sut = shallow(
      <Imgix src={"https://mysource.imgix.net/demo.png"} height={height} />
    );

    expect(sut.props().height).toEqual(height);
  });

  it("the width prop should alter the width query parameter correctly", () => {
    const width = 300;
    sut = shallow(
      <Imgix src={"https://mysource.imgix.net/demo.png"} width={width} />
    );

    expectSrcsToContain(sut, `w=${width}`);
  });

  it("responsive width should overwrite the width query parameter correctly", () => {
    sut = shallow(
      <Imgix src={"https://mysource.imgix.net/demo.png?w=333"} sizes="100wv" />
    );

    expect(sut.props().src).toContain("w=333");
    expect(sut.props().srcSet).not.toContain("w=333");
  });

  it("a width prop between 0 and 1 should not be passed as a prop to the child element rendered", () => {
    const width = 0.5;
    sut = shallow(
      <Imgix src={"https://mysource.imgix.net/demo.png"} width={width} />
    );

    expect(sut.props().width).toBeFalsy();
  });

  it("a width prop greater than 1 should be passed to the the child element rendered", () => {
    const width = 300;
    sut = shallow(
      <Imgix src={"https://mysource.imgix.net/demo.png"} width={width} />
    );

    expect(sut.props().width).toEqual(width);
  });

  describe("aspectRatio", () => {
    describe("valid AR", () => {
      const testValidAR = ({ ar }) => {
        it(`a valid ar prop (${ar}) should generate an ar query parameter`, () => {
          const parseParam = (url, param) => {
            const matched = url.match("[?&]" + param + "=([^&]+)");
            if (!matched) return undefined;
            return matched[1];
          };
          const removeFallbackSrcSet = srcSets => srcSets.slice(0, -1);

          sut = shallow(
            <Imgix
              src={src}
              sizes="(max-width: 30em) 100vw, (max-width: 50em) 50vw"
              imgixParams={{ ar }}
            />
          );

          const srcSet = sut.props().srcSet;
          const srcSets = srcSet.split(",").map(v => v.trim());
          const srcSetUrls = srcSets.map(srcSet => srcSet.split(" ")[0]);
          removeFallbackSrcSet(srcSetUrls).forEach(srcSetUrl => {
            const ar = parseParam(srcSetUrl, "ar");
            expect(ar).toBeTruthy();
          });
        });
      };
      [
        ["1:1"],
        ["1.1:1"],
        ["1.12:1"],
        ["1.123:1"],
        ["1:1.1"],
        ["1:1.12"],
        ["1.1:1.1"],
        ["1.123:1.123"],
        ["11.123:11.123"]
      ].forEach(([validAR, validArDecimal]) =>
        testValidAR({
          ar: validAR
        })
      );
    });

    describe("invalid AR", () => {
      const testInvalidAR = ar => {
        it(`an invalid ar prop (${ar}) will still generate an ar query parameter`, () => {
          const oldConsole = global.console;
          global.console = { warn: jest.fn() };

          const parseParam = (url, param) => {
            const matched = url.match("[?&]" + param + "=([^&]+)");
            if (!matched) return undefined;
            return matched[1];
          };
          const removeFallbackSrcSet = srcSets => srcSets.slice(0, -1);

          sut = shallow(
            <Imgix
              src={src}
              sizes="(max-width: 30em) 100vw, (max-width: 50em) 50vw"
              imgixParams={{ ar }}
            />
          );

          const srcSet = sut.props().srcSet;
          const srcSets = srcSet.split(",").map(v => v.trim());
          const srcSetUrls = srcSets.map(srcSet => srcSet.split(" ")[0]);
          removeFallbackSrcSet(srcSetUrls).forEach(srcSetUrl => {
            const w = parseParam(srcSetUrl, "w");
            const ar = parseParam(srcSetUrl, "ar");

            expect(w).toBeTruthy();
            expect(ar).toBeTruthy();
          });

          global.console = oldConsole;
        });
      };

      [
        "4x3",
        "4:",
        ,
        "blah:1:1",
        "blah1:1",
        "1x1",
        "1:1blah",
        "1:blah1",
        0.145,
        true
      ].forEach(invalidAR => testInvalidAR(invalidAR));
    });

    it("srcsets should not have an ar parameter when aspectRatio is not set", () => {
      sut = shallow(
        <Imgix
          src={src}
          sizes="(max-width: 30em) 100vw, (max-width: 50em) 50vw"
        />
      );
      const srcSet = sut.props().srcSet;
      const srcSets = srcSet.split(",").map(v => v.trim());
      const srcSetUrls = srcSets.map(srcSet => srcSet.split(" ")[0]);
      const parseParam = (str, param) => {
        const matched = str.match("[?&]" + param + "=([^&]+)");
        if (!matched) return null;
        return matched[1];
      };
      srcSetUrls.forEach(srcSetUrl => {
        const ar = parseParam(srcSetUrl, "ar");
        expect(ar).toBeFalsy();
      });
    });

    it("the generated src should have an ar parameter included", () => {
      sut = shallow(
        <Imgix
          src={src}
          sizes="(max-width: 30em) 100vw, (max-width: 50em) 50vw"
          imgixParams={{ ar: "2:1" }}
        />
      );

      expectSrcsTo(sut, expect.stringContaining("ar="));
    });
  });

  it("an alt attribute should be set given htmlAttributes.alt", async () => {
    const htmlAttributes = {
      alt: "Example alt attribute"
    };
    sut = shallow(
      <Imgix
        src={"https://mysource.imgix.net/demo.png"}
        sizes="100vw"
        htmlAttributes={htmlAttributes}
      />
    );
    expect(sut.props().alt).toEqual(htmlAttributes.alt);
  });

  it("any attributes passed via htmlAttributes should be added to the rendered element", () => {
    const htmlAttributes = {
      "data-src": "https://mysource.imgix.net/demo.png"
    };
    sut = shallow(
      <Imgix
        src={"https://mysource.imgix.net/demo.png"}
        sizes="100vw"
        htmlAttributes={htmlAttributes}
      />
    );

    expect(sut.props()["data-src"]).toEqual(htmlAttributes["data-src"]);
  });

  it("an ixlib parameter should be included by default in the computed src and srcSet", () => {
    sut = shallow(
      <Imgix src="https://mysource.imgix.net/demo.png" sizes="100vw" />
    );
    expectSrcsTo(sut, createIxLibParamMatcher());
  });
  it("the addition of the ixlib parameter to the url can be disabled", () => {
    sut = shallow(
      <Imgix
        src="https://mysource.imgix.net/demo.png"
        disableLibraryParam
        sizes="100vw"
      />
    );

    expectSrcsTo(sut, expect.not.stringContaining(`ixlib=`));
  });
});

describe("Attribute config", () => {
  describe("<Imgix />", () => {
    const ATTRIBUTES = ["src", "srcSet", "sizes"];
    ATTRIBUTES.forEach(ATTRIBUTE => {
      it(`${ATTRIBUTE} can be configured to use data-${ATTRIBUTE}`, () => {
        sut = shallow(
          <Imgix
            src="https://mysource.imgix.net/demo.png"
            sizes="100vw"
            attributeConfig={{
              [ATTRIBUTE]: `data-${ATTRIBUTE}`
            }}
          />
        );

        expect(sut.props()[`data-${ATTRIBUTE}`]).not.toBeUndefined();
        expect(sut.props()[ATTRIBUTE]).toBeUndefined();
      });
    });
  });
  describe("<Source />", () => {
    const ATTRIBUTES = ["srcSet", "sizes"];
    ATTRIBUTES.forEach(ATTRIBUTE => {
      it(`${ATTRIBUTE} can be configured to use data-${ATTRIBUTE}`, () => {
        sut = shallowSource(
          <Source
            src="https://mysource.imgix.net/demo.png"
            sizes="100vw"
            attributeConfig={{
              [ATTRIBUTE]: `data-${ATTRIBUTE}`
            }}
          />
        );

        expect(sut.props()[`data-${ATTRIBUTE}`]).not.toBeUndefined();
        expect(sut.props()[ATTRIBUTE]).toBeUndefined();
      });
    });
  });
});

const expectSrcsTo = (sut, matcher) => {
  const src = sut.props().src;
  expect(src).toEqual(matcher); // Use jest matchers as param, e.g. jest.stringContaining()

  const srcSet = sut.props().srcSet;
  if (!srcSet) {
    fail("No srcSet");
  }
  const srcSets = srcSet.split(",").map(v => v.trim());
  const srcSetUrls = srcSets.map(srcSet => srcSet.split(" ")[0]);
  srcSetUrls.forEach(srcSetUrl => {
    expect(srcSetUrl).toEqual(matcher);
  });
};

const expectSrcsToContain = (sut, shouldContainString) =>
  expectSrcsTo(sut, expect.stringContaining(shouldContainString));

const expectUrlToContainIxLibParam = url => {
  expect(url).toEqual(createIxLibParamMatcher());
};

const createIxLibParamMatcher = () => {
  const expectedVersion = require("read-pkg-up").sync().pkg.version;
  const expectedParam = `ixlib=react-${expectedVersion}`;

  return expect.stringContaining(expectedParam);
};
