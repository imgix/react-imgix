require("./setup");

require("babel-polyfill");

import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
const configureEnzymeWithAdapter = () => {
  configure({ adapter: new Adapter() });
};

configureEnzymeWithAdapter();
