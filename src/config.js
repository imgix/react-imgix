const config = {
  warnings: {
    fallbackImage: true,
    sizesAttribute: true,
    invalidARFormat: true,
  },
};

const _setWarning = (name, value) => {
  if (!name || !(name in config.warnings)) {
    return;
  }
  config.warnings[name] = value;
};

class PublicConfigAPI {
  static disableWarning(name) {
    _setWarning(name, false);
  }
  static enableWarning(name) {
    _setWarning(name, true);
  }
}

export default config;
export { PublicConfigAPI };
