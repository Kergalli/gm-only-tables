/**
 * GM Only Tables Module for Foundry v14
 * Adds a checkbox to rollable tables to make all rolls whisper to GM
 */

class GMOnlyTables {
  static MODULE_ID = "gm-only-tables";
  static FLAG_KEY = "gmOnly";

  static init() {
    // Core RollTable sheet hook — covers Dragonbane and any system that
    // uses (or subclasses) foundry.applications.sheets.RollTableSheet.
    Hooks.on("renderRollTableSheet", this.onRenderRollTableSheet.bind(this));

    // D&D 5e registers its own RollTableSheet5e as the default sheet for
    // RollTables. In Foundry v14, render hooks fire based on the application
    // class name, so we need to listen for the 5e-specific hook as well.
    Hooks.on("renderRollTableSheet5e", this.onRenderRollTableSheet.bind(this));

    // Hook into chat message creation to enforce GM-only whispers.
    // This is the sole enforcement point in v1.1.0+ - v14's bug fixes
    // (#13792, #13902, #14258) made this reliable enough to remove the
    // RollTable.prototype.roll wrapper that was needed in v13.
    Hooks.on("preCreateChatMessage", this.onPreCreateChatMessage.bind(this));
  }

  /**
   * Handle RollTableSheet render events from any registered hook.
   * The documentName check inside addCheckboxToSheet filters out anything
   * that isn't actually a RollTable, so no constructor.name check is needed
   * here (and one would incorrectly exclude system subclasses).
   */
  static onRenderRollTableSheet(app, html, context, options) {
    this.addCheckboxToSheet(app, html, context);
  }

  /**
   * Add GM Only checkbox to the RollTable sheet.
   * Tries several injection strategies in order to handle both the core
   * sheet template and system-customized templates (notably D&D 5e).
   */
  static addCheckboxToSheet(app, html, context) {
    const document = app.document;
    if (!document || document.documentName !== "RollTable") return;

    const table = document;
    const isGMOnly = table.getFlag(this.MODULE_ID, this.FLAG_KEY) || false;

    // Convert html to jQuery if it's a raw DOM element (Application V2)
    const $html = html instanceof jQuery ? html : $(html);

    // Don't add if already exists (guards against multiple matching hooks
    // firing for the same render, e.g. core hook + system subclass hook).
    if ($html.find("#gm-only-checkbox").length > 0) return;

    // Create the checkbox HTML - NO name attribute to avoid form processing
    const checkboxHtml = `
      <div class="form-group">
        <label>${game.i18n.localize("GMONLY.ShowResultsToGMOnly")}</label>
        <input type="checkbox" id="gm-only-checkbox" ${isGMOnly ? "checked" : ""}>
      </div>
    `;

    let injected = false;

    // Strategy 1: Insert after Display Roll Formula to Chat checkbox
    // (core sheet / Dragonbane and other systems using the core template)
    const displayFormulaCheckbox = $html.find('input[name="displayRoll"]');
    if (displayFormulaCheckbox.length > 0) {
      const formGroup = displayFormulaCheckbox.closest(".form-group");
      if (formGroup.length > 0) {
        formGroup.after(checkboxHtml);
        injected = true;
      }
    }

    // Strategy 2: Insert at end of Summary or Description tab
    // (covers core sheet variants and some system templates)
    if (!injected) {
      const tab = $html.find(
        '[data-tab="summary"], .tab[data-tab="summary"], [data-tab="description"], .tab[data-tab="description"]',
      );
      if (tab.length > 0) {
        const lastFormGroup = tab.find(".form-group").last();
        if (lastFormGroup.length > 0) {
          lastFormGroup.after(checkboxHtml);
          injected = true;
        } else {
          // Tab has no form-groups, just append
          tab.append(checkboxHtml);
          injected = true;
        }
      }
    }

    // Strategy 3: Insert after the name input
    // (most sheets have one near the top of the form)
    if (!injected) {
      const nameInput = $html.find('input[name="name"]');
      if (nameInput.length > 0) {
        const formGroup = nameInput.closest(".form-group");
        if (formGroup.length > 0) {
          formGroup.after(checkboxHtml);
          injected = true;
        }
      }
    }

    // Strategy 4: Universal fallback — append after the last form-group
    // anywhere in the sheet. Works for almost any AppV2 form layout.
    if (!injected) {
      const lastFormGroup = $html.find(".form-group").last();
      if (lastFormGroup.length > 0) {
        lastFormGroup.after(checkboxHtml);
        injected = true;
      }
    }

    // Strategy 5: Last resort — append to the form itself
    if (!injected) {
      const form = $html.find("form").first();
      if (form.length > 0) {
        form.append(checkboxHtml);
        injected = true;
      }
    }

    if (!injected) {
      console.warn(
        `${GMOnlyTables.MODULE_ID}: Could not find injection point in RollTable sheet`,
      );
      return;
    }

    // Set up event handler
    setTimeout(() => {
      const $checkbox = $html.find("#gm-only-checkbox");

      $checkbox.off("change.gmonly").on("change.gmonly", function (event) {
        const isChecked = $(this).is(":checked");

        // Use table.update() with render:false to prevent form interference
        // and avoid unwanted sheet re-renders (per v14 migration guidance)
        const updateData = {};
        updateData[
          `flags.${GMOnlyTables.MODULE_ID}.${GMOnlyTables.FLAG_KEY}`
        ] = isChecked;

        table.update(updateData, { render: false }).catch((error) => {
          console.error(
            `${GMOnlyTables.MODULE_ID}: Error updating flag:`,
            error,
          );
        });
      });
    }, 0);
  }

  /**
   * Intercept chat messages from table rolls and enforce GM-only visibility.
   *
   * Uses explicit `whisper` array + `blind: true` flags directly on the message,
   * which is the most reliable approach across all roll paths (sheet UI, API
   * calls, macros, "Draw" button). This is aligned with v14's Chat Message
   * Visibility Modes and avoids the deprecated CONST.DICE_ROLL_MODES constant.
   *
   * The `core.RollTable` flag is set by Foundry core whenever a roll is made
   * on a RollTable, regardless of game system, so this enforcement works for
   * Dragonbane, D&D 5e, and any other system.
   */
  static onPreCreateChatMessage(document, data, options, userId) {
    try {
      if (!data.flags?.core?.RollTable) return;

      const tableId = data.flags.core.RollTable;
      const table = game.tables.get(tableId);

      if (!table) return;

      const isGMOnly = table.getFlag(this.MODULE_ID, this.FLAG_KEY);

      if (isGMOnly) {
        const gmUsers = game.users.filter((u) => u.isGM).map((u) => u.id);
        document.updateSource({ whisper: gmUsers, blind: true });
      }
    } catch (error) {
      console.error(
        `${this.MODULE_ID}: Error in onPreCreateChatMessage`,
        error,
      );
    }
  }
}

// Initialize the module
Hooks.once("init", () => {
  GMOnlyTables.init();
});