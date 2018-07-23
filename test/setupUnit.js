require("./setup");

// TODO: Only initialise jest-extended for unit tests until https://github.com/jest-community/jest-extended/pull/140 is merged.
const addExtraJestMatchers = () => require("jest-extended");

addExtraJestMatchers();

import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
const configureEnzymeWithAdapter = () => {
  configure({ adapter: new Adapter() });
};

const mockScreen = () => {
  const constants = require("../src/constants").default;
  constants.availWidth = 2000;
  constants.availHeight = 2000;
};

configureEnzymeWithAdapter();
mockScreen();
