/**
 * SeriesDescriptor.ts
 *
 * One plotted series in the ramp energy/work/force charts.
 */

import type { ReadOnlyProperty } from "scenerystack/axon";
import type { ProfileColorProperty } from "scenerystack/scenery";
import type { RampPhysicsState } from "../model/RampPhysicsEngine.js";

export interface SeriesDescriptor {
  readonly labelStringProperty: ReadOnlyProperty<string>;
  readonly colorProperty: ProfileColorProperty;
  /** live value for the readout column */
  readonly liveProperty: ReadOnlyProperty<number>;
  /** value extracted from a recorded snapshot for plotting */
  readonly accessor: (state: RampPhysicsState) => number;
}
