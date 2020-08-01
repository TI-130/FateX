/**
 * ActorFate is the default entity class for actors inside the FateX system.
 * Adds custom features based on the system.
 */
import { TemplateActorPicker } from "../settings/TemplateActorPicker.js";
import { TemplateActorSheetFate } from "./template/TemplateActorSheetFate.js";

export class ActorFate extends Actor {

    /**
     * Open template picker instead of directly creating a new actor
     */
    static async create(data, options = {}) {
        // Fallback for manual actor duplication
        if(data._id) {
            return super.create(data, options);
        }

        CONFIG.FateX.applications.templatePicker.render(true);
    }

    /**
     * Provide basic token configuration for newly created actors.
     * Automatically links new tokens to the actor.
     */
    static async _create(data, options = {}) {
        data.token = data.token || {};

        if(options.actorTemplate) {
            mergeObject(data, options.actorTemplate);
        }

        // Set basic token data for newly created actors.
        mergeObject(data.token, {
            vision: true,
            dimSight: 30,
            brightSight: 0,
            actorLink: true,
            disposition: 1
        }, {overwrite: false});

        return super.create(data, options);
    }

    render(force=false, options={}) {
        super.render(force, options);

        for (let app in CONFIG.FateX.applications) {
            CONFIG.FateX.applications[app].render();
        }
    }

    get _sheetClass() {
        if (this.isTemplateActor) {
            return TemplateActorSheetFate;
        }

        return super._sheetClass;
    }

    get isTemplateActor() {
        return !!this.getFlag('fatex', 'isTemplateActor');
    }

    get visible() {
        if(this.isTemplateActor) {
            return false;
        }

        return super.visible;
    }

    /**
     * Re-prepare the data for all owned items when owned items are deleted.
     * This ensures, that items that reference the deleted item get updated.
     */
    _onModifyEmbeddedEntity(embeddedName, changes, options, userId, context = {}) {
        super._onModifyEmbeddedEntity(embeddedName, changes, options, userId, context);

        if(embeddedName === 'OwnedItem') {
            this.items.forEach((item) => item.prepareData());
        }
    }
}