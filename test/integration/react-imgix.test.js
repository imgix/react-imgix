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
      imgProps: {
        ...(element.props.imgProps || {}),
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
        imgProps={{
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
