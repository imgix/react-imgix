const MAX_SIZE = 8192;

function createTargetWidths(maxSize = MAX_SIZE) {
  const resolutions = [];
  let prev = 100;
  const INCREMENT_PERCENTAGE = 8;

  const ensureEven = n => 2 * Math.round(n / 2);

  while (prev <= MAX_SIZE) {
    resolutions.push(ensureEven(prev));
    prev *= 1 + (INCREMENT_PERCENTAGE / 100) * 2;
  }

  resolutions.push(MAX_SIZE);
  return resolutions;
}

export default createTargetWidths;
