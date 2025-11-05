# GM Only Tables

A Foundry VTT v13 module that adds a "GM Only" checkbox to rollable tables, allowing you to make table rolls always whisper to the GM instead of posting publicly.

## Features

- Adds a "GM Only" checkbox to the RollTable Summary tab
- When enabled, all rolls from that table are automatically whispered to GMs
- Persists the setting with each table (saved with world data)
- Clean, unobtrusive UI integration that matches Foundry's design
- Fully compatible with Foundry v13's Application V2 framework

## Installation

1. Extract the module to your Foundry `Data/modules/` directory
2. Restart Foundry VTT
3. Enable the module in your world's Module Management settings

## Usage

1. Open any Rollable Table's configuration sheet (right-click → Configure)
2. Navigate to the Summary tab
3. You'll see a new "GM Only" checkbox near the top
4. Check the box to make all rolls from this table whisper to GMs
5. Save the table configuration

Any future rolls from tables with "GM Only" enabled will be private to GMs.

## Compatibility

- **Required**: Foundry VTT v13 or higher
- **Incompatible**: Foundry v12 and earlier (due to Application V2 framework changes)
- Works with most table-related modules
- Lightweight implementation with minimal performance impact

## Technical Details

The module uses a dual approach for maximum reliability:
1. **Primary Method**: Wraps `RollTable.prototype.roll()` to set private roll mode and whisper options
2. **Backup Method**: Hooks into `preCreateChatMessage` to modify chat message whisper settings

This ensures GM Only functionality works across different table rolling scenarios in v13.

## Support

This module replaces the "GM Only" functionality from Better Rolltables (which only supports Foundry v12 and earlier) for users who have upgraded to v13.

## License

This module is provided as-is for personal and educational use.

