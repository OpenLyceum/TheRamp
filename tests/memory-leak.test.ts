/**
 * Memory-leak regression suite (fleet standard): each screen model is collected after
 * dispose(), survives a double dispose(), and leaves no survivors across repeated cycles
 * (tests/helpers/memoryLeak.ts). Add sim-specific leak tests below using forceGC().
 *
 * IntroModel / MoreFeaturesModel / RampModel do not implement dispose(). The disposal cases dispose
 * the angle Property the model owns; disposing that Property drops the listeners that would
 * otherwise retain the model. The models are also checked directly: dropped after being driven
 * (record, playback, collisions, reset), they must be collected as a unit, even while they share a
 * long-lived TheRampPreferencesModel — which must not collect listeners from the models built on it.
 */

import { describe, expect, it } from "vitest";
import { IntroModel } from "../src/intro/model/IntroModel.js";
import { MoreFeaturesModel } from "../src/more-features/model/MoreFeaturesModel.js";
import { TheRampPreferencesModel } from "../src/preferences/TheRampPreferencesModel.js";
import { describeDisposalLeaks, forceGC } from "./helpers/memoryLeak.js";

describeDisposalLeaks([
  {
    name: "IntroModel.rampAngleProperty",
    create: () => {
      const model = new IntroModel(new TheRampPreferencesModel());
      return model.rampAngleProperty;
    },
  },
  {
    name: "MoreFeaturesModel.rampAngleProperty",
    create: () => {
      const model = new MoreFeaturesModel(new TheRampPreferencesModel());
      return model.rampAngleProperty;
    },
  },
]);

type RampModelClass = new (preferences: TheRampPreferencesModel) => IntroModel | MoreFeaturesModel;

/** Listener count of a Property (public at runtime, private in the type declarations). */
const listenerCount = (property: object): number =>
  (property as unknown as { getListenerCount(): number }).getListenerCount();

/** Drives a model the way the sim does: forces, recording, playback, collisions and Reset All. */
function drive(model: IntroModel | MoreFeaturesModel): void {
  model.appliedForceProperty.value = 200;
  model.rampAngleProperty.value = Math.PI / 6;
  model.timeSeriesModel.record();
  for (let i = 0; i < 120; i++) {
    model.step(1 / 60);
  }
  model.timeSeriesModel.playback();
  for (let i = 0; i < 30; i++) {
    model.step(1 / 60);
  }
  model.timeSeriesModel.rewind();
  model.timeSeriesModel.ensureRecordMode();
  model.timeSeriesModel.clear();
  model.frictionlessProperty.value = !model.frictionlessProperty.value;
  model.setStateSnapshot(model.getStateSnapshot());
  model.setupForcesOnly();
  model.clearHeat();
  model.reset();
}

function createAndDrop(ModelClass: RampModelClass, preferences: TheRampPreferencesModel): WeakRef<object> {
  const model = new ModelClass(preferences);
  drive(model);
  return new WeakRef<object>(model);
}

describe("ramp models are collected after drop", () => {
  const classes: readonly (readonly [string, RampModelClass])[] = [
    ["IntroModel", IntroModel],
    ["MoreFeaturesModel", MoreFeaturesModel],
  ];

  for (const [name, ModelClass] of classes) {
    it(`${name} is collected after drop`, async () => {
      const ref = createAndDrop(ModelClass, new TheRampPreferencesModel());
      await forceGC(ref);
      expect(ref.deref()).toBeUndefined();
    });

    it(`${name}: repeated create/drop cycles leave no survivors`, async () => {
      const refs: WeakRef<object>[] = [];
      for (let i = 0; i < 10; i++) {
        refs.push(createAndDrop(ModelClass, new TheRampPreferencesModel()));
      }
      await forceGC(refs);
      expect(refs.filter((r) => r.deref() !== undefined).length).toBe(0);
    });

    it(`${name}: models built on a shared long-lived preferences model are collected`, async () => {
      const preferences = new TheRampPreferencesModel();
      const refs: WeakRef<object>[] = [];
      for (let i = 0; i < 10; i++) {
        refs.push(createAndDrop(ModelClass, preferences));
        preferences.initialRampAngleProperty.value = 10 + i;
        preferences.showComponentsProperty.value = i % 2 === 0;
      }
      await forceGC(refs);
      expect(refs.filter((r) => r.deref() !== undefined).length).toBe(0);
    });

    it(`${name}: building and driving models adds no listeners to the shared preferences`, () => {
      const preferences = new TheRampPreferencesModel();
      const properties = [
        preferences.initialRampAngleProperty,
        preferences.frictionlessProperty,
        preferences.soundEnabledProperty,
        preferences.showComponentsProperty,
      ];
      const before = properties.map(listenerCount);
      for (let i = 0; i < 5; i++) {
        drive(new ModelClass(preferences));
      }
      expect(properties.map(listenerCount)).toEqual(before);
    });

    it(`${name}: Reset All and stepping leave the model's Property listeners unchanged`, () => {
      const model = new ModelClass(new TheRampPreferencesModel());
      const properties = [
        model.rampAngleProperty,
        model.appliedForceProperty,
        model.massProperty,
        model.frictionlessProperty,
        model.positionInSurfaceProperty,
        model.velocityProperty,
        model.blockLocationProperty,
        model.timeSeriesModel.modeProperty,
      ];
      const before = properties.map(listenerCount);
      for (let i = 0; i < 10; i++) {
        drive(model);
      }
      expect(properties.map(listenerCount)).toEqual(before);
    });
  }
});
