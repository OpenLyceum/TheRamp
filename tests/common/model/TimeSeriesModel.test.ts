import { describe, expect, it } from "vitest";
import { RampModel } from "../../../src/common/model/RampModel.js";
import { MAX_RECORDING_TIME } from "../../../src/common/model/RampPhysicsConstants.js";
import { createInitialState } from "../../../src/common/model/RampPhysicsEngine.js";
import { TimeSeriesModel } from "../../../src/common/model/TimeSeriesModel.js";
import { TheRampPreferencesModel } from "../../../src/preferences/TheRampPreferencesModel.js";

function createRecording() {
  let state = createInitialState();
  const series = new TimeSeriesModel({
    advancePhysics: (dt) => {
      state = { ...state, positionInSurface: state.positionInSurface + dt };
    },
    getStateSnapshot: () => state,
    setStateSnapshot: (snapshot) => {
      state = snapshot;
    },
    setupForcesOnly: () => {
      /* This client has no force outputs. */
    },
  });
  return { series, getState: () => state };
}

describe("TimeSeriesModel", () => {
  it("restores the initial state when rewound", () => {
    const { series, getState } = createRecording();
    const initial = getState();
    series.record();
    series.step(0.1);
    series.rewind();
    expect(getState()).toEqual(initial);
  });

  it("captures user inputs before the first physics step", () => {
    const preferences = new TheRampPreferencesModel();
    const model = new RampModel(preferences);
    model.globalPositionProperty.value = 12;
    model.massProperty.value = 50;
    model.timeSeriesModel.record();
    model.step(0.1);
    model.timeSeriesModel.rewind();
    expect(model.globalPositionProperty.value).toBe(12);
    expect(model.massProperty.value).toBe(50);
  });

  it("stops exactly at the recording limit", () => {
    const { series } = createRecording();
    series.record();
    series.step(MAX_RECORDING_TIME - 0.05);
    series.step(0.1);
    expect(series.recordTimeProperty.value).toBe(MAX_RECORDING_TIME);
    expect(series.isPlayingProperty.value).toBe(false);
  });
});
