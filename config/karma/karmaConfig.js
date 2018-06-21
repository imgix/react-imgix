const webpack = require("karma-webpack");
const webpackConfig = require("../webpackConfig");
const baseConfig = {
  frameworks: [
    "mocha"
    // , "chai", "sinon", "sinon-chai"
  ],
  files: [
    // { pattern: "src/**/*.js", included: false, served: false },
    "../../test/tests.webpack.js"
    // "test/integration/**/*.js"
  ],
  plugins: [
    webpack,
    "karma-mocha",
    // "karma-coverage",
    // "karma-spec-reporter",
    // "karma-chai",
    "karma-chrome-launcher"
    // "karma-sourcemap-loader",
    // "karma-webpack",
    // "karma-mocha-reporter",
    // "karma-sinon",
    // "karma-sinon-chai"
  ],
  preprocessors: {
    // "src/**/*.js": "webpack",
    // "test/**/*.js": "webpack"
    "../../test/tests.webpack.js": "webpack"
  },
  concurrency: 5,
  captureTimeout: 90000,
  browserConnectTimeout: 3000,
  browserNoActivityTimeout: 15000,
  webpack: webpackConfig
};

exports.headless = karmaConfig => {
  process.env.CHROME_BIN = require("puppeteer").executablePath();
  const headlessConfig = {
    ...baseConfig,
    browsers: ["ChromeHeadless"]
  };
  karmaConfig.set(headlessConfig);
};

const localConfig = {
  ...baseConfig,
  browsers: [
    "Chrome"
    // , "Firefox"
  ]
};

const browserslist = require("browserslist");

const browsers = browserslist();

const availableOnWindows = browser =>
  ["ie", "edge", "chrome", "firefox"].includes(browser);
const availableOnOSX = browser =>
  ["safari", "chrome", "firefox"].includes(browser);

const oldestVersionFromRange = versionRange => {
  if (versionRange.includes("-")) {
    return versionRange.split("-")[0];
  }
  return versionRange;
};
const isDesktop = browserOrPlatform =>
  ["chrome", "firefox", "safari", "edge", "ie"].includes(browserOrPlatform);
const getOSVersionForMobileChromeVersion = version => {
  if (Number.parseFloat(version) >= 5) {
    // Have to approximate os version as chrome versions are not tied to android versions after 4.4
    return "8.0";
  }
  return version;
};
const mapBrowsersListToBrowserStackLaunchers = browserslistList => {
  let browserStackConfigurationObjects = {};
  browserslistList.map(browsersListItem => {
    const [browserOrPlatform, versionRange] = browsersListItem.split(" ");
    const version = oldestVersionFromRange(versionRange);
    if (isDesktop(browserOrPlatform)) {
      if (availableOnWindows(browserOrPlatform)) {
        browserStackConfigurationObjects[
          `bs_${browserOrPlatform}_${version}_windows`
        ] = {
          base: "BrowserStack",
          browser: browserOrPlatform,
          browser_version: version,
          os: "WINDOWS",
          os_version: "10"
        };
      }
      if (availableOnOSX(browserOrPlatform)) {
        browserStackConfigurationObjects[
          `bs_${browserOrPlatform}_${version}_os_x`
        ] = {
          base: "BrowserStack",
          browser: browserOrPlatform,
          browser_version: version,
          os: "OS X",
          os_version: "High Sierra"
        };
      }
    } else {
      const isIOS = browserOrPlatform === "ios_saf";
      browserStackConfigurationObjects[`bs_${browserOrPlatform}_${version}`] = {
        base: "BrowserStack",
        device: isIOS ? "iPhone X" : "Google Pixel 2",
        real_mobile: true,
        os: isIOS ? "ios" : "android",
        os_version: isIOS
          ? version
          : getOSVersionForMobileChromeVersion(version)
      };
    }
  });
  return {
    browsers: Object.keys(browserStackConfigurationObjects),
    customLaunchers: browserStackConfigurationObjects
  };
};
console.log(mapBrowsersListToBrowserStackLaunchers(browsers));

var fullConfig = karmaConfig => {
  const browserslist = require("browserslist");
  const { browsers, customLaunchers } = mapBrowsersListToBrowserStackLaunchers(
    browserslist()
  );

  karmaConfig.set({
    ...baseConfig,
    browserStack: {
      username: process.env.BROWSERSTACK_USERNAME,
      accessKey: process.env.BROWSERSTACK_ACCESS_KEY
    },
    // reporters: ["progress", "saucelabs"],
    reporters: ["dots", "BrowserStack"],
    browsers,
    customLaunchers,
    plugins: [...baseConfig.plugins, "karma-browserstack-launcher"]
  });
};

const wrapInSetConfig = configObject => karmaConfig =>
  karmaConfig.set(configObject);

// exports.headless = wrapInSetConfig(headlessConfig);
exports.local = wrapInSetConfig(localConfig);
exports.full = fullConfig;
