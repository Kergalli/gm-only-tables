/**
 * GM Only Tables Module for Foundry v14
 * Adds a checkbox to rollable tables to make all rolls whisper to GM
 *
 * v1.1.0 - v14 compatibility release
 * - Single enforcement point via preCreateChatMessage hook
 * - Uses explicit whisper + blind flags (v14 Chat Message Visibility approach)
 *   rather than the deprecated CONST.DICE_ROLL_MODES constant (removed in V16)
 */

class GMOnlyTables {
  static MODULE_ID = "gm-only-tables";
  static FLAG_KEY = "gmOnly";

  static init() {
    // Hook into RollTable sheet rendering to inject the GM-only checkbox
    Hooks.on("renderRollTableSheet", this.onRenderRollTableSheet.bind(this));

    // Hook into chat message creation to enforce GM-only whispers.
    // This is the sole enforcement point in v1.1.0 - v14's bug fixes
    // (#13792, #13902, #14258) made this reliable enough to remove the
    // RollTable.prototype.roll wrapper that was needed in v13.
    Hooks.on("preCreateChatMessage", this.onPreCreateChatMessage.bind(this));
  }

  /**
   * Handle RollTableSheet render events
   */
  static onRenderRollTableSheet(app, html, context, options) {
    if (app.constructor.name === "RollTableSheet") {
      this.addCheckboxToSheet(app, html, context);
    }
  }

  /**
   * Add GM Only checkbox to the RollTable Summary tab
   */
  static addCheckboxToSheet(app, html, context) {
    const document = app.document;
    if (!document || document.documentName !== "RollTable") return;

    const table = document;
    const isGMOnly = table.getFlag(this.MODULE_ID, this.FLAG_KEY) || false;

    // Convert html to jQuery if it's a raw DOM element (Application V2)
    const $html = html instanceof jQuery ? html : $(html);

    // Don't add if already exists
    if ($html.find("#gm-only-checkbox").length > 0) return;

    // Create the checkbox HTML - NO name attribute to avoid form processing
    const checkboxHtml = `
      <div class="form-group">
        <label>${game.i18n.localize("GMONLY.ShowResultsToGMOnly")}</label>
        <input type="checkbox" id="gm-only-checkbox" ${isGMOnly ? "checked" : ""}>
      </div>
    `;

    let injected = false;

    // Insert after Display Roll Formula to Chat checkbox
    const displayFormulaCheckbox = $html.find('input[name="displayRoll"]');
    if (displayFormulaCheckbox.length > 0) {
      const formGroup = displayFormulaCheckbox.closest(".form-group");
      if (formGroup.length > 0) {
        formGroup.after(checkboxHtml);
        injected = true;
      }
    }

    // Fallback: Insert in Summary tab
    if (!injected) {
      const summaryTab = $html.find(
        '[data-tab="summary"], .tab[data-tab="summary"]',
      );
      if (summaryTab.length > 0) {
        const lastFormGroup = summaryTab.find(".form-group").last();
        if (lastFormGroup.length > 0) {
          lastFormGroup.after(checkboxHtml);
          injected = true;
        }
      }
    }

    // Final fallback
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

    // Set up event handler
    if (injected) {
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
  }

  /**
   * Intercept chat messages from table rolls and enforce GM-only visibility.
   *
   * Uses explicit `whisper` array + `blind: true` flags directly on the message,
   * which is the most reliable approach across all roll paths (sheet UI, API
   * calls, macros, "Draw" button). This is aligned with v14's Chat Message
   * Visibility Modes and avoids the deprecated CONST.DICE_ROLL_MODES constant.
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
