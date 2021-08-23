const browserList_browserStack = require("browserslist-browserstack");
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
    "karma-chrome-launcher",
  ],
  preprocessors: {
    "../../test/tests.webpack.js": "webpack",
  },
  reporters: ["mocha"],
  captureTimeout: 100000,
  browserConnectTimeout: 3000,
  browserNoActivityTimeout: 60000,
  webpack: webpackConfig,
  webpackMiddleware: {},
  concurrency: 5,
};

/**
 * Local testing - headless browsers
 */

const headlessConfig = (karmaConfig) => {
  process.env.CHROME_BIN = require("puppeteer").executablePath();
  const headlessConfig = {
    ...baseConfig,
    browsers: ["ChromeHeadless"],
    webpack: {
      ...baseConfig.webpack,
      stats: "errors-only",
    },
    webpackMiddleware: {
      ...baseConfig.webpackMiddleware,
      stats: "errors-only",
    },
  };
  karmaConfig.set(headlessConfig);
};

/**
 * Local testing - full browsers
 */

const localConfig = (karmaConfig) => {
  const browsers = [
    "ChromeHeadless",
    "FirefoxHeadless",
    ...(process.platform === "darwin" ? ["Safari"] : []),
  ];
  karmaConfig.set({
    ...baseConfig,
    browsers,
    customLaunchers: {
      FirefoxHeadless: {
        base: "Firefox",
        flags: ["-headless"],
      },
    },

    webpack: {
      ...baseConfig.webpack,
      stats: "errors-only",
    },
    webpackMiddleware: {
      ...baseConfig.webpackMiddleware,
      stats: "errors-only",
    },
  });
};

/**
 * CI testing - Chrome, Firefox, and (if available) BrowserStack
 */

const headlessConfigCI = (karmaConfig) => {
  const config = {
    ...baseConfig,
    reporters: [...baseConfig.reporters],
    browsers: ["ChromeTravis", "FirefoxHeadless"],
    customLaunchers: {
      ChromeTravis: {
        base: "ChromeHeadless",
        flags: ["--no-sandbox"],
      },
      FirefoxHeadless: {
        base: "Firefox",
        flags: ["-headless"],
      },
    },
    plugins: [...baseConfig.plugins],
    client: {
      mocha: {
        timeout: 20000, // 20 seconds
      },
    },
  };

  karmaConfig.set(config);
};

const formatForKarma = (capabilities, browserBase) => {
  const res = {};
  // store each capability in a separate key with a browser name as the key
  capabilities.forEach((capability) => {
    // extend the object
    capability.base = browserBase;
    // define a unique browser name
    const { browser, browser_version, os, os_version } = capability;
    const karmaBrowserName = `bs_${browser}_${browser_version}_${os}_${os_version}`;
    // set the browser name as the key for the capabilities object
    res[karmaBrowserName] = capability;
  });

  return {
    browsers: Object.keys(res),
    customLaunchers: res,
  };
};

const mapBrowsersListToBrowserStackLaunchers = async () => {
  return await browserList_browserStack
    .default({
      username: process.env.BROWSERSTACK_USERNAME,
      accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
      browserslist: {
        queries: [
          "ie >= 11",
          "last 1 Android versions",
          "last 1 Chrome versions",
          "last 1 Firefox versions",
          "last 1 Safari versions",
          "last 1 iOS versions",
          "last 1 Edge versions",
          "last 1 Opera versions",
        ], // TODO: pull in the package.json version
      },
      formatForSelenium: false,
    })
    .then((res) => {
      return formatForKarma(res, "BrowserStack");
    });
};

const fullConfig = async (karmaConfig) => {
  if (!isBrowserStackAvailable()) {
    console.log("BrowserStack not available");
    process.exit(0);
  }
  const allBrowsers = await mapBrowsersListToBrowserStackLaunchers();
  const {
    browsers: bsBrowsers,
    customLaunchers: customBSLaunchers,
  } = allBrowsers;

  console.log(`Using BrowserStack browsers: ${bsBrowsers}`);
  console.log(`Using BrowserStack custom browsers: ${customBSLaunchers}`);

  const bsBrowsersWithoutChromeAndFirefox = bsBrowsers.filter(
    (browser) => !(browser.includes("chrome") || browser.includes("firefox"))
  );

  const config = {
    ...baseConfig,

    hostname: "bs-local.com",
    port: 9876,
    browserStack: {
      username: process.env.BROWSERSTACK_USERNAME,
      accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
      build: `react-imgix-bs-${new Date().toLocaleDateString()}`,
    },

    browsers: bsBrowsersWithoutChromeAndFirefox,
    reporters: [...baseConfig.reporters],
    customLaunchers: customBSLaunchers,
    plugins: [...baseConfig.plugins, "karma-browserstack-launcher"],
    client: {
      mocha: {
        timeout: 20000, // 20 seconds
      },
    },
  };

  console.log(
    "Testing on browsers:\n",
    config.browsers.map((browser) => ` - ${browser}`).join("\n")
  );

  karmaConfig.set(config);
};

function isBrowserStackAvailable() {
  if (
    !(process.env.BROWSERSTACK_USERNAME && process.env.BROWSERSTACK_ACCESS_KEY)
  ) {
    return false;
  }

  // If the slugs are different, the PR comes from an outsider (not a collaborator)
  return (
    process.env.TRAVIS_EVENT_TYPE !== "pull_request" ||
    process.env.TRAVIS_PULL_REQUEST_SLUG === process.env.TRAVIS_REPO_SLUG
  );
}

exports.full = fullConfig;
exports.local = localConfig;
exports.headless = headlessConfig;
exports.headlessCI = headlessConfigCI;
