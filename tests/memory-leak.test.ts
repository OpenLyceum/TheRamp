/**
 * Memory-leak regression suite (fleet standard): each screen model is collected after
 * dispose(), survives a double dispose(), and leaves no survivors across repeated cycles
 * (tests/helpers/memoryLeak.ts). Add sim-specific leak tests below using forceGC().
 *
 * IntroModel / RampModel do not implement dispose(). The case disposes the angle
 * Property the model owns; disposing that Property drops the listeners that would
 * otherwise retain the model.
 */

import { IntroModel } from "../src/intro/model/IntroModel.js";
import { TheRampPreferencesModel } from "../src/preferences/TheRampPreferencesModel.js";
import { describeDisposalLeaks } from "./helpers/memoryLeak.js";

describeDisposalLeaks([
  {
    name: "IntroModel.rampAngleProperty",
    create: () => {
      const model = new IntroModel(new TheRampPreferencesModel());
      return model.rampAngleProperty;
    },
  },
]);
