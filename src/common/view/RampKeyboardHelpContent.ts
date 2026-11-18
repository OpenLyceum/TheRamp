/**
 * RampKeyboardHelpContent.ts
 *
 * Content for the keyboard-help dialog (the "?" button in the navigation bar),
 * shared by every screen in The Ramp. Every keyboard drag here is a
 * single-axis RichDragListener, so its rows use the key strings
 * KeyboardDragListener registers for that direction rather than
 * MoveDraggableItemsKeyboardHelpSection, which lists all four directions.
 * No second listener is added; Shift selects each listener's smaller step.
 *
 * - Ramp surface (SurfaceNode) — left/right tilts the ramp.
 * - Object (BlockNode) — left/right pushes while held; release stops.
 * - Free-body diagram (FreeBodyDiagramNode, More Features) — left/right pushes.
 * - Zero PE line (ZeroPointPeLineNode, More Features) — up/down moves it.
 * - Graph time cursor (TimePlotNode) — left/right scrubs the recording.
 *
 * Both screens run a TimeControlNode (GoPauseClearPanel on Intro,
 * RecordPlaybackControlBar on More Features), so the time-controls section
 * documents its global Alt+K play/pause.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { HotkeyData, type OneKeyStroke } from "scenerystack/scenery";
import {
  BasicActionsKeyboardHelpSection,
  KeyboardHelpSection,
  KeyboardHelpSectionRow,
  SliderControlsKeyboardHelpSection,
  TimeControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";
import { StringManager } from "../../i18n/StringManager.js";

const keyboardHelpStrings = StringManager.getInstance().getKeyboardHelpStrings();

// KeyboardDragListener's "leftRight" / "upDown" key strings (shift is an ignored modifier).
const LEFT_RIGHT_KEYS: OneKeyStroke[] = ["shift?+arrowLeft", "shift?+arrowRight", "shift?+a", "shift?+d"];
const LEFT_RIGHT_SHIFT_KEYS: OneKeyStroke[] = ["shift+arrowLeft", "shift+arrowRight", "shift+a", "shift+d"];
const UP_DOWN_KEYS: OneKeyStroke[] = ["shift?+arrowUp", "shift?+arrowDown", "shift?+w", "shift?+s"];
const UP_DOWN_SHIFT_KEYS: OneKeyStroke[] = ["shift+arrowUp", "shift+arrowDown", "shift+w", "shift+s"];

/** One row documenting keys that a drag listener (not this HotkeyData) binds. */
function dragRow(
  keys: OneKeyStroke[],
  label: TReadOnlyProperty<string>,
  description: TReadOnlyProperty<string>,
): KeyboardHelpSectionRow {
  return KeyboardHelpSectionRow.fromHotkeyData(
    new HotkeyData({
      keys,
      repoName: "the-ramp",
      keyboardHelpDialogLabelStringProperty: label,
      keyboardHelpDialogPDOMLabelStringProperty: description,
    }),
  );
}

export type RampKeyboardHelpContentOptions = {
  /** The screen shows the draggable free-body diagram. */
  hasFreeBodyDiagram?: boolean;
  /** The screen shows the draggable zero potential-energy line. */
  hasZeroPointControl?: boolean;
};

export class RampKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor(options?: RampKeyboardHelpContentOptions) {
    const s = keyboardHelpStrings;

    const leftSections: KeyboardHelpSection[] = [
      new KeyboardHelpSection(s.surfaceHeadingStringProperty, [
        dragRow(LEFT_RIGHT_KEYS, s.changeAngleStringProperty, s.changeAngleDescriptionStringProperty),
        dragRow(LEFT_RIGHT_SHIFT_KEYS, s.changeAngleSlowerStringProperty, s.changeAngleSlowerDescriptionStringProperty),
      ]),
      new KeyboardHelpSection(s.objectHeadingStringProperty, [
        dragRow(LEFT_RIGHT_KEYS, s.pushObjectStringProperty, s.pushObjectDescriptionStringProperty),
        dragRow(LEFT_RIGHT_SHIFT_KEYS, s.pushObjectGentlyStringProperty, s.pushObjectGentlyDescriptionStringProperty),
      ]),
    ];
    if (options?.hasFreeBodyDiagram) {
      leftSections.push(
        new KeyboardHelpSection(s.freeBodyDiagramHeadingStringProperty, [
          dragRow(LEFT_RIGHT_KEYS, s.pushFromDiagramStringProperty, s.pushFromDiagramDescriptionStringProperty),
          dragRow(
            LEFT_RIGHT_SHIFT_KEYS,
            s.pushFromDiagramGentlyStringProperty,
            s.pushFromDiagramGentlyDescriptionStringProperty,
          ),
        ]),
      );
    }
    leftSections.push(new SliderControlsKeyboardHelpSection());

    const rightSections: KeyboardHelpSection[] = [
      new KeyboardHelpSection(s.timeCursorHeadingStringProperty, [
        dragRow(LEFT_RIGHT_KEYS, s.scrubTimeStringProperty, s.scrubTimeDescriptionStringProperty),
        dragRow(LEFT_RIGHT_SHIFT_KEYS, s.scrubTimeSlowerStringProperty, s.scrubTimeSlowerDescriptionStringProperty),
      ]),
    ];
    if (options?.hasZeroPointControl) {
      rightSections.push(
        new KeyboardHelpSection(s.zeroPointHeadingStringProperty, [
          dragRow(UP_DOWN_KEYS, s.moveZeroPointStringProperty, s.moveZeroPointDescriptionStringProperty),
          dragRow(
            UP_DOWN_SHIFT_KEYS,
            s.moveZeroPointSlowerStringProperty,
            s.moveZeroPointSlowerDescriptionStringProperty,
          ),
        ]),
      );
    }
    rightSections.push(new TimeControlsKeyboardHelpSection(), new BasicActionsKeyboardHelpSection());

    super(leftSections, rightSections);
  }
}
