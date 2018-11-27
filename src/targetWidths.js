function targetWidths() {
  const resolutions = [];
  let prev = 100;
  const INCREMENT_PERCENTAGE = 8;
  const MAX_SIZE = 8192;

  const ensureEven = n => 2 * Math.round(n / 2);

  resolutions.push(prev);
  while (prev <= MAX_SIZE) {
    prev *= 1 + (INCREMENT_PERCENTAGE / 100) * 2;
    resolutions.push(ensureEven(prev));
  }

  return resolutions;
}

export default targetWidths();
