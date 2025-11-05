/**
 * GM Only Tables Module for Foundry v13
 * Adds a checkbox to rollable tables to make all rolls whisper to GM
 */

class GMOnlyTables {
  static MODULE_ID = "gm-only-tables";
  static FLAG_KEY = "gmOnly";

  static init() {
    // Hook into v13 RollTable sheet rendering
    Hooks.on("renderRollTableSheet", this.onRenderRollTableSheet.bind(this));

    // Hook into table rolls to modify behavior - dual approach for reliability
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
    const document = app.document || app.object;
    if (!document || document.documentName !== "RollTable") return;

    const table = document;
    const isGMOnly = table.getFlag(this.MODULE_ID, this.FLAG_KEY) || false;

    // Convert html to jQuery if it's a raw DOM element (v13 Application V2)
    const $html = html instanceof jQuery ? html : $(html);

    // Don't add if already exists
    if ($html.find("#gm-only-checkbox").length > 0) return;

    // Create the checkbox HTML to match existing Foundry checkbox style
    const checkboxHtml = `
      <div class="form-group">
        <label>${game.i18n.localize("GMONLY.ShowResultsToGMOnly")}</label>
        <input type="checkbox" id="gm-only-checkbox" name="flags.${
          this.MODULE_ID
        }.${this.FLAG_KEY}" ${isGMOnly ? "checked" : ""}>
      </div>
    `;

    // Insert after Display Roll Formula to Chat checkbox
    const displayFormulaCheckbox = $html.find('input[name="displayRoll"]');
    if (displayFormulaCheckbox.length > 0) {
      const formGroup = displayFormulaCheckbox.closest(".form-group");
      if (formGroup.length > 0) {
        formGroup.after(checkboxHtml);

        // Handle checkbox changes
        $html
          .find("#gm-only-checkbox")
          .off("change")
          .on("change", function () {
            const isChecked = $(this).is(":checked");
            table.setFlag(
              GMOnlyTables.MODULE_ID,
              GMOnlyTables.FLAG_KEY,
              isChecked
            );
          });
        return;
      }
    }

    // Fallback: Insert in Summary tab
    const summaryTab = $html.find(
      '[data-tab="summary"], .tab[data-tab="summary"]'
    );
    if (summaryTab.length > 0) {
      const lastFormGroup = summaryTab.find(".form-group").last();
      if (lastFormGroup.length > 0) {
        lastFormGroup.after(checkboxHtml);

        // Handle checkbox changes
        $html
          .find("#gm-only-checkbox")
          .off("change")
          .on("change", function () {
            const isChecked = $(this).is(":checked");
            table.setFlag(
              GMOnlyTables.MODULE_ID,
              GMOnlyTables.FLAG_KEY,
              isChecked
            );
          });
      }
    } else {
      // Final fallback for name input if summary tab not found
      const nameInput = $html.find('input[name="name"]');
      if (nameInput.length > 0) {
        const formGroup = nameInput.closest(".form-group");
        if (formGroup.length > 0) {
          formGroup.after(checkboxHtml);

          $html
            .find("#gm-only-checkbox")
            .off("change")
            .on("change", function () {
              const isChecked = $(this).is(":checked");
              table.setFlag(
                GMOnlyTables.MODULE_ID,
                GMOnlyTables.FLAG_KEY,
                isChecked
              );
            });
        }
      }
    }
  }

  /**
   * Intercept chat messages from table rolls and modify whisper behavior
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
        document.updateSource({ whisper: gmUsers });
      }
    } catch (error) {
      console.error(
        `${this.MODULE_ID}: Error in onPreCreateChatMessage`,
        error
      );
    }
  }

  /**
   * Hook into RollTable.roll() directly for primary whisper control
   */
  static wrapRollTableRoll() {
    if (RollTable.prototype._originalRoll) return;
    RollTable.prototype._originalRoll = RollTable.prototype.roll;
    RollTable.prototype.roll = async function (options = {}) {
      const isGMOnly = this.getFlag(
        GMOnlyTables.MODULE_ID,
        GMOnlyTables.FLAG_KEY
      );

      if (isGMOnly) {
        if (!options.rollMode) {
          options.rollMode = CONST.DICE_ROLL_MODES.PRIVATE;
        }

        if (!options.chatMessage) options.chatMessage = {};
        if (!options.chatMessage.whisper) {
          const gmUsers = game.users.filter((u) => u.isGM).map((u) => u.id);
          options.chatMessage.whisper = gmUsers;
        }
      }

      return this._originalRoll.call(this, options);
    };
  }
}

// Initialize the module
Hooks.once("init", () => {
  GMOnlyTables.init();
  GMOnlyTables.wrapRollTableRoll();
});
