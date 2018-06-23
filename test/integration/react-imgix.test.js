import Imgix from "react-imgix";

import React from "react";
import { mount, shallow } from "enzyme";

const src = "http://assets.imgix.net/unsplash/lighthouse.jpg";
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

describe("When in default mode", () => {
  const renderImage = () =>
    renderIntoContainer(
      <div
        style={{
          width: 105,
          height: 100,
          display: "flex",
          alignItems: "stretch"
        }}
      >
        <Imgix
          src={src}
          // width={100}
          // height={100}
          // style={{ height: 100, width: 100 }}
        />
      </div>
    );

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
});
