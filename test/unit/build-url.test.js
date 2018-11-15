import { buildURL } from "index";

test("buildURL builds a url correctly", () => {
  const actual = buildURL("https://demo.imgix.net/abc.png", { w: 450, h: 100 });

  const actualURL = new URL(actual);
  expect(actualURL.searchParams.get("w")).toBe("450");
  expect(actualURL.searchParams.get("h")).toBe("100");
});
