// Taken from https://github.com/imgix/imgix.js/blob/eff194416a0efc9f0c528eb070466cd474ae0bf5/src/targetWidths.js

function uniq(arr) {
  var n = {},
    r = [],
    i;

  for (i = 0; i < arr.length; i++) {
    if (!n[arr[i]]) {
      n[arr[i]] = true;
      r.push(arr[i]);
    }
  }

  return r;
}

const MINIMUM_SCREEN_WIDTH = 100;
const MAXIMUM_SCREEN_WIDTH = 2560;
const MAX_DPR = 2;
const SCREEN_STEP = 100;

// Screen data from http://gs.statcounter.com/screen-resolution-stats/mobile/worldwide

// With these resolutions we cover 80% of mobile devices
// prettier-ignore
const MOBILE_RESOLUTIONS = [320, 360, 375, 414, 480, 540, 640, 720, 1080]

// With these resolutions we cover 90% of tablets
// prettier-ignore
const TABLET_RESOLUTIONS = [600, 768, 800, 962, 1024, 1280];

// With these resolutions we cover 80% of desktops
// prettier-ignore
const DESKTOP_RESOLUTIONS = [1024, 1280, 1366, 1440, 1536, 1600, 1680, 1820, 1920]

// Bootstrap breakpoints
const BOOTSTRAP_SM = { cssWidth: 576, dpr: 1 };
const BOOTSTRAP_SM_2X = { cssWidth: 576, dpr: 2 };
const BOOTSTRAP_MD = { cssWidth: 720, dpr: 1 };
const BOOTSTRAP_MD_2X = { cssWidth: 720, dpr: 2 };
const BOOTSTRAP_LG = { cssWidth: 940, dpr: 1 };
const BOOTSTRAP_LG_2X = { cssWidth: 940, dpr: 2 };
const BOOTSTRAP_XL = { cssWidth: 1140, dpr: 1 };
const BOOTSTRAP_XL_2X = { cssWidth: 1140, dpr: 2 };

const BOOTSTRAP_BREAKS = [
  BOOTSTRAP_SM,
  BOOTSTRAP_SM_2X,
  BOOTSTRAP_MD,
  BOOTSTRAP_MD_2X,
  BOOTSTRAP_LG,
  BOOTSTRAP_LG_2X,
  BOOTSTRAP_XL,
  BOOTSTRAP_XL_2X
];

function deviceWidths() {
  const widths = [
    ...MOBILE_RESOLUTIONS,
    ...TABLET_RESOLUTIONS,
    ...DESKTOP_RESOLUTIONS,
    ...BOOTSTRAP_BREAKS.map(device => device.cssWidth * device.dpr)
  ];
  return widths;
}

// Generates an array of physical screen widths to represent
// the different potential viewport sizes.
//
// We step by `SCREEN_STEP` to give some sanity to the amount
// of widths we output.
//
// The upper bound is the widest known screen on the planet.
// @return {Array} An array of {Fixnum} instances
function screenWidths(maxWidth) {
  const widths = [];

  for (let i = MINIMUM_SCREEN_WIDTH; i < maxWidth; i += SCREEN_STEP) {
    widths.push(i);
  }
  widths.push(maxWidth);

  return widths;
}

// Return the widths to generate given the input `sizes`
// attribute.
//
// @return {Array} An array of {Fixnum} instances representing the unique `srcset` URLs to generate.
function targetWidths() {
  const minPxWidthRequired = SCREEN_STEP;
  const maxPxWidthRequired = MAXIMUM_SCREEN_WIDTH * MAX_DPR;
  const _screenWidths = screenWidths(maxPxWidthRequired);
  const allWidths = deviceWidths().concat(_screenWidths);

  return uniq(allWidths).sort(function(x, y) {
    return x - y;
  });
}

export default targetWidths();
