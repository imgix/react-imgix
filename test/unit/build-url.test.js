import { buildURL } from "index";

test("buildURL builds a url correctly", () => {
  const actual = buildURL("https://demo.imgix.net/abc.png", { w: 450, h: 100 });

  const actualURL = new URL(actual);
  expect(actualURL.searchParams.get("w")).toBe("450");
  expect(actualURL.searchParams.get("h")).toBe("100");
});

test("buildURL includes an ixlib parameter", () => {
  const actual = buildURL("https://demo.imgix.net/abc.png", { w: 450, h: 100 });

  const actualURL = new URL(actual);
  expect(actualURL.searchParams.get("ixlib")).toEqual(
    createIxLibParamMatcher()
  );
});

test("ixlib addition can be disabled with disableLibraryParam", () => {
  const actual = buildURL(
    "https://demo.imgix.net/abc.png",
    { w: 450, h: 100 },
    { disableLibraryParam: true }
  );

  const actualURL = new URL(actual);
  expect(actualURL.searchParams.has("ixlib")).toBe(false);
});

test("parameters that already exist in the url are overriden", () => {
  const actual = buildURL("https://demo.imgix.net/abc.png?w=50&h=50", {
    w: 100,
    h: 100
  });

  const actualURL = new URL(actual);
  expect(actualURL.searchParams.get("w")).toBe("100");
  expect(actualURL.searchParams.get("h")).toBe("100");
});

const createIxLibParamMatcher = () => {
  const expectedVersion = require("read-pkg-up").sync().pkg.version;
  const expectedParam = `react-${expectedVersion}`;

  return expect.stringContaining(expectedParam);
};
