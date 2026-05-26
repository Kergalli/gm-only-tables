# Changelog

All notable changes to the GM Only Tables module will be documented in this file.

## [1.1.1] - 2026-05-26

### Fixed
- "Show Results to GM Only" checkbox now appears on the D&D 5e system's
  custom RollTable sheet (RollTableSheet5e). Previously the module only
  listened for the core renderRollTableSheet hook and used an exact-match
  constructor.name check, both of which excluded the 5e sheet class.

### Changed
- Added more defensive injection fallbacks so the checkbox lands in a
  sensible spot on system-customized RollTable sheets.

---

## [1.1.0] - 2026-05-07

### Changed

- **BREAKING:** Module now requires Foundry VTT v14. For v13 support, continue using v1.0.2.
- Updated compatibility to Foundry v14.361

### Removed

- Removed `RollTable.prototype.roll` wrapper. The `preCreateChatMessage` hook is now the sole enforcement point for GM-only whispers, which is more reliable in v14 and avoids potential conflicts with other modules that modify RollTable behavior.
- Removed dependency on deprecated `CONST.DICE_ROLL_MODES` constant (scheduled for removal in V16). Module now uses explicit `whisper` and `blind` flags exclusively, aligned with v14's Chat Message Visibility Modes.

### Technical Notes

- v14's bug fixes (#13792, #13902, #14258) addressed the underlying issues that originally required the dual-layer approach in 1.0.2.
- Simpler codebase, same behavior.

---

## [1.0.2] - 2025-01-18

### Fixed

- Fixed bug where players could see results when rolling on GM-only tables
- Added explicit `blind: true` flag to chat messages to ensure complete player invisibility
- Players now see blind roll indicator ("???") instead of actual results when rolling on GM-only tables

---

## [1.0.1] - 2025-01-17

### Fixed

- Fixed installation error where Foundry incorrectly detected module updates due to mismatched download URLs
- Corrected module.json manifest and download URLs to point to specific release versions instead of main branch

### Technical Notes

- No functional changes to module behavior
- This is purely a packaging/installation fix for better compatibility with Foundry's module management system
