import { BooleanProperty, NumberProperty, StringProperty } from "scenerystack/axon";
import { LinePlot } from "scenerystack/bamboo";
import { Range } from "scenerystack/dot";
import type { Node } from "scenerystack/scenery";
import { expect, it } from "vitest";
import { createInitialState } from "../../../src/common/model/RampPhysicsEngine.js";
import { TimeSeriesModel } from "../../../src/common/model/TimeSeriesModel.js";
import { TimePlotNode } from "../../../src/common/view/TimePlotNode.js";
import Colors from "../../../src/TheRampColors.js";

it("rerecording after rewind removes abandoned future graph data", () => {
  let state = createInitialState();
  const t = new TimeSeriesModel({
    advancePhysics: (dt) => {
      state = { ...state, positionInSurface: state.positionInSurface + dt };
    },
    getStateSnapshot: () => state,
    setStateSnapshot: (s) => {
      state = s;
    },
    setupForcesOnly: () => {
      // This fixture has no display force state.
    },
  });
  const node = new TimePlotNode(
    new StringProperty("position"),
    [
      {
        labelStringProperty: new StringProperty("x"),
        colorProperty: Colors.textColorProperty,
        liveProperty: new NumberProperty(0),
        accessor: (s) => s.positionInSurface,
      },
    ],
    new Range(0, 20),
    t,
    new BooleanProperty(true),
    { accordionOptions: { fill: "white", stroke: "black" } },
  );
  const plots: LinePlot[] = [];
  const visit = (n: Node) => {
    if (n instanceof LinePlot) {
      plots.push(n);
    }
    n.children.forEach(visit);
  };
  visit(node);
  t.record();
  for (let i = 0; i < 10; i++) {
    t.step(0.1);
  }
  t.setPlaybackTime(0.2);
  t.record();
  t.step(0.1);
  const times = plots[0]!.dataSet.map((p) => p!.x);
  expect(times.length).toBeGreaterThan(0);
  expect(times.every((x) => x <= t.recordTimeProperty.value + 1e-10)).toBe(true);
});
