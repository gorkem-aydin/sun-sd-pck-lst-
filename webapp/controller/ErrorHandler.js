sap.ui.define([
	"sap/ui/base/Object",
	"sap/m/MessageBox"
], function (UI5Object, MessageBox) {
	"use strict";

	return UI5Object.extend("com.sun.sd.packinglist.controller.ErrorHandler", {

		/**
		 * Handles application errors by automatically attaching to the model events and displaying errors when needed.
		 * @class
		 * @param {sap.ui.core.UIComponent} oComponent reference to the app's component
		 * @public
		 * @alias com.sdpackinglist.controller.ErrorHandler
		 */
		constructor: function (oComponent) {
			this._oResourceBundle = oComponent.getModel("i18n").getResourceBundle();
			this._oComponent = oComponent;
			this._oModel = oComponent.getModel();
			this._bMessageOpen = false;
			this._sErrorText = this._oResourceBundle.getText("errorText");

			this._oModel.attachMetadataFailed(function (oEvent) {
				var oParams = oEvent.getParameters();
				this._showServiceError(oParams.response);
			}, this);

			this._oModel.attachRequestFailed(function (oEvent) {
				var oParams = oEvent.getParameters();
				// An entity that was not found in the service is also throwing a 404 error in oData.
				// We already cover this case with a notFound target so we skip it here.
				// A request that cannot be sent to the server is a technical error that we have to handle though
				if (oParams.response.statusCode !== "404" || (oParams.response.statusCode === 404 && oParams.response.responseText.indexOf(
						"Cannot POST") === 0)) {
					this._showServiceError(oParams.response);
				}
			}, this);
		},

		/**
		 * Shows a {@link sap.m.MessageBox} when a service call has failed.
		 * Only the first error message will be display.
		 * @param {string} sDetails a technical error to be displayed on request
		 * @private
		 */
		_showServiceError: function (sDetails) {
			// 	if (this._bMessageOpen) {
			// 		return;
			// 	}
			// 	this._bMessageOpen = true;
			// 	MessageBox.error(
			// 		this._sErrorText,
			// 		{
			// 			id : "serviceErrorMessageBox",
			// 			details: sDetails,
			// 			styleClass: this._oComponent.getContentDensityClass(),
			// 			actions: [MessageBox.Action.CLOSE],
			// 			onClose: function () {
			// 				this._bMessageOpen = false;
			// 			}.bind(this)
			// 		}
			// 	);
			var jsonError, errorDetails, errorMessage = "",
				msg = "";
			try {
				jsonError = JSON.parse(sDetails.responseText);
				errorDetails = jsonError.error.innererror.errordetails;
				if (errorDetails && errorDetails.length > 0) {
					errorDetails.sort(function (a, b) {
						return a.message === b.message ? 0 : +(a.message > b.message) || -1;
					});
					for (var i in errorDetails) {
						if (msg !== errorDetails[i].message) {
							msg = errorDetails[i].message;
							errorMessage += "\u2022 " + msg + "\n";
						}
					}
				} else {
					errorMessage += "\u2022 " + jsonError.error.message.value + "\n";
				}
			} catch (exception) {
				errorMessage = this._sErrorText;
			}
			if (this._bMessageOpen) {
				return;
			}
			this._bMessageOpen = true;
			MessageBox.error(
				errorMessage, {
					id: "serviceErrorMessageBox",
					details: errorDetails,
					styleClass: this._oComponent.getContentDensityClass(),
					actions: [MessageBox.Action.CLOSE],
					onClose: function () {
						this._bMessageOpen = false;
					}.bind(this)
				}
			);
		}

	});
});