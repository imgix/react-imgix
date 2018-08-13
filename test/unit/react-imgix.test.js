import sinon from "sinon";
import React from "react";
import ReactDOM from "react-dom";
import { shallow as enzymeShallow, mount } from "enzyme";
import PropTypes from "prop-types";
import { shallowUntilTarget } from "../helpers";

import Imgix, { __ReactImgix } from "react-imgix";

function shallow(element, shallowOptions) {
  return shallowUntilTarget(element, __ReactImgix, {
    shallowOptions: shallowOptions || {
      disableLifecycleMethods: true
    }
  });
}

const src = "http://domain.imgix.net/image.jpg";
let sut, vdom, instance;
const EMPTY_IMAGE_SRC =
  "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

async function renderImageAndBreakInStages({
  element,
  mockImage = <img />,
  afterFirstRender = async () => {},
  afterSecondRender = async () => {}
}) {
  sinon.stub(ReactDOM, "findDOMNode").callsFake(() => mockImage);

  const sut = shallow(element);

  await afterFirstRender(sut);

  await sut.instance().componentDidMount();
  sut.update();

  await afterSecondRender(sut);

  ReactDOM.findDOMNode.restore();

  return sut;
}

let oldConsole, log;
beforeAll(() => {
  oldConsole = global.console;
  delete console.log;
  console.error = console.log;
  log = console.log.bind(console);
});
afterAll(() => {
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
  it("the rendered element should have a srcSet set correctly", async () => {
    const sut = shallow(<Imgix src={src} sizes="100vw" />);
    const srcSet = sut.props().srcSet;
    expect(srcSet).not.toBeUndefined();
    expect(srcSet.split(", ")[0].split(" ")).toHaveLength(2);
    const aSrcFromSrcSet = srcSet.split(", ")[0].split(" ")[0];
    expect(aSrcFromSrcSet).toContain(src);
    const aWidthFromSrcSet = srcSet.split(", ")[0].split(" ")[1];
    expect(aWidthFromSrcSet).toMatch(/^\d+w$/);
  });
});

describe("When in image mode", () => {});

describe("When in <source> mode", () => {
  const sizes =
    "(max-width: 30em) 100vw, (max-width: 50em) 50vw, calc(33vw - 100px)";
  const imgProps = {
    media: "(min-width: 1200px)",
    type: "image/webp",
    alt: "alt text"
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

    Object.keys(imgProps)
      .filter(k => k !== "alt")
      .forEach(k => {
        it(`props.${k} should be defined and equal to the image's props`, () => {
          expect(renderImage().props()[k]).toBe(imgProps[k]);
        });
      });
    it(`props.alt should not be defined`, () => {
      expect(renderImage().props().alt).toBe(undefined);
    });

    it("an ixlib param should be added to the src", () => {
      renderImage()
        .props()
        .srcSet.split(",")
        .forEach(srcSet => expectUrlToContainIxLibParam(srcSet));
    });
  };

  describe("by default", () => {
    const renderImage = () =>
      shallow(
        <Imgix src={src} type="source" imgProps={imgProps} sizes={sizes} />
      );

    shouldBehaveLikeSource(renderImage);
    it("props.srcSet should be set to a valid src", () => {
      expect(renderImage().props().srcSet).toContain(src);
    });
    it("srcSet should be in the form src, src 2x, src 3x", () => {
      const srcSet = renderImage().props().srcSet;

      const srcSets = srcSet.split(", ");
      expect(srcSets).toHaveLength(3);
      srcSets.forEach(srcSet => {
        expect(srcSet).toContain(src);
      });
      expect(srcSets[1].split(" ")[1]).toBe("2x");
      expect(srcSets[2].split(" ")[1]).toBe("3x");
    });
  });

  describe("with disableSrcSet prop", () => {
    const renderImage = () =>
      shallow(
        <Imgix
          src={src}
          type="source"
          disableSrcSet
          imgProps={imgProps}
          sizes={sizes}
        />
      );

    shouldBehaveLikeSource(renderImage);
    it("props.srcSet should include the specified src passed as props", () => {
      expect(renderImage().props().srcSet).toMatch(new RegExp(`^${src}`));
    });
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

    it("an <img> or a <ReactImgix type=img> should be the last child", () => {
      const lastChildElement = lastChild
        .first()
        .shallow() // hack from https://github.com/airbnb/enzyme/issues/539#issuecomment-239497107 until a better solution is implemented
        .getElement();
      if (lastChildElement.type.hasOwnProperty("name")) {
        expect(lastChildElement.type.name).toBe("ReactImgix");
        expect(lastChildElement.props.type).toBe("img");
      } else {
        expect(lastChildElement.type).toBe("img");
      }
    });
  };

  it("should throw an error when no children passed", () => {
    const oldConsole = global.console;
    global.console = { warn: jest.fn() };

    shallow(
      <Imgix src={src} type="picture" aggressiveLoad width={100} height={100} />
    );

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("No fallback image found")
    );

    global.console = oldConsole;
  });

  describe("with a <ReactImgix type=img> passed as a child", () => {
    beforeEach(() => {
      sut = shallow(
        <Imgix
          src={src}
          type="picture"
          agressiveLoad
          imgixParams={{ crop: "faces" }}
          imgProps={{ alt: parentAlt }}
        >
          <Imgix src={src} type="img" imgProps={{ alt: childAlt }} />
        </Imgix>
      );
      children = sut.children();
      lastChild = children.last();
    });

    shouldBehaveLikePicture();
    it("only one child should exist", () => {
      expect(children).toHaveLength(1);
    });
    it.skip("props should not be passed down to children", () => {
      // TODO: Pass down imgixParams
      expect(
        lastChild
          .first()
          .shallow() // hack from https://github.com/airbnb/enzyme/issues/539#issuecomment-239497107 until a better solution is implemented
          .props()
      ).toMatchObject({
        imgixParams: {
          crop: "faces"
        },
        imgProps: {
          alt: childAlt
        }
      });
    });
  });

  describe("with an <img> passed as a child", () => {
    beforeEach(() => {
      sut = shallow(
        <Imgix
          src={src}
          type="picture"
          imgixParams={{ crop: "faces" }}
          imgProps={{ alt: parentAlt }}
        >
          <img src={src} alt={childAlt} />
        </Imgix>
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
  it("the crop param should alter the crop and fit query parameters correctly", () => {
    sut = shallow(
      <Imgix src={src} sizes="100vw" imgixParams={{ crop: "faces,entropy" }} />
    );

    expectSrcsToContain(sut, "crop=faces%2Centropy");
    expectSrcsToContain(sut, "fit=crop");
  });
  it("the fit param should alter the fit query pararmeter correctly", () => {
    expectSrcsToContain(sut, "fit=crop");
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

  it("an alt attribute should be set given imgProps.alt", async () => {
    const imgProps = {
      alt: "Example alt attribute"
    };
    sut = shallow(
      <Imgix
        src={"https://mysource.imgix.net/demo.png"}
        sizes="100vw"
        imgProps={imgProps}
      />
    );
    expect(sut.props().alt).toEqual(imgProps.alt);
  });

  it("any attributes passed via imgProps should be added to the rendered element", () => {
    const imgProps = {
      "data-src": "https://mysource.imgix.net/demo.png"
    };
    sut = shallow(
      <Imgix
        src={"https://mysource.imgix.net/demo.png"}
        sizes="100vw"
        imgProps={imgProps}
      />
    );

    expect(sut.props()["data-src"]).toEqual(imgProps["data-src"]);
  });

  it("a callback passed through the onMounted prop should be called", () => {
    const mockImage = <img />;
    sinon.stub(ReactDOM, "findDOMNode").callsFake(() => mockImage);

    const onMountedSpy = sinon.spy();
    sut = shallow(
      <Imgix
        src={"https://mysource.imgix.net/demo.png"}
        sizes="100vw"
        onMounted={onMountedSpy}
      />,
      {}
    );

    sinon.assert.calledWith(onMountedSpy, mockImage);

    ReactDOM.findDOMNode.restore();
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
describe("deprecations", () => {
  describe("to be deprecated in v9", () => {
    const DEPRECATED_PROPS = ["auto", "fit", "crop"];

    DEPRECATED_PROPS.forEach(deprecatedProp => {
      it(`should show deprecation warning for ${deprecatedProp}`, () => {
        const oldConsole = global.console;
        global.console = { error: jest.fn() };

        const props = {
          [deprecatedProp]: "value"
        };

        shallow(<Imgix src={src} sizes="100vw" {...props} />);

        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining(
            `The prop '${deprecatedProp}' has been deprecated`
          )
        );

        global.console = oldConsole;
      });
      it(`value for ${deprecatedProp} should be added to imgixParams`, () => {
        // Silence warnings
        const oldConsole = global.console;
        global.console = { error: jest.fn() };

        const props = {
          [deprecatedProp]: "value"
        };
        const sut = enzymeShallow(<Imgix src={src} sizes="100vw" {...props} />);

        expect(sut.props().imgixParams[deprecatedProp]).toEqual("value");

        global.console = oldConsole;
      });
    });
    it(`should show deprecation warning for customParams`, () => {
      const oldConsole = global.console;
      global.console = { error: jest.fn() };

      shallow(<Imgix src={src} sizes="100vw" customParams={{ width: 100 }} />);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining(`The prop 'customParams' has been replaced`)
      );

      global.console = oldConsole;
    });
    it(`customParams is mapped to imgixParams`, () => {
      // Silence warnings
      const oldConsole = global.console;
      global.console = { error: jest.fn() };

      const sut = enzymeShallow(
        <Imgix src={src} sizes="100vw" customParams={{ width: 100 }} />
      );

      expect(sut.props().imgixParams.width).toEqual(100);

      global.console = oldConsole;
    });

    const DEPRECATED_CROP_HELPERS = ["faces", "entropy"];

    DEPRECATED_CROP_HELPERS.forEach(deprecatedProp => {
      it(`should show deprecation warning for ${deprecatedProp}`, () => {
        const oldConsole = global.console;
        global.console = { error: jest.fn(), log: log };

        const props = {
          [deprecatedProp]: true
        };

        shallow(<Imgix src={src} sizes="100vw" {...props} />);

        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining(
            `The prop '${deprecatedProp}' has been deprecated`
          )
        );

        global.console = oldConsole;
      });
      it(`value for ${deprecatedProp} should be added to imgixParams.crop`, () => {
        // Silence warnings
        const oldConsole = global.console;
        global.console = { error: jest.fn(), log: log };

        const props = {
          [deprecatedProp]: true
        };
        const sut = enzymeShallow(<Imgix src={src} sizes="100vw" {...props} />);

        expect(sut.props().imgixParams.crop).toEqual(deprecatedProp);

        global.console = oldConsole;
      });

      it(`value for ${deprecatedProp} should not overwrite imgixParams.crop`, () => {
        // Silence warnings
        const oldConsole = global.console;
        global.console = { error: jest.fn(), log: log };

        const props = {
          [deprecatedProp]: true
        };
        const sut = enzymeShallow(
          <Imgix
            src={src}
            sizes="100vw"
            {...props}
            imgixParams={{ crop: `not-${deprecatedProp}` }}
          />
        );

        expect(sut.props().imgixParams.crop).toEqual(`not-${deprecatedProp}`);

        global.console = oldConsole;
      });

      it(`value for ${deprecatedProp} should not overwrite crop`, () => {
        // Silence warnings
        const oldConsole = global.console;
        global.console = { error: jest.fn(), log: log };

        const props = {
          [deprecatedProp]: true
        };
        const sut = enzymeShallow(
          <Imgix
            src={src}
            sizes="100vw"
            {...props}
            crop={`not-${deprecatedProp}`}
          />
        );

        expect(sut.props().imgixParams.crop).toEqual(`not-${deprecatedProp}`);

        global.console = oldConsole;
      });
    });
    it("the faces param should alter the crop query parameter correctly", () => {
      // Silence warnings
      const oldConsole = global.console;
      global.console = { error: jest.fn(), log: log };
      sut = shallow(<Imgix src={src} sizes="100vw" entropy />);

      sut = shallow(
        <Imgix
          src={src}
          sizes="100vw"
          faces
          imgixParams={{ auto: ["format", "enhance"] }}
        />
      );
      expectSrcsToContain(sut, "crop=faces");
      global.console = oldConsole;
    });
    it("the entropy param should alter the crop and fit query parameters correctly", () => {
      // Silence warnings
      const oldConsole = global.console;
      global.console = { error: jest.fn(), log: log };
      sut = shallow(<Imgix src={src} sizes="100vw" entropy />);

      expectSrcsToContain(sut, "crop=entropy");
      expectSrcsToContain(sut, "fit=crop");
      global.console = oldConsole;
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
