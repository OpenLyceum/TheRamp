/**
 * SeriesDescriptor.ts
 */

export interface SeriesDescriptor {
  readonly labelStringProperty: ReadOnlyProperty<string>;
  readonly colorProperty: ProfileColorProperty;
  /** live value for the readout column */
  readonly liveProperty: ReadOnlyProperty<number>;
  /** value extracted from a recorded snapshot for plotting */
  readonly accessor: (state: RampPhysicsState) => number;
}
