import { __shouldComponentUpdate } from "../../src/react-imgix-bg"

test("shouldComponentUpdate should return true when children change", () => {
  const contentRect = { bounds: { width: 100, height: 100 } };
  const props = { children: 0, contentRect }
  const nextProps = { children: 1 , contentRect}

  expect(__shouldComponentUpdate(props, nextProps)).toBe(true)
});

test("shouldComponentUpdate should return false when imgix-params don't change", () => {
  const contentRect = { bounds: { width: 100, height: 100 } };
  const props = { contentRect, imgixParams: {ar: "1:2"} }
  const nextProps = { contentRect, imgixParams: {ar: "1:2"} }

  expect(__shouldComponentUpdate(props, nextProps)).toBe(false)
});
