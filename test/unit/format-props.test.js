import { formatProps } from "../../src/HOFs/propFormatter";

describe("formatProps()", () => {
  it("should set width to undefined if negative", () => {
    const props = { height: 100, src: "/pione.jpg", width: -100 };
    const result = formatProps(props);
    const expected = { height: 100, src: "/pione.jpg", width: undefined };

    expect(result).toEqual(expected);
  });

  it("should set height to undefined if negative", () => {
    const props = { height: -100, src: "/pione.jpg", width: 100 };
    const result = formatProps(props);
    const expected = { height: undefined, src: "/pione.jpg", width: 100 };

    expect(result).toEqual(expected);
  });

  it("should set src to 1-step URL if domain prop present", () => {
    const props = {
      domain: "assets.imgix.net",
      src: "/pione.jpg",
      width: 100,
    };
    const result = formatProps(props);
    const expected = {
      height: undefined,
      domain: "assets.imgix.net",
      src: "https://assets.imgix.net/pione.jpg",
      width: 100,
    };

    expect(result).toEqual(expected);
  });

  it("should set src to insecure 1-step URL if useHttp prop false", () => {
    const props = {
      domain: "assets.imgix.net",
      src: "/pione.jpg",
      width: 100,
      useHttps: false,
    };
    const result = formatProps(props);
    const expected = {
      height: undefined,
      domain: "assets.imgix.net",
      src: "http://assets.imgix.net/pione.jpg",
      width: 100,
      useHttps: false,
    };

    expect(result).toEqual(expected);
  });
});
