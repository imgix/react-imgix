import findClosest from "findClosest";

test("when closest value is below the search value", () =>
  expect(findClosest(101, [100, 200])).toBe(100));
test("when closest value is above the search value", () =>
  expect(findClosest(151, [100, 200])).toBe(200));
test.only("when closest value is the median of two nearest values, the largest value is returned", () =>
  expect(findClosest(150, [100, 200])).toBe(200));

test("Edge cases", () => {
  test("when value is smaller than the entire array", () =>
    expect(findClosest(80, [100, 200])).toBe(100));
  test("when value is larger than the entire array", () =>
    expect(findClosest(205, [100, 200])).toBe(200));
});
