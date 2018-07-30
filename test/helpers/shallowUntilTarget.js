/*
	This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at http://mozilla.org/MPL/2.0/.

	Taken from https://github.com/mozilla/addons-frontend/blob/58d1315409f1ad6dc9b979440794df44c1128455/tests/unit/helpers.js#L276
 */

import { oneLine } from "common-tags";
import { shallow } from "enzyme";

/*
 * Repeatedly render a component tree using enzyme.shallow() until
 * finding and rendering TargetComponent.
 *
 * This is useful for testing a component wrapped in one or more
 * HOCs (higher order components).
 *
 * The `componentInstance` parameter is a React component instance.
 * Example: <MyComponent {...props} />
 *
 * The `TargetComponent` parameter is the React class (or function) that
 * you want to retrieve from the component tree.
 */
export function shallowUntilTarget(
  componentInstance,
  TargetComponent,
  { maxTries = 10, shallowOptions, _shallow = shallow } = {}
) {
  if (!componentInstance) {
    throw new Error("componentInstance parameter is required");
  }
  if (!TargetComponent) {
    throw new Error("TargetComponent parameter is required");
  }

  let root = _shallow(componentInstance, shallowOptions);

  if (typeof root.type() === "string") {
    // If type() is a string then it's a DOM Node.
    // If it were wrapped, it would be a React component.
    throw new Error("Cannot unwrap this component because it is not wrapped");
  }

  for (let tries = 1; tries <= maxTries; tries++) {
    if (root.is(TargetComponent)) {
      // Now that we found the target component, render it.
      return root.shallow(shallowOptions);
    }
    // Unwrap the next component in the hierarchy.
    root = root.dive();
  }

  throw new Error(oneLine`Could not find ${TargetComponent} in rendered
    instance: ${componentInstance}; gave up after ${maxTries} tries`);
}
