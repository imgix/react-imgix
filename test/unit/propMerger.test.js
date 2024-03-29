import { mergeProps } from "../../src/HOFs/propMerger";

describe("mergeProps()", () => {
  it("should merge the `src` object into the `destination` object", () => {
    const src = { width: 100, height: 200, imgixParams: { ar: "1:2", dpr: 2 } };
    const destination = {};
    const result = mergeProps(src, destination);

    expect(result).toEqual({
      width: 100,
      height: 200,
      imgixParams: { ar: "1:2", dpr: 2 },
    });
  });

  it("should not overwrite destination values with source values", () => {
    const src = { width: 100 };
    const destination = { width: 101 };
    const result = mergeProps(src, destination);

    expect(result).toEqual({ width: 101 });
  });

  it("should not overwrite destination resolving to `null` if source exists", () => {
    const src = { domain: "foo.bar", height: 100 };
    const destination = { height: null };
    const result = mergeProps(src, destination);

    expect(result).toEqual({ domain: "foo.bar", height: null });
  });

  it("should not overwrite destination resolving to `undefined` if source exists", () => {
    const src = { domain: "foo.bar", height: 100 };
    const destination = { height: undefined };
    const result = mergeProps(src, destination);

    expect(result).toEqual({ domain: "foo.bar", height: undefined });
  });

  it("should recursively merge imgixParams and htmlAttributes", () => {
    const src = {
      imgixParams: { ar: "1:2", dpr: 2 },
      htmlAttributes: { styles: "width: 50", alt: "src" },
    };
    const destination = {
      imgixParams: { dpr: 1, fit: "fill" },
      htmlAttributes: { styles: "width: 100", className: "destination" },
    };
    const result = mergeProps(src, destination);

    expect(result).toEqual({
      imgixParams: { ar: "1:2", dpr: 1, fit: "fill" },
      htmlAttributes: {
        styles: "width: 100",
        className: "destination",
        alt: "src",
      },
    });
  });
});
