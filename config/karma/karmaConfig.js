const webpack = require("karma-webpack");
const webpackConfig = require("../webpackConfig");
const baseConfig = {
  frameworks: ["mocha"],
  files: ["../../test/tests.webpack.js"],
  plugins: [
    webpack,
    require("karma-firefox-launcher"),
    require("karma-safari-launcher"),
    "karma-mocha",
    "karma-mocha-reporter",
    "karma-chrome-launcher"
  ],
  preprocessors: {
    "../../test/tests.webpack.js": "webpack"
  },
  reporters: ["mocha"],
  captureTimeout: 90000,
  browserConnectTimeout: 3000,
  browserNoActivityTimeout: 15000,
  webpack: webpackConfig,
  webpackMiddleware: {}
};

const headlessConfig = karmaConfig => {
  process.env.CHROME_BIN = require("puppeteer").executablePath();
  const headlessConfig = {
    ...baseConfig,
    browsers: ["ChromeHeadless"],
    webpack: {
      ...baseConfig.webpack,
      stats: "errors-only"
    },
    webpackMiddleware: {
      ...baseConfig.webpackMiddleware,
      stats: "errors-only"
    }
  };
  karmaConfig.set(headlessConfig);
};

const localConfig = karmaConfig => {
  const browsers = [
    "ChromeHeadless",
    "FirefoxHeadless",
    ...(process.platform === "darwin" ? ["Safari"] : [])
  ];
  karmaConfig.set({
    ...baseConfig,
    browsers,
    customLaunchers: {
      FirefoxHeadless: {
        base: "Firefox",
        flags: ["-headless"]
      }
    },

    webpack: {
      ...baseConfig.webpack,
      stats: "errors-only"
    },
    webpackMiddleware: {
      ...baseConfig.webpackMiddleware,
      stats: "errors-only"
    }
  });
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
// Update these values from https://www.browserstack.com/automate/capabilities#test-configuration-capabilities if the build fails
const getOSVersionAndDeviceForMobileChromeVersion = version => {
  if (Number.parseFloat(version) >= 5) {
    // Have to approximate os version as chrome versions are not tied to android versions after 4.4
    return {
      os_version: "8.0",
      device: "Google Pixel 2"
    };
  }
  return {
    os_version: "4.4",
    device: "Samsung Galaxy Tab 4"
  };
};
const getOSVersionAndDeviceForMobileSafariVersion = version => {
  const versionNumber = Number.parseFloat(version);
  if (10 <= versionNumber && versionNumber < 11) {
    return {
      os_version: "10.3",
      device: "iPhone 7"
    };
  }
  if (11 <= versionNumber && versionNumber < 12) {
    return {
      os_version: "11.0",
      device: "iPhone 8"
    };
  }
  // Try run test if version number is outside expected range
  return {
    os_version: `${Math.floor(versionNumber)}.0`,
    device: "iPhone 8"
  };
};
const ensureBrowserVersionExistsOnBrowserStack = (browser, version) => {
  const versionNumber = Number.parseFloat(version);
  if (browser.toLowerCase() === "safari") {
    if (11 <= versionNumber && versionNumber < 12) {
      return "11.1";
    }
    if (10 <= versionNumber && versionNumber < 11) {
      return "10.1";
    }
  }
  return version;
};

const ensureOSXVersionIsCorrect = (browser, version) => {
  const versionNumber = Number.parseFloat(version);
  if (browser.toLowerCase() === "safari") {
    if (11 <= versionNumber && versionNumber < 12) {
      return "High Sierra";
    }
    if (10 <= versionNumber && versionNumber < 11) {
      return "Sierra";
    }
  }
  return "High Sierra";
};
const mapBrowsersListToBrowserStackLaunchers = browserslistList => {
  let browserStackConfigurationObjects = {};
  browserslistList.forEach(browsersListItem => {
    const [browserOrPlatform, versionRange] = browsersListItem.split(" ");
    const version = oldestVersionFromRange(versionRange);
    if (isDesktop(browserOrPlatform)) {
      const versionSafe = ensureBrowserVersionExistsOnBrowserStack(
        browserOrPlatform,
        version
      );
      if (availableOnWindows(browserOrPlatform)) {
        browserStackConfigurationObjects[
          `bs_${browserOrPlatform}_${versionSafe}_windows`
        ] = {
          base: "BrowserStack",
          browser: browserOrPlatform,
          browser_version: versionSafe,
          os: "WINDOWS",
          os_version: "10"
        };
      }
      if (availableOnOSX(browserOrPlatform)) {
        browserStackConfigurationObjects[
          `bs_${browserOrPlatform}_${versionSafe}_os_x`
        ] = {
          base: "BrowserStack",
          browser: browserOrPlatform,
          browser_version: versionSafe,
          os: "OS X",
          os_version: ensureOSXVersionIsCorrect(browserOrPlatform, versionSafe)
        };
      }
    } else {
      const isIOS = browserOrPlatform === "ios_saf";
      const { os_version, device } = isIOS
        ? getOSVersionAndDeviceForMobileSafariVersion(version)
        : getOSVersionAndDeviceForMobileChromeVersion(version);
      browserStackConfigurationObjects[
        `bs_${browserOrPlatform}_${device}_${os_version}`
      ] = {
        base: "BrowserStack",
        device,
        real_mobile: true,
        os: isIOS ? "ios" : "android",
        os_version
      };
    }
  });
  return {
    browsers: Object.keys(browserStackConfigurationObjects),
    customLaunchers: browserStackConfigurationObjects
  };
};

const fullConfig = karmaConfig => {
  const browserslist = require("browserslist");
  const { browsers, customLaunchers } = mapBrowsersListToBrowserStackLaunchers(
    browserslist()
  );
  console.log(
    "Testing on browsers:\n",
    browsers.map(browser => ` - ${browser}`).join("\n")
  );

  karmaConfig.set({
    ...baseConfig,
    browserStack: {
      username: process.env.BROWSERSTACK_USERNAME,
      accessKey: process.env.BROWSERSTACK_ACCESS_KEY
    },
    reporters: [...baseConfig.reporters, "BrowserStack"],
    // TODO: Enable iPhone tests when BrowserStack support replies
    browsers: browsers.filter(v => !v.includes("iPhone")),
    customLaunchers,
    plugins: [...baseConfig.plugins, "karma-browserstack-launcher"]
  });
};

exports.full = fullConfig;
exports.local = localConfig;
exports.headless = headlessConfig;
