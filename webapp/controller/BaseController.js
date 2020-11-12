sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/ui/core/Fragment",
	"sap/m/library"
], function (Controller, UIComponent, Fragment, mobileLibrary) {
	"use strict";

	// shortcut for sap.m.URLHelper
	var URLHelper = mobileLibrary.URLHelper;

	return Controller.extend("com.sun.sd.packinglist.controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress: function () {
			var oViewModel = (this.getModel("objectView") || this.getModel("worklistView"));
			URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},

		/**
		 * Get application component for started parameters
		 * @public
		 * @return {sap.ui.component} the applicaton component
		 */
		getMyComponent: function () {
			"use strict";
			var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
			return sap.ui.component(sComponentId);

		},
		/**
		 * Adds a history entry in the FLP page history
		 * @public
		 * @param {object} oEntry An entry object to add to the hierachy array as expected from the ShellUIService.setHierarchy method
		 * @param {boolean} bReset If true resets the history before the new entry is added
		 */
		addHistoryEntry: (function () {
			var aHistoryEntries = [];

			return (oEntry, bReset) => {
				if (bReset) {
					aHistoryEntries = [];
				}

				var bInHistory = aHistoryEntries.some(function (oHistoryEntry) {
					return oHistoryEntry.intent === oEntry.intent;
				});

				if (!bInHistory) {
					aHistoryEntries.push(oEntry);
					this.getOwnerComponent().getService("ShellUIService").then(function (oService) {
						oService.setHierarchy(aHistoryEntries);
					});
				}
			};
		})(),

		/**
		 * @public
		 * Remove all messages in message model
		 */
		resetMessageModel: () => {
			sap.ui.getCore().getMessageManager().removeAllMessages();
		},

		/**
		 * Message popover
		 * @public
		 * @param {sap.ui.base.Event} oEvent - Event object
		 */
		onMessageButtonPress: function (oEvent) {
			var oMessagesButton = oEvent.getSource();

			if (!this._oMessagePopover) {
				this._oMessagePopover = new sap.m.MessagePopover({
					items: {
						path: "message>/",
						template: new sap.m.MessagePopoverItem({
							description: "{message>description}",
							type: "{message>type}",
							title: "{message>message}"
						})
					}
				});

				oMessagesButton.addDependent(this._oMessagePopover);
			}

			this._oMessagePopover.toggle(oMessagesButton);
		},

		/**
		 * Open generic dialog
		 * @public
		 * @param {string} sDialogId - Dialog id
		 * @param {string} sFragmentName - Fragment name
		 * @returns {Promise} Dialog
		 */
		openDialog: function (sDialogId, sFragmentName) {
			let fnPromise = (fnResolve, fnReject) => {
				let oView = this.getView(),
					oDialog = this.byId(sDialogId),
					sContentDensityClass = this.getOwnerComponent().getContentDensityClass();

				if (!oDialog) {
					Fragment.load({
						id: oView.getId(),
						name: sFragmentName,
						controller: this
					}).then((oFragment) => {
						jQuery.sap.syncStyleClass(sContentDensityClass, oView, oFragment);
						oView.addDependent(oFragment);
						oFragment.open();
						fnResolve(oFragment);
					});
				} else {
					oDialog.open();
					fnResolve(oDialog);
				}

			};

			return new Promise(fnPromise);
		},

		/**
		 * Close generic dialog via end button
		 * @public
		 * @param {sap.ui.base.Event} oEvent - Event object
		 */
		closeDialog: (oEvent) => {
			oEvent.getSource().getParent().close();
		}

	});
});