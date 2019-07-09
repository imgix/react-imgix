export default function extractQueryParams(src) {
  const [url, query] = src.split("?");
  const params = query
    ? query
        .split("&")
        .map(x => {
          const [key, val] = x.split("=");
          return [key, decodeURIComponent(val)];
        })
        .reduce((obj, [key, val]) => Object.assign(obj, { [key]: val }), {})
    : {};
  return [url, params];
}
