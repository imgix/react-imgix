import config, { PublicConfigAPI } from "config";

test("warnings can be disabled", () => {
  const warnings = Object.keys(config.warnings);
  if (warnings.length < 1) {
    fail("No warnings to configure");
  }
  const warning = warnings[0];
  // Set warning to true
  const oldValue = config.warnings[warning];
  config.warnings[warning] = true;

  PublicConfigAPI.disableWarning(warning);

  expect(config.warnings[warning]).toBeFalse();

  config.warnings[warning] = oldValue;
});

test("warnings can be disabled", () => {
  const warnings = Object.keys(config.warnings);
  if (warnings.length < 1) {
    fail("No warnings to configure");
  }
  const warning = warnings[0];
  // Set warning to false
  const oldValue = config.warnings[warning];
  config.warnings[warning] = false;

  PublicConfigAPI.enableWarning(warning);

  expect(config.warnings[warning]).toBeTrue();

  config.warnings[warning] = oldValue;
});
