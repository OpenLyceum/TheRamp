# Code review — TheRamp — 2026-11-16

Reviewed commit: `206e2652887b5e945b6f49695fb120d8ac337225`. Working tree was clean at review start.
Selected as one of the ten oldest catalogued simulations by the earliest root commit's author timestamp: `2026-05-24T23:21:28Z`. This is source-history age, not GitHub repository-creation age.

## Scope

Physics force/work/energy bookkeeping and surface handoff; state recording and playback; resumed recording branches and actual TimePlotNode datasets.

This is a targeted functional code review with broad automated checks, not a full release certification. The findings below describe the reviewed commit. The remediation section records the subsequent corrections.

## Findings

### P2: Trim plot data when recording resumes from the past

Location: `src/common/view/TimePlotNode.ts:108`.

TimeSeriesModel.record() truncates its snapshots after the playback cursor, but TimePlotNode owns independent arrays that are only appended to or fully cleared. No branch/truncation event removes abandoned future graph points.

The diagnostic constructs the actual TimePlotNode, records ten 0.1-second slices, seeks to 0.2 s, resumes recording and takes one slice. The LinePlot data remains [0.1,0.2,...,1.0,0.3], although the recording now ends at 0.3 s. The graph retains obsolete force/energy/work history and draws backwards in time to the new branch.

Recommendation: notify plots when a recording branch is truncated, removing all points after the retained cursor before appending new samples. Prefer a shared history source so playback snapshots and graphs cannot diverge. Test plot data through rewind → Record, not just the private snapshot buffer.

## Validation

Node v26.13.0. `npm run lint`, `npm run check`, `npm run build`, `npm run check:architecture`, and the existing `npm test` suite pass (23 tests). Local Baton compliance passes with warnings; GitHub security settings could not be read by the checker.

Template drift is pre-existing and separate from the functional findings:

```text
❌ TheRamp (2)
   differs       biome.json — differs outside extendable keys
   dependency    @biomejs/biome — @biomejs/biome@^2.6.5 ≠ template ^2.6.6
```

## Reproducer

Temporarily save the following as `tests/review-diagnostic.test.ts`, then run `npm test -- tests/review-diagnostic.test.ts` inside this repository under Node 26. The assertion intentionally fails on the reviewed commit. Remove the temporary test afterward.

```ts
import {it,expect} from "vitest";
import {BooleanProperty,NumberProperty,StringProperty} from "scenerystack/axon";
import {Range} from "scenerystack/dot";
import {LinePlot} from "scenerystack/bamboo";
import type {Node} from "scenerystack/scenery";
import {TimeSeriesModel} from "../src/common/model/TimeSeriesModel.js";
import {createInitialState} from "../src/common/model/RampPhysicsEngine.js";
import {TimePlotNode} from "../src/common/view/TimePlotNode.js";
import Colors from "../src/TheRampColors.js";
it("rerecording after rewind removes abandoned future graph data",()=>{
 let state=createInitialState();
 const t=new TimeSeriesModel({advancePhysics:dt=>{state={...state,positionInSurface:state.positionInSurface+dt}},getStateSnapshot:()=>state,setStateSnapshot:s=>{state=s},setupForcesOnly:()=>{}});
 const node=new TimePlotNode(new StringProperty("position"),[{labelStringProperty:new StringProperty("x"),colorProperty:Colors.textColorProperty,liveProperty:new NumberProperty(0),accessor:s=>s.positionInSurface}],new Range(0,20),t,new BooleanProperty(true),{accordionOptions:{fill:"white",stroke:"black"}});
 const plots:LinePlot[]=[];const visit=(n:Node)=>{if(n instanceof LinePlot)plots.push(n);n.children.forEach(visit)};visit(node);
 t.record();for(let i=0;i<10;i++)t.step(0.1);
 t.setPlaybackTime(0.2);t.record();t.step(0.1);
 const times=plots[0]!.dataSet.map(p=>p!.x);console.log("times",times);
 expect(times.every(x=>x<=t.recordTimeProperty.value+1e-10)).toBe(true);
});
```

## Limits and retained evidence

No new browser fuzz, live video/camera, heap profiling, manual screen-reader audit, remote dependency audit, or educator sign-off was performed in this review. Unit mocks and source tracing do not substitute for these checks. The November 15 fleet-fuzz results in the superproject review log are prior evidence, not a new browser run.

Validation logs and original diagnostic sources/output are retained locally in `/tmp/oldest-review/`; temporary evidence may be removed by the system. This report preserves the actionable reproducers.


## Remediation — 2026-11-16

Resuming recording emits a retained-time notification with the required numeric runtime parameter metadata. Each time plot removes abandoned future samples before new points are appended, keeping graph data aligned with the playback snapshot buffer.

Permanent regression coverage: `tests/common/view/TimePlotNode.test.ts`. The historical diagnostic above describes the original failure; use the permanent regression suite to validate the corrected transport path.

Aligned template-owned configuration and shared dependency declarations with SceneryStackTemplate: Biome ^2.6.6, its 2.6.6 schema and locked executable, dependency ordering, and Resonance’s Vitest declaration where applicable. Preserved documented per-simulation configuration exceptions.

Final validation and commit identifiers are recorded in the superproject’s `review-log.md`.

Assertion-enabled browser fuzz caught missing metadata during remediation. The metadata was corrected, an assertion-enabled transport regression was added, and all TheRamp validation was rerun.
