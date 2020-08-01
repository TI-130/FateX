export class BaseItem {
    static get entityName() {
        return false;
    };

    /**
     * Allows each item to prepare its data before its rendered.
     * This can be used to add additional information right before rendering.
     */
    static prepareItemData(item, entity) {
        return item;
    }

    /**
     * Allows every item to register its own listeners for rendered actor sheets.
     * Implements base listeners for adding, configuring and deleting embedded items.
     */
    static activateActorSheetListeners(html, sheet) {
        if(!this.entityName) {
            throw new Error("A subclass of the BaseItem must provide an entityName field or implement their own _onItemAdd() method.");
        }

        // Default listeners for adding, configuring and deleting embedded items
        html.find(`.fatex__${this.entityName}__add`).click((e) => this._onItemAdd.call(this, e, sheet));
        html.find(`.fatex__${this.entityName}__settings`).click((e) => this._onItemSettings.call(this, e, sheet));
        html.find(`.fatex__${this.entityName}__delete`).click((e) => this._onItemDelete.call(this, e, sheet));
    }

    /**
     * Allows each item to add data to its own sheet.
     */
    static getSheetData(sheetData, sheet) {
        return sheetData;
    }

    /**
     * Allows each item to add data to its owners actorsheet.
     */
    static getActorSheetData(sheetData) {
        return sheetData;
    }

    /**
     * Allows each item to add listeners to its sheet
     */
    static activateListeners(html, sheet) {}

    /*************************
     * EVENT HANDLER
     *************************/

    /**
     * Itemtype agnostic handler for creating new items via event.
     */
    static _onItemAdd(e, sheet) {
        e.preventDefault();
        e.stopPropagation();

        if(!this.entityName) {
            throw new Error("A subclass of the BaseItem must provide an entityName field or implement their own _onItemAdd() method.");
        }

        const itemData = {
            name: this.defaultName,
            type: this.entityName,
        };

        this.createNewItem(itemData, sheet);
    }

    /**
     * Itemtype agnostic handler for opening an items sheet via event.
     */
    static _onItemSettings(e, sheet) {
        e.preventDefault();
        e.stopPropagation();

        const data = e.currentTarget.dataset;
        const item = sheet.actor.getOwnedItem(data.item);

        if(item) {
            item.sheet.render(true);
        }
    }

    /**
     * Itemtype agnostic handler for deleting an item via event.
     */
    static _onItemDelete(e, sheet) {
        e.preventDefault();
        e.stopPropagation();

        const data = e.currentTarget.dataset;
        const item = sheet.actor.getOwnedItem(data.item);

        (new Dialog({
            title: `${game.i18n.format('FAx.Dialog.EntityDelete')} ${item.name}`,
            content: game.i18n.format('FAx.Dialog.EntityDeleteText'),
            default: 'submit',
            buttons: {
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize("FAx.Dialog.Cancel"),
                    callback: () => null
                },
                submit: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize("FAx.Dialog.Confirm"),
                    callback: async () => {
                        await sheet.actor.deleteOwnedItem(data.item);
                    }
                }
            }
        }, {
            classes: ['fatex', 'fatex__dialog'],
        })).render(true);
    }


    /*************************
     * HELPER FUNCTIONS
     *************************/


    /**
     * Helper function to create a new item.
     * Render parameter determines if the items sheet should be rendered.
     */
    static createNewItem(itemData, sheet, render = true) {
        // Create item and render sheet afterwards
        sheet.actor.createOwnedItem(itemData).then((item) => {
            if(!render) return;

            // We have to reload the item for it to have a sheet
            const createdItem = sheet.actor.getOwnedItem(item._id);
            createdItem.sheet.render(true);
        });
    }

    /**
     * Helper function to determine a new items name.
     * Defaults to the entityName with the first letter capitalized.
     */
    static get defaultName() {
        return this.entityName.charAt(0).toUpperCase() + this.entityName.slice(1);
    };
}