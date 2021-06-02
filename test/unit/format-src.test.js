import { formatSrc } from "../../src/HOFs/propFormatter"

describe('fromatSrc()', () => {
  it('should create a 1-step URL from a 2-step URL', () => {
    const domain = 'sdk-test.imgix.net'
    const src = 'pione.jpg'
    const url = formatSrc(src, domain)
    const expected = 'https://sdk-test.imgix.net/pione.jpg'
    expect(url).toBe(expected)
  })

  it('should correctly interpret trailing slashes', () => {
    const domain = 'sdk-test.imgix.net/'
    const src = 'pione.jpg/'
    const url = formatSrc(src, domain)
    const expected = 'https://sdk-test.imgix.net/pione.jpg'
    expect(url).toBe(expected)
  })


  it('should correctly interpret leading slashes', () => {
    const domain = '/sdk-test.imgix.net'
    const src = '/pione.jpg'
    const url = formatSrc(src, domain)
    const expected = 'https://sdk-test.imgix.net/pione.jpg'
    expect(url).toBe(expected)
  })

  it('should do nothing to a 2-step URL', () => {
    const domain = 'assets.imgix.net'
    const src = 'https://sdk-test.imgix.net/pione.jpg'
    const url = formatSrc(src, domain)
    const expected = 'https://sdk-test.imgix.net/pione.jpg'
    expect(url).toBe(expected)
  })

  it('should do nothing if domain is undefined', () => {
    const domain = undefined
    const src = '/pione.jpg'
    const url = formatSrc(src, domain)
    const expected = '/pione.jpg'
    expect(url).toBe(expected)
  })

  it('should do nothing if domain is null', () => {
    const domain = null
    const src = '/pione.jpg'
    const url = formatSrc(src, domain)
    const expected = '/pione.jpg'
    expect(url).toBe(expected)
  })
})
