export default function extractQueryParams(src) {
  const splitSrc = src.split("?");
  const url = splitSrc[0];
  const query = splitSrc[1];
  if (!query) {
    return [url, {}];
  }
  const paramsPairs = query.split("&");
  const params = {};
  const len = paramsPairs.length;
  for (let i = 0; i < len; i++) {
    const param = paramsPairs[i];
    const splitParam = param.split("=");
    const key = splitParam[0];
    const val = splitParam[1];
    params[key] = decodeURIComponent(val);
  }
  return [url, params];
}
