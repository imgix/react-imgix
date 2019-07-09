import extractQueryParams from "extractQueryParams";

test("query param extraction", () => {
  const [src, params] = extractQueryParams(
    "https://demo.imgix.net/abc.png?w=100&auto=format,enhance"
  );
  expect(src).toEqual("https://demo.imgix.net/abc.png");
  expect(params).toEqual({ w: "100", auto: "format,enhance" });
});

test("returns empty object when no query parameters are present", () => {
  const [, params] = extractQueryParams("https://demo.imgix.net/abc.png");
  expect(params).toEqual({});
});

test("decodes encoded query parameters", () => {
  const [src, params] = extractQueryParams(
    "https://demo.imgix.net/abc.png?auto=format%2Cenhance&foo=%2Ffoo%22%20bar"
  );
  expect(params).toEqual({ auto: "format,enhance", foo: '/foo" bar' });
});
