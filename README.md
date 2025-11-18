# 🎲 GM Only Tables

[![Foundry Version](https://img.shields.io/badge/Foundry-V13-informational)](https://foundryvtt.com/)
[![Module Version](https://img.shields.io/badge/Version-1.0.2-brightgreen)](https://github.com/Kergalli/gm-only-tables/releases)
[![License](https://img.shields.io/badge/License-MIT-green)](https://github.com/Kergalli/gm-only-tables/blob/main/LICENSE)

A lightweight Foundry VTT v13 module that adds a "GM Only" checkbox to rollable tables, allowing you to make table rolls always whisper to the GM instead of posting publicly. Perfect for secret rolls, random encounters, and maintaining narrative suspense.

## ✨ Key Features

- **Private Table Rolls**: Make any rollable table whisper results exclusively to GMs
- **True Blind Rolls**: Players see blind roll indicators ("???") when rolling on GM-only tables - they never see the actual results
- **Works for All Users**: Whether the GM or a player rolls on a GM-only table, only GMs see the results
- **Persistent Settings**: GM Only preference is saved with each table individually
- **V13 Compatible**: Fully compatible with Foundry v13's Application V2 framework

## 📋 System Requirements

- **Foundry VTT**: V13+ (for V12 support, see compatibility notes)
- **Game System**: System agnostic - works with any game system
- **Dependencies**: None

## 🚀 Installation

### From Foundry

1. Open Foundry VTT and go to the **Add-on Modules** tab
2. Click **Install Module**
3. Paste this manifest URL: `https://github.com/Kergalli/gm-only-tables/releases/download/v1.0.2/module.json`
4. Click **Install**

### Manual Installation

1. Download the latest release from the [GitHub repository](https://github.com/Kergalli/gm-only-tables)
2. Extract the zip file to your `Data/modules/` directory
3. Restart Foundry VTT
4. Enable the module in your world's **Manage Modules** settings

## ⚙️ Usage

### Setting Up GM Only Tables

1. **Open any Rollable Table**
2. **Navigate to the Summary tab**
3. **Find the "Show Results to GM Only" checkbox** near the bottom of the form
4. **Check the box** to make all rolls from this table whisper to GMs
5. **Update Roll Table** to save changes

### How It Works

When a table is marked as "GM Only":

- **GM rolls on the table**: Only GMs see the actual results in chat
- **Player rolls on the table**: 
  - Players see a blind roll indicator (usually displayed as "???")
  - Only GMs see the actual table results
  - The roll is completely hidden from all players

This ensures complete secrecy for random encounters, loot tables, plot twists, and any other tables where you want to maintain narrative surprise!

### ✅ Foundry V13 Compatibility

| Foundry Version | Module Support | Notes |
|-----------------|----------------|-------|
| **V13+** | ✅ Full Support | Recommended version with Application V2 compatibility |
| **V12** | ❌ Not Compatible | Use something like Better Rolltables for similar V12 functionality |

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

## 🤝 Contributing

Found a bug or have a suggestion? Please [open an issue](https://github.com/Kergalli/gm-only-tables/issues) on GitHub.

## 📄 License

This module is available under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🎯 Credits & Attribution

**Inspiration**: [Better Rolltables](https://foundryvtt.com/packages/better-rolltables/) module by Felix Müller
