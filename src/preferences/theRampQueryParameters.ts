/**
 * theRampQueryParameters.ts
 *
 * Sim-specific startup query parameters. This is the single place where every
 * sim-specific query parameter is declared and documented. Public-facing
 * parameters (intended for end users / sharing links) must set `public: true`.
 *
 * ── How to add a query parameter ──────────────────────────────────────────────
 * 1. Add an entry below with a `type`, `defaultValue`, and (if user-facing)
 *    `public: true`. Add `isValidValue` to bound numeric ranges.
 * 2. If it should also be user-editable at runtime, surface it as a preference
 *    in TheRampPreferencesModel (initialize that Property from this query parameter).
 *
 * Ranges are validated against the canonical control ranges in TheRampConstants.
 *
 * Usage: append e.g. `?rampAngle=30&frictionless=true` to the sim URL.
 */

import { logGlobal } from "scenerystack/phet-core";
import { QueryStringMachine } from "scenerystack/query-string-machine";
import { APPLIED_FORCE_RANGE, FRICTION_RANGE, MASS_RANGE } from "../TheRampConstants.js";
import TheRampNamespace from "../TheRampNamespace.js";

// Default object (file cabinet) values — kept in sync with RAMP_OBJECTS[0].
const DEFAULT_MASS = 100;
const DEFAULT_FRICTION = 0.3;

// Ramp angle is expressed in degrees for the public API; the model uses radians.
const RAMP_ANGLE_MIN_DEG = 0;
const RAMP_ANGLE_MAX_DEG = 90;
const DEFAULT_RAMP_ANGLE_DEG = 10;

const theRampQueryParameters = QueryStringMachine.getAll({
  /** Initial ramp angle, in degrees (0–90). */
  rampAngle: {
    type: "number" as const,
    defaultValue: DEFAULT_RAMP_ANGLE_DEG,
    isValidValue: (value: number) => value >= RAMP_ANGLE_MIN_DEG && value <= RAMP_ANGLE_MAX_DEG,
    public: true,
  },

  /** Initial applied force, in newtons. */
  appliedForce: {
    type: "number" as const,
    defaultValue: 0,
    isValidValue: (value: number) => value >= APPLIED_FORCE_RANGE.min && value <= APPLIED_FORCE_RANGE.max,
    public: true,
  },

  /** Initial object mass, in kilograms. */
  mass: {
    type: "number" as const,
    defaultValue: DEFAULT_MASS,
    isValidValue: (value: number) => value >= MASS_RANGE.min && value <= MASS_RANGE.max,
    public: true,
  },

  /** Initial coefficient of static friction. */
  staticFriction: {
    type: "number" as const,
    defaultValue: DEFAULT_FRICTION,
    isValidValue: (value: number) => value >= FRICTION_RANGE.min && value <= FRICTION_RANGE.max,
    public: true,
  },

  /** Initial coefficient of kinetic friction. */
  kineticFriction: {
    type: "number" as const,
    defaultValue: DEFAULT_FRICTION,
    isValidValue: (value: number) => value >= FRICTION_RANGE.min && value <= FRICTION_RANGE.max,
    public: true,
  },

  /** Start with friction disabled (frictionless ramp). */
  frictionless: {
    type: "boolean",
    defaultValue: false,
    public: true,
  },

  /** Initial state of the sound toggle. */
  soundEnabled: {
    type: "boolean",
    defaultValue: true,
    public: true,
  },

  /** Start showing parallel force components instead of entire vectors. */
  showComponents: {
    type: "boolean",
    defaultValue: false,
    public: true,
  },
});

TheRampNamespace.register("theRampQueryParameters", theRampQueryParameters);

// Log query parameters (for the console / PhET-iO).
logGlobal("phet.chipper.queryParameters");

export default theRampQueryParameters;
