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

1. Open any Rollable Table
2. Navigate to the Summary tab
3. You'll see a new "Show Results to GM Only" checkbox near the bottom
4. Check the box to make all rolls from this table whisper to GMs
5. Save the table configuration

Any future rolls from tables with "Show Results to GM Only" enabled will be private to GMs.

## Compatibility

- **Required**: Foundry VTT v13 or higher
- **Incompatible**: Foundry v12 and earlier (due to Application V2 framework changes)
- Works with most table-related modules
- Lightweight implementation with minimal performance impact

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

## Contributing

Found a bug or have a suggestion? Please [open an issue](https://github.com/Kergalli/gm-only-tables/issues) on GitHub.

## License

This module is available under the MIT License. See the LICENSE file for details.

