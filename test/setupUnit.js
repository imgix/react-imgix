require("./setup");
import "@babel/polyfill";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { PublicConfigAPI } from "../src";

// TODO: Only initialise jest-extended for unit tests until https://github.com/jest-community/jest-extended/pull/140 is merged.
const addExtraJestMatchers = () => require("jest-extended");

addExtraJestMatchers();

const configureEnzymeWithAdapter = () => {
  configure({ adapter: new Adapter() });
};

configureEnzymeWithAdapter();

PublicConfigAPI.disableWarning("fallbackImage");
PublicConfigAPI.disableWarning("sizesAttribute");
