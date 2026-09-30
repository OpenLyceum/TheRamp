/**
 * RampKeyboardHelpContent.ts
 *
 * Content for the keyboard-help dialog (the "?" button in the navigation bar),
 * shared by every screen in The Ramp. The ramp surface is keyboard-dragged
 * left and right (SurfaceNode). MoveDraggableItemsKeyboardHelpSection also
 * documents up/down and W/S, which that listener does not bind, so this section
 * uses the left/right key strings KeyboardDragListener actually registers.
 * No second listener is added.
 */

import { HotkeyData } from "scenerystack/scenery";
import {
  BasicActionsKeyboardHelpSection,
  KeyboardHelpSection,
  KeyboardHelpSectionRow,
  SliderControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";
import { StringManager } from "../../i18n/StringManager.js";

const keyboardHelpStrings = StringManager.getInstance().getKeyboardHelpStrings();

// Matches KeyboardDragListener's left/right key strings (shift is an ignored modifier).
const surfaceMoveHotkeyData = new HotkeyData({
  keys: ["shift?+arrowLeft", "shift?+arrowRight", "shift?+a", "shift?+d"],
  repoName: "the-ramp",
  keyboardHelpDialogLabelStringProperty: keyboardHelpStrings.changeAngleStringProperty,
  keyboardHelpDialogPDOMLabelStringProperty: keyboardHelpStrings.changeAngleDescriptionStringProperty,
});

// Shift changes the angle step inside that same listener; this row only documents it.
const surfaceSlowerHotkeyData = new HotkeyData({
  keys: ["shift+arrowLeft", "shift+arrowRight", "shift+a", "shift+d"],
  repoName: "the-ramp",
  keyboardHelpDialogLabelStringProperty: keyboardHelpStrings.changeAngleSlowerStringProperty,
  keyboardHelpDialogPDOMLabelStringProperty: keyboardHelpStrings.changeAngleSlowerDescriptionStringProperty,
});

export class RampKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    const surface = new KeyboardHelpSection(keyboardHelpStrings.surfaceHeadingStringProperty, [
      KeyboardHelpSectionRow.fromHotkeyData(surfaceMoveHotkeyData),
      KeyboardHelpSectionRow.fromHotkeyData(surfaceSlowerHotkeyData),
    ]);

    super([new SliderControlsKeyboardHelpSection(), surface], [new BasicActionsKeyboardHelpSection()]);
  }
}
