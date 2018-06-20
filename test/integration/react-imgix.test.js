import Imgix from "react-imgix";

import React from "react";
import { mount, shallow } from "enzyme";

const src = "http://domain.imgix.net/image.jpg";
describe("When in default mode", () => {
  const renderImage = () => mount(<Imgix src={src} />);

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
