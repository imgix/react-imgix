/* global describe it beforeEach afterEach console */

import expect from "expect";
import sinon from "sinon";
import sd from "skin-deep";
import React from "react";
import ReactDOM from "react-dom";

import Imgix from "./index.js";

const src = "http://domain.imgix.net/image.jpg";
let tree, vdom, instance;

describe("<img> mode", () => {
  beforeEach(() => {
    tree = sd.shallowRender(<Imgix src={src} aggressiveLoad />);
    vdom = tree.getRenderOutput();
    instance = tree.getMountedInstance();
  });

  it("should render an image", () => {
    expect(vdom.type).toBe("img");
  });
  it("should have a src tag", () => {
    expect(vdom.props.src).toContain(src);
  });
});
// These tests emulate the pre-mount state as `tree.getMountedInstance()` isn't called
describe("<img> type - pre-mount", () => {
  beforeEach(() => {
    tree = sd.shallowRender(<Imgix type="img" src={src} />);
    vdom = tree.getRenderOutput();
  });
  it("shouldn't have a blank src tag", () => {
    expect(vdom.props.src).toBe(null);
    expect(vdom.props.srcSet).toBe(null);
  });
});

describe("default type", () => {
  it("should be img", () => {
    const component = <Imgix src={src} />;
    expect(component.props.type).toBe("img");
  });
});

describe("<source> type", () => {
  // verify that these will make it through
  const imgProps = {
    media: "(min-width: 1200px)",
    sizes:
      "(max-width: 30em) 100vw, (max-width: 50em) 50vw, calc(33vw - 100px)",
    type: "image/webp",
    alt: "alt text"
  };
  const shouldBehaveLikeSource = function() {
    it("should render a source", () => {
      expect(vdom.type).toBe("source");
    });

    it("should have a srcSet prop", () => {
      expect(vdom.props.srcSet).not.toBeUndefined();
    });

    Object.keys(imgProps)
      .filter(k => k !== "alt")
      .forEach(k => {
        it(`should have props.${k} set`, () => {
          expect(vdom.props[k]).toBe(imgProps[k]);
        });
      });
    it(`should not have props.alt set`, () => {
      expect(vdom.props.alt).toBe(undefined);
    });
  };

  describe("with generateSrcSet", () => {
    beforeEach(() => {
      tree = sd.shallowRender(
        <Imgix
          src={src}
          type="source"
          generateSrcSet
          aggressiveLoad
          imgProps={imgProps}
        />
      );
      vdom = tree.getRenderOutput();
      instance = tree.getMountedInstance();
    });

    shouldBehaveLikeSource();
    it("should have props.srcSet set to a valid src", () => {
      expect(vdom.props.srcSet).toContain(src);
      expect(vdom.props.srcSet).toContain("2x");
    });
  });

  describe("without generateSrcSet", () => {
    beforeEach(() => {
      tree = sd.shallowRender(
        <Imgix
          src={src}
          type="source"
          generateSrcSet={false}
          aggressiveLoad
          imgProps={imgProps}
        />
      );
      vdom = tree.getRenderOutput();
      instance = tree.getMountedInstance();
    });
    shouldBehaveLikeSource();
    it("should have props.srcSet set to src", () => {
      expect(vdom.props.srcSet).toMatch(new RegExp(`^${src}`));
    });
  });
});

describe("<picture> type", () => {
  let children, lastChild;
  const parentAlt = "parent alt";
  const childAlt = "child alt";

  const shouldBehaveLikePicture = function() {
    it("should have key set on every child", () => {
      expect(children.every(c => c.key !== undefined)).toBe(true);
    });

    it("should render a picture", () => {
      expect(vdom.type).toBe("picture");
    });

    it("should not have an alt tag", () => {
      expect(vdom.alt).toBe(undefined);
    });

    it("should have either an <img> or a <ReactImgix type=img> as its last child", () => {
      if (lastChild.type.hasOwnProperty("name")) {
        expect(lastChild.type.name).toBe("ReactImgix");
        expect(lastChild.props.type).toBe("img");
      } else {
        expect(lastChild.type).toBe("img");
      }
    });
  };

  describe("with no children", () => {
    const imgProps = { className: "foobar", alt: parentAlt };
    beforeEach(() => {
      tree = sd.shallowRender(
        <Imgix src={src} type="picture" agressiveLoad imgProps={imgProps} />
      );
      vdom = tree.getRenderOutput();
      instance = tree.getMountedInstance();
      children = vdom.props.children;
      lastChild = children[children.length - 1];
    });

    shouldBehaveLikePicture();

    it("should only have one child", () => {
      expect(children.length).toBe(1);
    });

    it("should pass props down to automatically added type=img", () => {
      // todo - verify all valid props are passed down to children as defaults
      // except for the ones we specifically exclude
      let expectedProps = Object.assign(
        {},
        instance.props,
        { type: "img" },
        { imgProps }
      );
      expectedProps.className = expectedProps.imgProps.className;
      delete expectedProps.bg;
      delete expectedProps.children;
      delete expectedProps.component;
      delete expectedProps.imgProps.className;
      expect(lastChild.props).toEqual(expectedProps);
    });
  });

  describe("with a <ReactImgix type=img> as a child", () => {
    beforeEach(() => {
      tree = sd.shallowRender(
        <Imgix
          src={src}
          type="picture"
          agressiveLoad
          faces={false}
          entropy
          imgProps={{ alt: parentAlt }}
        >
          <Imgix src={src} type="img" imgProps={{ alt: childAlt }} />
        </Imgix>
      );
      vdom = tree.getRenderOutput();
      instance = tree.getMountedInstance();
      children = vdom.props.children;
      lastChild = children[children.length - 1];
    });

    shouldBehaveLikePicture();
    it("should only have one child", () => {
      expect(children.length).toBe(1);
    });
    it("should not pass props down to children", () => {
      expect(lastChild.props.faces).toBe(true);
      expect(lastChild.props.entropy).toBe(false);
      expect(lastChild.props.imgProps.alt).toEqual(childAlt);
    });
  });

  describe("with an <img> as a child", () => {
    beforeEach(() => {
      tree = sd.shallowRender(
        <Imgix
          src={src}
          type="picture"
          agressiveLoad
          faces={false}
          entropy
          imgProps={{ alt: parentAlt }}
        >
          <img src={src} alt={childAlt} />
        </Imgix>
      );
      vdom = tree.getRenderOutput();
      instance = tree.getMountedInstance();
      children = vdom.props.children;
      lastChild = children[children.length - 1];
    });

    shouldBehaveLikePicture();
    it("should only have one child", () => {
      expect(children.length).toBe(1);
    });
    it("should not pass props down to children", () => {
      expect(lastChild.props.faces).toBe(undefined);
      expect(lastChild.props.entropy).toBe(undefined);
      expect(lastChild.props.alt).toEqual(childAlt);
    });
  });
});

const shouldBehaveLikeBg = function(size = "cover") {
  it("should render a div", () => {
    expect(vdom.type).toBe("div");
  });
  it("should have the appropriate styles", () => {
    expect(vdom.props.style.backgroundImage).toContain(src);
    expect(vdom.props.style.backgroundSize).toBe(size);
  });
};

describe("background type", () => {
  beforeEach(() => {
    tree = sd.shallowRender(<Imgix src={src} type="bg" aggressiveLoad />);
    vdom = tree.getRenderOutput();
    instance = tree.getMountedInstance();
  });
  shouldBehaveLikeBg();
});

describe("background type without backgroundSize", () => {
  beforeEach(() => {
    tree = sd.shallowRender(
      <Imgix
        src={src}
        type="bg"
        imgProps={{ style: { backgroundSize: null } }}
        aggressiveLoad
      />
    );
    vdom = tree.getRenderOutput();
    instance = tree.getMountedInstance();
  });
  shouldBehaveLikeBg(null);
});

describe("background type with background contain", () => {
  beforeEach(() => {
    tree = sd.shallowRender(
      <Imgix
        src={src}
        type="bg"
        imgProps={{ style: { backgroundSize: "contain" } }}
        aggressiveLoad
      />
    );
    vdom = tree.getRenderOutput();
    instance = tree.getMountedInstance();
  });
  shouldBehaveLikeBg("contain");
});

// These tests emulate the pre-mount state as `tree.getMountedInstance()` isn't called
describe("background mode - pre-mount", () => {
  beforeEach(() => {
    tree = sd.shallowRender(<Imgix src={src} type="bg" />);
    vdom = tree.getRenderOutput();
  });
  it("should not have an empty url()", () => {
    expect(vdom.props.style.backgroundImage).toBe(null);
    expect(vdom.props.style.backgroundSize).toBe("cover");
  });
});
describe("custom component", () => {
  beforeEach(() => {
    tree = sd.shallowRender(
      <Imgix src={src} component="li" type="bg" aggressiveLoad />
    );
    vdom = tree.getRenderOutput();
    instance = tree.getMountedInstance();
  });
  it("should render the custom component", () => {
    expect(vdom.props.style.backgroundImage).toContain(src);
    expect(vdom.type).toBe("li");
  });
});
describe("image props", () => {
  let className = "img--enabled";
  beforeEach(() => {
    tree = sd.shallowRender(
      <Imgix
        src={src}
        auto={["format", "enhance"]}
        className={className}
        aggressiveLoad
        faces
      />
    );
    vdom = tree.getRenderOutput();
    instance = tree.getMountedInstance();
  });
  it("auto prop", () => {
    expect(vdom.props.src).toContain("auto=format%2Cenhance");
  });
  it("className prop", () => {
    expect(vdom.props.className).toContain(className);
  });
  it("crop prop", () => {
    tree = sd.shallowRender(
      <Imgix src={src} aggressiveLoad crop="faces,entropy" />
    );
    vdom = tree.getRenderOutput();

    expect(vdom.props.src).toContain("crop=faces%2Centropy");
    expect(vdom.props.src).toContain("fit=crop");
  });
  it("crop prop overrides faces prop", () => {
    tree = sd.shallowRender(
      <Imgix src={src} aggressiveLoad faces crop="faces,entropy" />
    );
    vdom = tree.getRenderOutput();

    expect(vdom.props.src).toContain("crop=faces%2Centropy");
    expect(vdom.props.src).toContain("fit=crop");
  });
  it("crop prop overrides entropy prop", () => {
    tree = sd.shallowRender(
      <Imgix src={src} aggressiveLoad entropy crop="faces,entropy" />
    );
    vdom = tree.getRenderOutput();

    expect(vdom.props.src).toContain("crop=faces%2Centropy");
    expect(vdom.props.src).toContain("fit=crop");
  });
  it("faces prop", () => {
    expect(vdom.props.src).toContain("crop=faces");
  });
  it("fit prop", () => {
    expect(vdom.props.src).toContain("fit=crop");
  });
  it("entropy prop", () => {
    tree = sd.shallowRender(<Imgix src={src} aggressiveLoad entropy />);
    vdom = tree.getRenderOutput();

    expect(vdom.props.src).toContain("crop=entropy");
    expect(vdom.props.src).toContain("fit=crop");
  });
  it("url encodes param keys", () => {
    tree = sd.shallowRender(
      <Imgix
        src={"https://mysource.imgix.net/demo.png"}
        aggressiveLoad
        customParams={{
          "hello world": "interesting"
        }}
      />
    );
    vdom = tree.getRenderOutput();

    expect(vdom.props.src).toEqual(
      "https://mysource.imgix.net/demo.png?auto=format&dpr=1&hello%20world=interesting&crop=faces&fit=crop&w=1&h=1"
    );
  });
  it("url encodes param values", () => {
    tree = sd.shallowRender(
      <Imgix
        src={"https://mysource.imgix.net/demo.png"}
        aggressiveLoad
        customParams={{
          hello_world: '/foo"> <script>alert("hacked")</script><'
        }}
      />
    );
    vdom = tree.getRenderOutput();

    expect(vdom.props.src).toEqual(
      "https://mysource.imgix.net/demo.png?auto=format&dpr=1&hello_world=%2Ffoo%22%3E%20%3Cscript%3Ealert(%22hacked%22)%3C%2Fscript%3E%3C&crop=faces&fit=crop&w=1&h=1"
    );
  });
  it("Base64 encodes Base64 param variants", () => {
    tree = sd.shallowRender(
      <Imgix
        src={"https://mysource.imgix.net/~text"}
        aggressiveLoad
        customParams={{
          txt64: "I cannøt belîév∑ it wors! 😱"
        }}
      />
    );
    vdom = tree.getRenderOutput();

    expect(vdom.props.src).toEqual(
      "https://mysource.imgix.net/~text?auto=format&dpr=1&txt64=SSBjYW5uw7h0IGJlbMOuw6l24oiRIGl0IHdvcu-jv3MhIPCfmLE&crop=faces&fit=crop&w=1&h=1"
    );
  });
  // it('fluid prop', () => {
  //   expect(vdom.props.src).to.include('auto=format,enhance')
  // })
  // it('precision prop', () => {
  //   expect(vdom.props.src).to.include('auto=format,enhance')
  // })
  // it.skip('custom props', () => {
  //   expect(vdom.props.src).to.include('auto=format,enhance')
  // })
  it("generateSrcSet prop", () => {
    tree = sd.shallowRender(<Imgix src={src} aggressiveLoad generateSrcSet />);
    vdom = tree.getRenderOutput();

    expect(vdom.props.srcSet).toContain("dpr=2");
    expect(vdom.props.srcSet).toContain("dpr=3");
  });
  it("height passed to url param", () => {
    const height = 300;
    tree = sd.shallowRender(
      <Imgix
        src={"https://mysource.imgix.net/demo.png"}
        aggressiveLoad
        height={height}
      />
    );
    vdom = tree.getRenderOutput();

    expect(vdom.props.src).toEqual(
      `https://mysource.imgix.net/demo.png?auto=format&dpr=1&crop=faces&fit=crop&w=1&h=${height}`
    );
  });

  it("height between 0 and 1 not passed to childProps", () => {
    const height = 0.5;
    tree = sd.shallowRender(
      <Imgix
        src={"https://mysource.imgix.net/demo.png"}
        aggressiveLoad
        height={height}
      />
    );
    vdom = tree.getRenderOutput();

    expect(vdom.props.height).toBeFalsy();
  });

  it("height greater than 1 passed to childProps", () => {
    const height = 300;
    tree = sd.shallowRender(
      <Imgix
        src={"https://mysource.imgix.net/demo.png"}
        aggressiveLoad
        height={height}
      />
    );
    vdom = tree.getRenderOutput();

    expect(vdom.props.height).toEqual(height);
  });

  it("width passed to url param", () => {
    const width = 300;
    tree = sd.shallowRender(
      <Imgix
        src={"https://mysource.imgix.net/demo.png"}
        aggressiveLoad
        width={width}
      />
    );
    vdom = tree.getRenderOutput();

    expect(vdom.props.src).toEqual(
      `https://mysource.imgix.net/demo.png?auto=format&dpr=1&crop=faces&fit=crop&w=${width}&h=1`
    );
  });

  it("width between 0 and 1 not passed to childProps", () => {
    const width = 0.5;
    tree = sd.shallowRender(
      <Imgix
        src={"https://mysource.imgix.net/demo.png"}
        aggressiveLoad
        width={width}
      />
    );
    vdom = tree.getRenderOutput();

    expect(vdom.props.width).toBeFalsy();
  });

  it("width greater than 1 passed to childProps", () => {
    const width = 300;
    tree = sd.shallowRender(
      <Imgix
        src={"https://mysource.imgix.net/demo.png"}
        aggressiveLoad
        width={width}
      />
    );
    vdom = tree.getRenderOutput();

    expect(vdom.props.width).toEqual(width);
  });

  it("accepts any prop passed to imgProps", () => {
    const imgProps = {
      alt: "Example alt attribute",
      "data-src": "https://mysource.imgix.net/demo.png"
    };
    tree = sd.shallowRender(
      <Imgix src={"https://mysource.imgix.net/demo.png"} imgProps={imgProps} />
    );
    vdom = tree.getRenderOutput();

    expect(vdom.props.alt).toEqual(imgProps.alt);
    expect(vdom.props["data-src"]).toEqual(imgProps["data-src"]);
  });

  it("onMounted callback is called", () => {
    const onMountedSpy = sinon.spy();
    const mockImage = <img />;

    tree = sd.shallowRender(
      <Imgix
        src={"https://mysource.imgix.net/demo.png"}
        onMounted={onMountedSpy}
      />
    );
    instance = tree.getMountedInstance();
    sinon.stub(ReactDOM, "findDOMNode").callsFake(() => mockImage);
    instance.componentDidMount();

    sinon.assert.calledWith(onMountedSpy, mockImage);

    ReactDOM.findDOMNode.restore();
  });
});
