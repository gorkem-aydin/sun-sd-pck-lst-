sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("com.sun.sd.packinglist.controller.App", {

		onInit: function () {
			var oViewModel,
				fnSetAppNotBusy,
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			oViewModel = new JSONModel({
				busy: true,
				delay: 0
			});
			this.setModel(oViewModel, "appView");

			fnSetAppNotBusy = () => {
				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			};

			// disable busy indication when the metadata is loaded and in case of errors
			this.getOwnerComponent().getModel().metadataLoaded().then(fnSetAppNotBusy);
			this.getOwnerComponent().getModel().attachMetadataFailed(fnSetAppNotBusy);

			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			//message manager
			var oMessageManager = sap.ui.getCore().getMessageManager();
			this.getOwnerComponent().setModel(oMessageManager.getMessageModel(), "message");

		}

		// onInit: function () {

		// 	// default OData model
		// 	var oModel = this.getOwnerComponent().getModel();

		// 	// message manager
		// 	var oMessageManager = sap.ui.getCore().getMessageManager();
		// 	this.getOwnerComponent().setModel(oMessageManager.getMessageModel(), "message");

		// 	// app view model
		// 	var oAppModel = new JSONModel({
		// 		busy: true,
		// 		delay: 0
		// 	});

		// 	this.setModel(oAppModel, "appView");

		// 	var fnSetAppNotBusy = () => {
		// 		oAppModel.setProperty("/busy", false);
		// 	};

		// 	var fnRemoveDuplicates = () => {
		// 		var oMessages = oMessageManager.getMessageModel().getData(),
		// 			aMessageTexts = oMessages.map(oItem => oItem.message),
		// 			aMessages = [];

		// 		aMessageTexts = [...new Set(aMessageTexts)];

		// 		var fnFilterDuplicates = (oMessage) => {
		// 			if (aMessageTexts.includes(oMessage.message)) {
		// 				aMessageTexts.splice(aMessageTexts.indexOf(oMessage.message), 1);
		// 				return oMessage;
		// 			} else {
		// 				return false;
		// 			}
		// 		};

		// 		aMessages = oMessages.filter(fnFilterDuplicates);
		// 		oMessageManager.getMessageModel().setData(aMessages);
		// 	};

		// 	// disable busy indication when the metadata is loaded and in case of errors
		// 	oModel.metadataLoaded().then(fnSetAppNotBusy);
		// 	oModel.attachMetadataFailed(fnSetAppNotBusy);
		// 	oModel.attachRequestFailed(fnRemoveDuplicates);

		// 	// apply content density mode to root view
		// 	this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		// }
	});
});