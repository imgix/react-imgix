import sinon from "sinon";
import React from "react";
import ReactDOM from "react-dom";
import { shallow } from "enzyme";
import PropTypes from "prop-types";

import Imgix from "react-imgix";

const src = "http://domain.imgix.net/image.jpg";
let sut, vdom, instance;

describe("When using aggressiveLoad", () => {
  const renderImage = () =>
    shallow(<Imgix src={src} aggressiveLoad />, {
      disableLifecycleMethods: true
    });

  it("an image should be rendered immediately", () => {
    expect(renderImage().find("img")).toHaveLength(1);
  });
  it("the rendered image's src should be set", () => {
    expect(
      renderImage()
        .find("img")
        .props().src
    ).toContain(src);
  });
});

describe("When in image mode", () => {
  describe("before mount", () => {
    const renderImage = () =>
      shallow(<Imgix type="img" src={src} />, {
        disableLifecycleMethods: true
      });
    it("the rendered element's src should be null", () => {
      const props = renderImage().props();
      expect(props.src).toBe(null);
      expect(props.srcSet).toBe(null);
    });
  });
});

describe("When in default mode", () => {
  it("the rendered element's type should be img", () => {
    const component = <Imgix src={src} />;
    expect(component.props.type).toBe("img");
  });
});

describe("When in <source> mode", () => {
  const imgProps = {
    media: "(min-width: 1200px)",
    sizes:
      "(max-width: 30em) 100vw, (max-width: 50em) 50vw, calc(33vw - 100px)",
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
  };

  describe("with the generateSrcSet prop", () => {
    const renderImage = () =>
      shallow(
        <Imgix
          src={src}
          type="source"
          generateSrcSet
          aggressiveLoad
          imgProps={imgProps}
        />,
        {
          disableLifecycleMethods: true
        }
      );

    shouldBehaveLikeSource(renderImage);
    it("props.srcSet should be set to a valid src", () => {
      expect(renderImage().props().srcSet).toContain(src);
      expect(renderImage().props().srcSet).toContain("2x");
    });
  });

  describe("without the generateSrcSet prop", () => {
    const renderImage = () =>
      shallow(
        <Imgix
          src={src}
          type="source"
          generateSrcSet={false}
          aggressiveLoad
          imgProps={imgProps}
        />,
        {
          disableLifecycleMethods: true
        }
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
      const lastChildElement = lastChild.getElement();
      if (lastChildElement.type.hasOwnProperty("name")) {
        expect(lastChildElement.type.name).toBe("ReactImgix");
        expect(lastChildElement.props.type).toBe("img");
      } else {
        expect(lastChildElement.type).toBe("img");
      }
    });
  };

  describe("with no children passed as props", () => {
    const imgProps = { className: "foobar", alt: parentAlt };
    beforeEach(() => {
      sut = shallow(
        <Imgix
          src={src}
          type="picture"
          aggressiveLoad
          imgProps={imgProps}
          width={100}
          height={100}
        />,
        { disableLifecycleMethods: true }
      );
      children = sut.children();
      lastChild = children.last();
    });

    shouldBehaveLikePicture();

    it("only one child should exist", () => {
      expect(children.length).toBe(1);
    });

    it("props should be passed down to the automatically added element, and type should be img", () => {
      // todo - verify all valid props are passed down to children as defaults
      // except for the ones we specifically exclude
      let expectedProps = {
        ...sut.props(),
        type: "img",
        imgProps
      };
      expectedProps.className = expectedProps.imgProps.className;
      delete expectedProps.children;
      delete expectedProps.imgProps.className;
      expect(lastChild.props()).toMatchObject(expectedProps);
    });
  });

  describe("with a <ReactImgix type=img> passed as a child", () => {
    beforeEach(() => {
      sut = shallow(
        <Imgix
          src={src}
          type="picture"
          agressiveLoad
          faces={false}
          entropy
          imgProps={{ alt: parentAlt }}
        >
          <Imgix src={src} type="img" imgProps={{ alt: childAlt }} />
        </Imgix>,
        { disableLifecycleMethods: true }
      );
      children = sut.children();
      lastChild = children.last();
    });

    shouldBehaveLikePicture();
    it("only one child should exist", () => {
      expect(children).toHaveLength(1);
    });
    it("props should not be passed down to children", () => {
      expect(lastChild.props()).toMatchObject({
        faces: true,
        entropy: false,
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
          agressiveLoad
          faces={false}
          entropy
          imgProps={{ alt: parentAlt }}
        >
          <img src={src} alt={childAlt} />
        </Imgix>,
        {
          disableLifecycleMethods: true
        }
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
      expect(lastChildProps.faces).toBe(undefined);
      expect(lastChildProps.entropy).toBe(undefined);
    });
  });
});

describe("When in background mode", () => {
  const shouldBehaveLikeBg = function(size = "cover") {
    it("a div should be rendered", () => {
      expect(sut.type()).toBe("div");
    });
    it("the element should have backgroundImage and backgroundSize set", () => {
      expect(sut.props()).toMatchObject({
        style: {
          backgroundImage: expect.stringContaining(src),
          backgroundSize: size
        }
      });
    });
  };
  beforeEach(() => {
    sut = shallow(<Imgix src={src} type="bg" aggressiveLoad />, {
      disableLifecycleMethods: true
    });
  });
  shouldBehaveLikeBg();

  describe("without the backgroundSize prop set", () => {
    beforeEach(() => {
      sut = shallow(
        <Imgix
          src={src}
          type="bg"
          imgProps={{ style: { backgroundSize: null } }}
          aggressiveLoad
        />,
        {
          disableLifecycleMethods: true
        }
      );
    });
    shouldBehaveLikeBg(null);
  });

  describe("with the backgroundSize prop set to 'contain'", () => {
    beforeEach(() => {
      sut = shallow(
        <Imgix
          src={src}
          type="bg"
          imgProps={{ style: { backgroundSize: "contain" } }}
          aggressiveLoad
        />,
        { disableLifecycleMethods: true }
      );
    });
    shouldBehaveLikeBg("contain");
  });

  describe("before mounting", () => {
    beforeEach(() => {
      sut = shallow(<Imgix src={src} type="bg" />, {
        disableLifecycleMethods: true
      });
    });
    it("the element's url() should not be set", () => {
      expect(sut.props()).toMatchObject({
        style: {
          backgroundImage: null,
          backgroundSize: "cover"
        }
      });
    });
  });
});
describe("When using a custom component", () => {
  describe("when in background mode", () => {
    beforeEach(() => {
      sut = shallow(
        <Imgix src={src} component="li" type="bg" aggressiveLoad />,
        {
          disableLifecycleMethods: true
        }
      );
    });
    it("the rendered element should be of the type of the custom component", () => {
      expect(sut.type()).toBe("li");
    });
    it("the image shall be displayed as a background image", () => {
      expect(sut.props().style.backgroundImage).toContain(src);
    });
  });
});
describe("When using the component", () => {
  let className = "img--enabled";
  beforeEach(() => {
    sut = shallow(
      <Imgix
        src={src}
        auto={["format", "enhance"]}
        className={className}
        aggressiveLoad
        faces
      />,
      { disableLifecycleMethods: true }
    );
  });
  it("the auto prop should alter the url correctly", () => {
    expect(sut.props().src).toContain("auto=format%2Cenhance");
  });
  it("the rendered element should contain the class name provided", () => {
    expect(sut.props().className).toContain(className);
  });
  it("the crop prop should alter the crop and fit query parameters correctly", () => {
    sut = shallow(<Imgix src={src} aggressiveLoad crop="faces,entropy" />, {
      disableLifecycleMethods: true
    });

    expect(sut.props().src).toContain("crop=faces%2Centropy");
    expect(sut.props().src).toContain("fit=crop");
  });
  it("the crop prop should override the faces prop", () => {
    sut = shallow(
      <Imgix src={src} aggressiveLoad faces crop="faces,entropy" />,
      {
        disableLifecycleMethods: true
      }
    );

    expect(sut.props().src).toContain("crop=faces%2Centropy");
    expect(sut.props().src).toContain("fit=crop");
  });
  it("the crop prop should override the entropy prop", () => {
    sut = shallow(
      <Imgix src={src} aggressiveLoad entropy crop="faces,entropy" />,
      {
        disableLifecycleMethods: true
      }
    );

    expect(sut.props().src).toContain("crop=faces%2Centropy");
    expect(sut.props().src).toContain("fit=crop");
  });
  it("the faces prop should alter the crop query parameter correctly", () => {
    expect(sut.props().src).toContain("crop=faces");
  });
  it("the fit prop should alter the fit query pararmeter correctly", () => {
    expect(sut.props().src).toContain("fit=crop");
  });
  it("the entropy prop should alter the crop and fit query parameters correctly", () => {
    sut = shallow(<Imgix src={src} aggressiveLoad entropy />, {
      disableLifecycleMethods: true
    });

    expect(sut.props().src).toContain("crop=entropy");
    expect(sut.props().src).toContain("fit=crop");
  });
  it("the keys of custom url parameters should be url encoded", () => {
    sut = shallow(
      <Imgix
        src={"https://mysource.imgix.net/demo.png"}
        aggressiveLoad
        customParams={{
          "hello world": "interesting"
        }}
      />,
      {
        disableLifecycleMethods: true
      }
    );

    expect(sut.props().src).toEqual(
      "https://mysource.imgix.net/demo.png?auto=format&dpr=1&hello%20world=interesting&crop=faces&fit=crop&w=1&h=1"
    );
  });
  it("the values of custom url parameters should be url encoded", () => {
    sut = shallow(
      <Imgix
        src={"https://mysource.imgix.net/demo.png"}
        aggressiveLoad
        customParams={{
          hello_world: '/foo"> <script>alert("hacked")</script><'
        }}
      />,
      {
        disableLifecycleMethods: true
      }
    );

    expect(sut.props().src).toEqual(
      "https://mysource.imgix.net/demo.png?auto=format&dpr=1&hello_world=%2Ffoo%22%3E%20%3Cscript%3Ealert(%22hacked%22)%3C%2Fscript%3E%3C&crop=faces&fit=crop&w=1&h=1"
    );
  });
  it("the base64 custom parameter values should be base64 encoded", () => {
    sut = shallow(
      <Imgix
        src={"https://mysource.imgix.net/~text"}
        aggressiveLoad
        customParams={{
          txt64: "I cannøt belîév∑ it wors! 😱"
        }}
      />,
      {
        disableLifecycleMethods: true
      }
    );

    expect(sut.props().src).toEqual(
      "https://mysource.imgix.net/~text?auto=format&dpr=1&txt64=SSBjYW5uw7h0IGJlbMOuw6l24oiRIGl0IHdvcu-jv3MhIPCfmLE&crop=faces&fit=crop&w=1&h=1"
    );
  });
  it("the generateSrcSet prop should add dpr=2 and dpr=3 to the srcSet attribute", () => {
    sut = shallow(<Imgix src={src} aggressiveLoad generateSrcSet />, {
      disableLifecycleMethods: true
    });

    expect(sut.props().srcSet).toContain("dpr=2");
    expect(sut.props().srcSet).toContain("dpr=3");
  });
  it("a custom height should alter the height query parameter correctly", () => {
    const height = 300;
    sut = shallow(
      <Imgix
        src={"https://mysource.imgix.net/demo.png"}
        aggressiveLoad
        height={height}
      />,
      {
        disableLifecycleMethods: true
      }
    );

    expect(sut.props().src).toEqual(
      `https://mysource.imgix.net/demo.png?auto=format&dpr=1&crop=faces&fit=crop&w=1&h=${height}`
    );
  });

  it("a height prop between 0 and 1 should not be passed as a prop to the child element rendered", () => {
    const height = 0.5;
    sut = shallow(
      <Imgix
        src={"https://mysource.imgix.net/demo.png"}
        aggressiveLoad
        height={height}
      />,
      {
        disableLifecycleMethods: true
      }
    );

    expect(sut.props().height).toBeFalsy();
  });

  it("a height prop greater than 1 should be passed to the the child element rendered", () => {
    const height = 300;
    sut = shallow(
      <Imgix
        src={"https://mysource.imgix.net/demo.png"}
        aggressiveLoad
        height={height}
      />,
      {
        disableLifecycleMethods: true
      }
    );

    expect(sut.props().height).toEqual(height);
  });

  it("the width prop should alter the width query parameter correctly", () => {
    const width = 300;
    sut = shallow(
      <Imgix
        src={"https://mysource.imgix.net/demo.png"}
        aggressiveLoad
        width={width}
      />,
      {
        disableLifecycleMethods: true
      }
    );

    expect(sut.props().src).toEqual(
      `https://mysource.imgix.net/demo.png?auto=format&dpr=1&crop=faces&fit=crop&w=${width}&h=1`
    );
  });

  it("a width prop between 0 and 1 should not be passed as a prop to the child element rendered", () => {
    const width = 0.5;
    sut = shallow(
      <Imgix
        src={"https://mysource.imgix.net/demo.png"}
        aggressiveLoad
        width={width}
      />,
      {
        disableLifecycleMethods: true
      }
    );

    expect(sut.props().width).toBeFalsy();
  });

  it("a width prop greater than 1 should be passed to the the child element rendered", () => {
    const width = 300;
    sut = shallow(
      <Imgix
        src={"https://mysource.imgix.net/demo.png"}
        aggressiveLoad
        width={width}
      />,
      {
        disableLifecycleMethods: true
      }
    );

    expect(sut.props().width).toEqual(width);
  });

  it("any attributes passed via imgProps should be added to the rendered element", () => {
    const imgProps = {
      alt: "Example alt attribute",
      "data-src": "https://mysource.imgix.net/demo.png"
    };
    sut = shallow(
      <Imgix src={"https://mysource.imgix.net/demo.png"} imgProps={imgProps} />,
      {
        disableLifecycleMethods: true
      }
    );

    expect(sut.props().alt).toEqual(imgProps.alt);
    expect(sut.props()["data-src"]).toEqual(imgProps["data-src"]);
  });

  it("a callback passed through the onMounted prop should be called", () => {
    const mockImage = <img />;
    sinon.stub(ReactDOM, "findDOMNode").callsFake(() => mockImage);

    const onMountedSpy = sinon.spy();
    sut = shallow(
      <Imgix
        src={"https://mysource.imgix.net/demo.png"}
        onMounted={onMountedSpy}
      />
    );

    sinon.assert.calledWith(onMountedSpy, mockImage);

    ReactDOM.findDOMNode.restore();
  });
});
