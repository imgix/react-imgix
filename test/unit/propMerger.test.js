import { mergeProps } from '../../src/HOFs/propMerger'

describe('mergeProps()', () => {
  it('should merge the `src` object into the `destination` object', () => {
    const src = { width: 100, height: 200, imgixParams: {ar: "1:2", dpr: 2} }
    const destination = { }
    const result = mergeProps(src, destination);

    expect(result).toEqual(
      { width: 100, height: 200, imgixParams: { ar: "1:2", dpr: 2 } }
    )
  })

  it('should not overwrite destination values with source values', () => {
    const src = { width: 100, height: 200, imgixParams: {ar: "1:2", dpr: 2} }
    const destination = { width: 101 }
    const result = mergeProps(src, destination);

    expect(result).toEqual(
      { width: 101, height: 200, imgixParams: { ar: "1:2", dpr: 2 } }
    )
  })

  it('should overwrite destination that resolves to `null` if source exists',
    () => {
      const src = { width: 100, height: 200, imgixParams: { ar: "1:1" } }
      const destination = { width: 101, height: null, imgixParams: { rot: 90 } }
      const result = mergeProps(src, destination);

      expect(result).toEqual(
        { width: 101, height: 200, imgixParams: { ar: "1:1", rot: 90 } }
      );
    }
  )

  it('should recursively merge imgixParams and htmlAttributes',
    () => {
      const src = {
        width: 100,
        height: 200,
        imgixParams: { ar: "1:2", dpr: 2},
        htmlAttributes: { styles: "width: 50" }
      }
      const destination = {
        width: 101,
        height: 201,
        imgixParams: { dpr: 1 },
        htmlAttributes: { styles: "width: 100" }
      }
      const result = mergeProps(src, destination);

      expect(result).toEqual(
        {
          width: 101,
          height: 201,
          imgixParams: { ar: "1:2", dpr: 1 },
          htmlAttributes: { styles: "width: 100" }
        }
      );
    }
  )

})
