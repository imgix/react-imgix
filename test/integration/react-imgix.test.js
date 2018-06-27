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
  const renderImage = () => renderIntoContainer(<Imgix src={src} />);

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
        imgProps={{
          alt: "This is alt text"
        }}
        precision={1}
      />
    );

    let { width, height } = renderedImage.getDOMNode().getBoundingClientRect();

    expect({ width, height }).toMatchObject({
      width: 532,
      height: 800
    });
  });
  it("should render image with dimensions of the size of the element", async () => {
    const sut = renderIntoContainer(
      <div>
        <style>
          {`
					img {
						width: 266px;
						height: 400px;
					}
					`}
        </style>
        <Imgix src={src} precision={1} />
      </div>
    );

    let renderedSrc = sut.find("img").props().src;
    expect(renderedSrc).toContain(`w=266`);
    expect(renderedSrc).toContain(`h=400`);
  });
});
