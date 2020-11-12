sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/table/Column",
	"sap/m/Label",
	"sap/m/Input",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, Column, Label, Input, MessageBox, MessageToast) {
	"use strict";

	return BaseController.extend("com.sun.sd.packinglist.controller.OrderDetail", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the OrderDetail controller is instantiated.
		 * @public
		 */
		onInit: function () {

			var oMessageManager = sap.ui.getCore().getMessageManager();
			this._oModel = this.getOwnerComponent().getModel();
			this._oViewModel = this.getOwnerComponent().getModel("worklistViewModel");
			this.i18nBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.getRouter().getRoute("orderDetail").attachPatternMatched(this._onOrderDetailMatched, this);
			var oHeaderModel = new JSONModel();
			oHeaderModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			this.setModel(oHeaderModel, "headerModel");
			this.getView().setModel(oMessageManager.getMessageModel(), "message");
			oMessageManager.registerObject(this.getView(), true);
		},
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */
		onMessagePopoverPress: function (oEvent) {
			this._getLazyMessagePopover().openBy(oEvent.getSource());
		},
		onTBEdit: function () {
			// edit mode
			this.getModel("viewModel").setProperty("/editMode", true);
		},
		onTBDisplay: function () {
			// display mode
			this.getModel("viewModel").setProperty("/editMode", false);
		},
		onButtonDraftSavePress: function (oEvent) {
			// draft
			this._prepareDeliveryData("01");
		},

		onButtonSaveSendPress: function (oEvent) {
			// save and send onCeki vs yuklemeCeki
			//if this._orderId is not initial I will change delivery.
			if (this.getModel("viewModel").getProperty("/cekmeTuru") === "01") {
				if (this._orderId) {
					this._changeDelivery("02");
				} else {
					this._prepareDeliveryData("02");
				}
			} else {
				if (this._orderId) {
					this._changeDelivery("05");
				} else {
					this._prepareDeliveryData("05");
				}
			}

		},

		// onButtonAssignKoliNo: function () {
		// 	this._calculateBoxNumber();
		// },

		onButtonAddLinePress: function () {
			//addLine 
			this._addOneLine();
		},

		onDeleteRowList: function (oEvent) {
			//delete row
			var iSelectedId = oEvent.getSource().getBindingContext("worklistViewModel").sPath.split("/rows/")[1];
			var aRows = this._oViewModel.getData().rows;
			var oViewModel = this.getModel("viewModel");
			aRows.splice(iSelectedId, 1);

			this.getModel("worklistViewModel").setProperty("/rows", aRows);
			this._calculateTotalValue();

			if (oViewModel.getProperty("/packageType") === "K") {
				this._calculateBoxNumber();
			}
			//this._calculateBoxNumber();

		},
		onChangeInputFields: function () {
			//change input everywhere
			this._changeInputFields();
		},

		onButtonUnitWeightPress: function (oEvent) {
			//open weight fragment
			var oDialog = this.byId("dialogAddUnitWeight");
			var aSizes = this.getModel("worklistViewModel").getProperty("/sizes");
			var aWeight = this.getModel("worklistViewModel").getProperty("/weight");
			var oViewModel = this.getModel("viewModel");
			var oLabel, oInput, sDialogText, oText;
			if (oViewModel.getProperty("/packageType") === "A") {
				sDialogText = "Boy ve gramaj girişi";
			} else {
				sDialogText = "Gramaj girişi";
			}

			if (!oDialog) {
				// Create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(this.getView().getId(), "com.sun.sd.packinglist.view.fragment.main.AddUnitWeight", this);
				this.getView().addDependent(oDialog);
				jQuery.sap.syncStyleClass(this.getOwnerComponent().getContentDensityClass(), this.getView(), oDialog);
				//this._orderId

				//setData for created delivery
				if (aWeight.length > 0) {
					if (oViewModel.getProperty("/packageType") === "A") {
						oLabel = new sap.m.Label({
							text: "",
							design: sap.m.LabelDesign.Bold
						});
						oDialog.getAggregation("content")[0].addContent(oLabel);
						oText = new sap.m.Text({
							text: "Boy(cm)",
							textAlign: "Center"

						});
						oDialog.getAggregation("content")[0].addContent(oText);
						oText = new sap.m.Text({
							text: "Gramaj",
							textAlign: "Center"
						});
						oDialog.getAggregation("content")[0].addContent(oText);
						for (let j = 0; j < aWeight.length; j++) {
							oLabel = new sap.m.Label({
								text: aWeight[j].Name,
								design: sap.m.LabelDesign.Bold
							});
							oDialog.getAggregation("content")[0].addContent(oLabel);
							oInput = new sap.m.Input({
								value: aWeight[j]["Boy"],
								type: "Number"
							});

							oDialog.getAggregation("content")[0].addContent(oInput);
							oInput = new sap.m.Input({
								value: aWeight[j][aWeight[j].Name],
								type: "Number"

							});
							oDialog.getAggregation("content")[0].addContent(oInput);

						}
					} else {
						for (let j = 0; j < aWeight.length; j++) {
							oLabel = new sap.m.Label({
								text: aWeight[j].Name,
								design: sap.m.LabelDesign.Bold
							});
							oDialog.getAggregation("content")[0].addContent(oLabel);
							oInput = new sap.m.Input({
								value: aWeight[j][aWeight[j].Name],
								type: "Number"

							});
							oDialog.getAggregation("content")[0].addContent(oInput);

						}
					}

					this._changeInputFields();
				} else {
					if (oViewModel.getProperty("/packageType") === "A") {
						oLabel = new sap.m.Label({
							text: "",
							design: sap.m.LabelDesign.Bold
						});
						oDialog.getAggregation("content")[0].addContent(oLabel);
						oText = new sap.m.Text({
							text: "Boy(cm)",
							textAlign: "Center"

						});
						oDialog.getAggregation("content")[0].addContent(oText);
						oText = new sap.m.Text({
							text: "Gramaj",
							textAlign: "Center"
						});
						oDialog.getAggregation("content")[0].addContent(oText);
					}

					for (var i = 0; i < aSizes.length; i++) {
						oLabel = new sap.m.Label({
							text: aSizes[i],
							design: sap.m.LabelDesign.Bold
						});
						oDialog.getAggregation("content")[0].addContent(oLabel);
						oInput = new sap.m.Input({
							value: "",
							type: "Number"

						});
						oDialog.getAggregation("content")[0].addContent(oInput);
						if (oViewModel.getProperty("/packageType") === "A") {
							oInput = new sap.m.Input({
								value: "",
								type: "Number"

							});
							oDialog.getAggregation("content")[0].addContent(oInput);
						}

					}
				}

			}

			oDialog.setTitle(sDialogText);
			oDialog.open();
		},
		onDialogButtonAddWeightPress: function (oEvent) {
			//setData weight
			var oDialog = oEvent.getSource().getParent();
			var aContent = oDialog.getAggregation("content")[0].getContent();
			var oViewModel = this.getModel("viewModel");
			var aContentData = [];
			var oContentValue = {};
			var cTmp = 0,
				cTmpBoy = 0,
				cTmpGramaj = 0;
			if (oViewModel.getProperty("/packageType") === "A") {
				for (let i = 3; i < aContent.length; i += 3) {
					oContentValue = {};
					oContentValue["Boy"] = parseInt(aContent[i + 1].getValue(), 10);
					oContentValue[aContent[i].getText()] = parseInt(aContent[i + 2].getValue(), 10);

					// if (tmp < oContentValue[aContent[i].getText()]) {
					// 	tmp = oContentValue[aContent[i].getText()];
					// } else {
					// 	MessageBox.error("Bedenlerin gramajlarını kontrol ediniz");
					// 	this._fragmentFlag = "X";
					// 	return;
					// }

					oContentValue.Name = aContent[i].getText();
					aContentData.push(oContentValue);
				}
				for (let i = 0; i < aContentData.length; i++) {
					if (cTmpGramaj < aContentData[i][aContentData[i].Name] && cTmpBoy <= aContentData[i].Boy) {
						cTmpGramaj = aContentData[i][aContentData[i].Name];
						cTmpBoy = aContentData[i].Boy;
					} else {
						MessageBox.error("Bedenlerin boy ve gramajlarını kontrol ediniz");
						this._fragmentFlag = "X";
						return;
					}
				}
			} else {
				for (let i = 0; i < aContent.length; i += 2) {
					oContentValue = {};
					oContentValue[aContent[i].getText()] = parseInt(aContent[i + 1].getValue(), 10);
					if (cTmp < oContentValue[aContent[i].getText()]) {
						cTmp = oContentValue[aContent[i].getText()];
					} else {
						MessageBox.error("Bedenlerin gramajlarını kontrol ediniz");
						this._fragmentFlag = "X";
						return;
					}

					oContentValue.Name = aContent[i].getText();
					aContentData.push(oContentValue);
				}
			}

			this.getModel("worklistViewModel").setProperty("/weight", aContentData);
			this._fragmentFlag = "";
			this._changeInputFields();
			oEvent.getSource().getParent().close();
			oDialog.destroy();
		},
		onDialogButtonCancelPress: function (oEvent) {
			//cancel
			if (this._fragmentFlag) {
				MessageBox.error("Bedenlerin gramajlarını kontrol ediniz");
				return;
			}
			oEvent.getSource().getParent().close();
			oEvent.getSource().getParent().destroy();
		},

		/*
		 * Confirm 
		 * @public
		 * @param {String} sAnswer - Ansver 'O' - 'R'
		 */
		onConfirmPress: function (sAnswer) {
			//Approve and reject open dialog
			let oViewModel = this.getModel("viewModel");

			oViewModel.setProperty("/answerType", sAnswer);
			oViewModel.setProperty("/answerPackingEnableMode", true);
			oViewModel.setProperty("/answerPacking", {});
			this.openDialog("dialogAnswerPacking", "com.sun.sd.packinglist.view.fragment.dialog.AnswerPacking").then((oDialog) => {});
		},

		onUndoRequestPress: function (sType) {
			//undo approve or reject
			var that = this;
			let oModel = this.getModel("headerModel");
			let sText;
			if (sType === "A") {
				sText = this.i18nBundle.getText("undoApproveText", [oModel.getProperty("/VbelnVl")]);
			} else {
				sText = this.i18nBundle.getText("undoRejectText", [oModel.getProperty("/VbelnVl")]);
			}

			let fnSuccess = (oData) => {
					MessageToast.show(this.i18nBundle.getText("successAndHomePage"));
					jQuery.sap.delayedCall(1800, this, () => {
						// sap.ui.core.BusyIndicator.show(0);
						sap.ui.core.BusyIndicator.hide();
						this.getRouter().navTo("OrderList");
					});
				},
				fnError = err => {
					sap.ui.core.BusyIndicator.hide();
				},
				fnFinally = () => {};

			MessageBox.warning(sText, {
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: function (sAction) {
					if (sAction === "OK") {
						that._undoRequest(oModel.getProperty("/VbelnVl"), oModel.getProperty("/BelgeDurumu"), oModel.getProperty("/CekmeTuru")).then(
								fnSuccess)
							.catch(fnError)
							.finally(fnFinally);
					}
				}
			});
		},

		onButtonDeliveryDeletePress: function () {
			//delete delivery
			var that = this;
			let oModel = this.getModel("headerModel");
			let sText = this.i18nBundle.getText("deleteDelivery", [oModel.getProperty("/VbelnVl")]);
			MessageBox.warning(sText, {
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: function (sAction) {
					if (sAction === "OK") {
						let fnSuccess = (oData) => {
								MessageToast.show(that.i18nBundle.getText("successAndHomePage"));
								jQuery.sap.delayedCall(1800, that, () => {
									// sap.ui.core.BusyIndicator.show(0);
									sap.ui.core.BusyIndicator.hide();
									that.getRouter().navTo("OrderList");
								});
							},
							fnError = err => {
								sap.ui.core.BusyIndicator.hide();
							},
							fnFinally = () => {};

						that._deleteRequest(oModel.getProperty("/VbelnVl"))
							.then(fnSuccess)
							.catch(fnError)
							.finally(fnFinally);
					}
				}
			});

		},

		onButtonOnCekiToYuklemeCekiPress: function (oEvent) {
			//convert onCeki to YuklemeCeki
			let oModel = this.getModel("viewModel"),
				fnSuccess = (oData) => {
					MessageToast.show(this.i18nBundle.getText("successAndHomePage"));
					jQuery.sap.delayedCall(1800, this, () => {
						// sap.ui.core.BusyIndicator.show(0);
						sap.ui.core.BusyIndicator.hide();
						this.getRouter().navTo("OrderList");
					});
				},
				fnError = err => {
					sap.ui.core.BusyIndicator.hide();
				},
				fnFinally = () => {};

			this._transformOnCekiToYuklemeCeki(oModel.getProperty("/cekmeTuru"), "05", this._orderId).then(fnSuccess)
				.catch(fnError)
				.finally(fnFinally);

		},

		onSavePackingAnswer: function (oEvent) {
			//approve or reject answer data
			let oViewModel = this.getModel("viewModel"),
				oDialog = oEvent.getSource().getParent(),
				oAnswerPacking = oViewModel.getProperty("/answerPacking"),
				sAnswerType = oViewModel.getProperty("/answerType"),
				dToday = new Date(),
				fnSuccess = (oData) => {
					oDialog.close();
					oViewModel.setProperty("/busy", false);
					jQuery.sap.delayedCall(1800, this, () => {
						sap.ui.core.BusyIndicator.hide();
						MessageToast.show(this.i18nBundle.getText("successAndHomePage"));
						this.getRouter().navTo("OrderList");
					});
				},
				fnError = err => {
					oDialog.close();
					oViewModel.setProperty("/busy", false);

				},
				fnFinally = () => {};

			if (sAnswerType === "O") {
				if (!oAnswerPacking.Tarih) {
					MessageBox.error(this.i18nBundle.getText("selectADate"));
					return;
				}
			} else {
				if (!(oAnswerPacking.Tarih && oAnswerPacking.Lifsk)) {
					MessageBox.error(this.i18nBundle.getText("selectADateAndRejectReason"));
					return;
				}
			}
			if (oAnswerPacking.Tarih.getTime() > dToday.getTime()) {
				MessageBox.error(this.i18nBundle.getText("wrongDate"));
				return;
			}
			oViewModel.setProperty("/busy", true);
			this._confirmationPackingRequest()
				.then(fnSuccess)
				.catch(fnError)
				.finally(fnFinally);
		},
		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		_deleteRequest: function (sTeslimat) {
			var oModel = this.getModel();
			sap.ui.core.BusyIndicator.show(0);
			return new Promise((fnResolve, fnReject) => {
				let oParams = {
						success: fnResolve,
						error: fnReject
					},
					sPath = oModel.createKey("/DeleteDeliverySet", {
						IvTeslimat: sTeslimat
					});

				oModel.remove(sPath, oParams);
			});
		},
		_undoRequest: function (sTeslimat, sBelgeDurumu, sCekmeTuru) {
			var oUrlParameters = {};
			var oModel = this.getModel();
			oUrlParameters.IvBelgedurumu = sBelgeDurumu;
			oUrlParameters.IvCekmeTuru = sCekmeTuru;
			oUrlParameters.IvTeslimat = sTeslimat;

			sap.ui.core.BusyIndicator.show(0);
			return new Promise((fnResolve, fnReject) => {
				let oParams = {
						success: fnResolve,
						error: fnReject
					},
					sPath = oModel.createKey("/UndoRequestSet", {
						IvTeslimat: oUrlParameters.IvTeslimat
					});

				oModel.update(sPath, oUrlParameters, oParams);
			});
		},
		_transformOnCekiToYuklemeCeki: function (sCekmeTuru, sStatus, sDelivery) {
			let oUrlParameters = {},
				oModel = this.getModel();
			oUrlParameters.IvCekmeTuru = sCekmeTuru;
			oUrlParameters.IvBelgedurumu = sStatus;
			oUrlParameters.IvTeslimat = sDelivery;
			sap.ui.core.BusyIndicator.show(0);
			return new Promise((fnResolve, fnReject) => {
				let oParams = {
						success: fnResolve,
						error: fnReject
					},
					sPath = `/TransformOnCekiToYuklemeCekiSet('${oUrlParameters.IvTeslimat}')`;

				oModel.update(sPath, oUrlParameters, oParams);
			});

		},
		_confirmationPackingRequest: function () {
			let oModel = this.getModel(),
				oViewModel = this.getModel("viewModel"),
				sAnswerType = oViewModel.getProperty("/answerType"),
				oAnswerPacking = oViewModel.getProperty("/answerPacking"),
				oUrlParameters = {};

			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-dd'T'03':00':00"
			});
			oUrlParameters.Teslimat = this._orderId;
			oUrlParameters.Tarih = new Date(dateFormat.format(oAnswerPacking.Tarih));
			oUrlParameters.CekmeTuru = this.getModel("headerModel").getProperty("/CekmeTuru");
			oUrlParameters.Lifsk = sAnswerType === 'R' ? oAnswerPacking.Lifsk : "";
			oUrlParameters.String = sAnswerType === 'R' ? oAnswerPacking.String : "";
			sap.ui.core.BusyIndicator.show(0);
			return new Promise((fnResolve, fnReject) => {
				let oParams = {
						success: fnResolve,
						error: fnReject
					},
					sPath = oModel.createKey("/ConfirmationSet", {
						Teslimat: oUrlParameters.Teslimat
					});

				oModel.update(sPath, oUrlParameters, oParams);
			});
		},
		_changeInputFieldsForRack: function () {
			var aRows = this.getModel("worklistViewModel").getData().rows;
			var aSizes = this.getModel("worklistViewModel").getProperty("/sizes");
			var aWeights = this.getModel("worklistViewModel").getProperty("/weight");
			var oViewModel = this.getModel("viewModel");
			var oHeaderModel = this.getModel("headerModel");
			var calSameInput = 1;
			//Askılıda birden fazla beden girişi hatası
			for (var z = 0; z < aRows.length; z++) {
				for (var p = 0; p < aSizes.length; p++) {
					if (aRows[z]["dynamicColumn-" + aSizes[p]]) {
						calSameInput = parseInt(calSameInput) + 1;
						if (calSameInput !== 1 && calSameInput !== 2) {
							MessageBox.error(this.i18nBundle.getText("satirkontrol"));
							return false;
						}
					}
				}
				calSameInput = 1;
			}
			let cToplamAdet, cToplamAgirlik, cToplamAskisizAgirlik;
			for (var j = 0; j < aRows.length; j++) {
				aRows[j].ToplamAdet = "";
				for (var m = 0; m < aSizes.length; m++) {
					if (aRows[j]["dynamicColumn-" + aSizes[m]] !== undefined && aRows[j]["dynamicColumn-" + aSizes[m]] !== "") {
						aRows[j].ToplamAdet = parseInt(aRows[j]["dynamicColumn-" + aSizes[m]], 10);
						aRows[j]["total-" + aSizes[m]] = aRows[j].ToplamAdet;
						aRows[j].BirimBoy = aWeights.find(item => item.Name === aSizes[m]).Boy;
						aRows[j].BirimAgirlik = aWeights.find(item => item.Name === aSizes[m])[aSizes[m]];
						aRows[j].FshScStxt = aSizes[m];
						aRows[j].ToplamAgirlik = (aRows[j].ToplamAdet * aRows[j].BirimAgirlik) / 1000;
					} else {
						aRows[j]["total-" + aSizes[m]] = "";
					}
				}

			}
			cToplamAdet = aRows.map(
				item =>
				parseFloat(item.ToplamAdet, 10)).reduce((total, value) => total + value, 0);
			cToplamAgirlik = aRows.map(
				item =>
				parseFloat(item.ToplamAgirlik, 10)).reduce((total, value) => total + value, 0);

			cToplamAdet = (isNaN(cToplamAdet) ? "" : cToplamAdet);
			cToplamAgirlik = (isNaN(cToplamAgirlik) ? "" : cToplamAgirlik);
			cToplamAskisizAgirlik = cToplamAgirlik - ((cToplamAdet * parseInt(oHeaderModel.getProperty("/AskiAgirligi"), 10)) / 1000);
			cToplamAskisizAgirlik = (isNaN(cToplamAskisizAgirlik) ? "" : parseFloat(cToplamAskisizAgirlik.toFixed(3)));

			oHeaderModel.setProperty("/ToplamAdet", cToplamAdet);
			oHeaderModel.setProperty("/ToplamAskiSayisi", cToplamAdet);
			oHeaderModel.setProperty("/AskisizToplamAgirlikKg", cToplamAskisizAgirlik);
			oHeaderModel.setProperty("/ToplamAgirlik",
				(cToplamAgirlik ? parseFloat(cToplamAgirlik.toFixed(3)) : cToplamAgirlik));
			this.getModel("worklistViewModel").setProperty("/rows", aRows);
			this._calculateTotalValue();
		},
		changeKoliEbat: function () {
			var oViewModel = this.getView().getModel("viewModel");
			var aRows = this.getModel("worklistViewModel").getData().rows;

			var KoliEbat = this.getModel("headerModel").getData().KoliEbat;
			if (KoliEbat.split("X").length !== 3) {
				MessageBox.error(this.i18nBundle.getText("koliebatformat"));
				return false;
			}
			var aRows = this._oViewModel.getProperty("/rows");
			for (var i = 0; i < aRows.length; i++) {
				aRows[i].KoliEbat = this.getModel("headerModel").getData().KoliEbat;
			}

			this.getModel("worklistViewModel").setProperty("/rows", aRows);
			// this._addOneLine();

		},
		_changeInputFields: function () {
			debugger;
			var oViewModel = this.getModel("viewModel");
			if (oViewModel.getProperty("/packageType") === "A") {
				this._changeInputFieldsForRack();
				return;
			}
			var aRows = this.getModel("worklistViewModel").getData().rows;
			var aSizes = this.getModel("worklistViewModel").getProperty("/sizes");
			var aWeights = this.getModel("worklistViewModel").getProperty("/weight");
			var sFlag;

			//KoliEbat Formatı 

			if (this.getModel("headerModel").getData().KoliEbat) {
				for (var y = 0; y < aRows.length; y++) {
					var KoliEbat = aRows[y].KoliEbat;
					if (KoliEbat.split("X").length !== 3) {
						MessageBox.error(this.i18nBundle.getText("koliebatformat"));

					}

				}
			}
			for (var j = 0; j < aRows.length; j++) {
				sFlag = "";
				aRows[j].KoliIciAdet = 0;
				var fResultTotal = 0;
				for (var m = 0; m < aSizes.length; m++) {
					if (aRows[j]["dynamicColumn-" + aSizes[m]] !== undefined && aRows[j]["dynamicColumn-" + aSizes[m]] !== "") {
						aRows[j].KoliIciAdet += parseInt(aRows[j]["dynamicColumn-" + aSizes[m]], 10);
						aRows[j]["total-" + aSizes[m]] = parseInt(aRows[j]["dynamicColumn-" + aSizes[m]], 10) * parseInt(aRows[j].KoliAdedi, 10);

						aRows[j].FshScStxt = aSizes[m];
						sFlag = "X";
					} else {
						aRows[j]["total-" + aSizes[m]] = "";
					}
				}
				for (var n = 0; n < aWeights.length; n++) {
					if (!isNaN(aWeights[n][aWeights[n].Name] * parseInt(aRows[j]["dynamicColumn-" + aWeights[n].Name], 10)))
						fResultTotal += aWeights[n][aWeights[n].Name] * parseInt(aRows[j]["dynamicColumn-" + aWeights[n].Name], 10);
				}
				aRows[j].BirimAgirlik = (isNaN(parseFloat((fResultTotal / aRows[j].KoliIciAdet).toFixed(2)))) ? "" : parseFloat((fResultTotal /
					aRows[j].KoliIciAdet).toFixed(2));

				if (!sFlag) {
					aRows[j].KoliIciAdet = "";
					aRows[j].BirimAgirlik = "";
				}
			}
			var cEmptyBoxValue = this.getModel("headerModel").getData().BosKoliAgirligi;
			for (var i = 0; i < aRows.length; i++) {
				aRows[i]["ToplamAdet"] = ((isNaN(parseInt(aRows[i].KoliIciAdet, 10) * parseInt(aRows[i].KoliAdedi, 10))) ? "" : (parseInt(aRows[
							i]
						.KoliIciAdet, 10) *
					parseInt(aRows[i].KoliAdedi, 10)).toString());

				var cBosKoliTotal = (parseInt(cEmptyBoxValue, 10) * parseInt(aRows[i].KoliAdedi, 10));

				aRows[i]["ToplamAgirlik"] = ((isNaN((parseInt(aRows[i].ToplamAdet, 10) * parseFloat(aRows[i].BirimAgirlik, 10) + cBosKoliTotal) /
						1000)) ?
					"" : (((parseInt(aRows[
								i]
							.ToplamAdet, 10) *
						parseFloat(aRows[i].BirimAgirlik, 10)) + cBosKoliTotal) / 1000).toString());

				aRows[i]["ToplamAgirlik"] = isNaN(parseFloat(aRows[i]["ToplamAgirlik"])) ? "" : parseFloat(aRows[i]["ToplamAgirlik"]).toFixed(2);
			}
			this.getModel("worklistViewModel").setProperty("/rows", aRows);

			this._calculateTotalValue();
			if (oViewModel.getProperty("/packageType") === "K") {
				this._calculateBoxNumber();
			}

		},
		_onOrderDetailMatched: function (oEvent) {
			//object Matched
			this.resetMessageModel();
			this._orderId = oEvent.getParameter("arguments").orderId;
			this.getModel("viewModel").setProperty("/footerMode", "orderDetail");
			this.getModel("viewModel").setProperty("/orderId", ((this._orderId) ? this._orderId : ""));

			if (!this._orderId) {
				this.getModel("viewModel").setProperty("/orderStatus", "");
			}

			this._getDetailData();
		},
		_mandatoryFields: function () {
			var oHeaderModel = this.getModel("headerModel"),
				oViewModel = this.getModel("viewModel");
			var aWeight = this.getModel("worklistViewModel").getProperty("/weight");
			//mandatory fields
			if (aWeight.length === 0) {
				MessageBox.error(this.i18nBundle.getText("mandatoryWeight"));
				return false;
			}
			if (!oHeaderModel.getProperty("/ToplamAgirlik")) {
				MessageBox.error(this.i18nBundle.getText("mandatoryToplamAgirlik"));
				return false;
			}
			let aFieldsRack = ["/CekmeTarihi", "/YuklemeTarihi", "/MetreAski", "/AskiGenisligi", "/AskiAgirligi", "/YikamaTalimati"],
				aFieldsBox = ["/CekmeTarihi", "/YuklemeTarihi", "/BosKoliAgirligi", "/KoliEbat", "/YikamaTalimati"];

			if (oViewModel.getProperty("/packageType") === "A") {
				for (let i = 0; i < aFieldsRack.length; i++) {
					if (!oHeaderModel.getProperty(aFieldsRack[i])) {
						MessageBox.error(this.i18nBundle.getText("mandatoryFields"));
						return false;
					}
				}
			} else {
				for (let i = 0; i < aFieldsBox.length; i++) {
					if (!oHeaderModel.getProperty(aFieldsBox[i])) {
						MessageBox.error(this.i18nBundle.getText("mandatoryFields"));
						return false;
					}
				}
			}
			return true;
		},
		_getLazyMessagePopover: function () {
			if (!this._oMessagePopover) {
				this._oMessagePopover = sap.ui.xmlfragment(this.getView().getId(), "com.sun.sd.packinglist.view.fragment.dialog.MessagePopover",
					this);
				this.getView().addDependent(this._oMessagePopover);
			}
			return this._oMessagePopover;
		},
		_createDelivery: function (oDeepEntity, sType) {
			//createDelivery
			var oParams = {};
			var oSendData = this.getModel("headerModel").getData();
			var that = this;

			oDeepEntity.OrderNo = oSendData.OrderNo;
			oDeepEntity.VbelnVl = oSendData.VbelnVl;
			oDeepEntity.BelgeTarihi = (oSendData.BelgeTarihi ? oSendData.BelgeTarihi : null);
			oDeepEntity.CekmeTarihi = (oSendData.CekmeTarihi ? oSendData.CekmeTarihi : null);
			oDeepEntity.YuklemeTarihi = (oSendData.YuklemeTarihi ? oSendData.YuklemeTarihi : null);

			// oDeepEntity.CekmeTarihi = oSendData.CekmeTarihi;
			// oDeepEntity.YuklemeTarihi = oSendData.YuklemeTarihi;
			oDeepEntity.Werks = oSendData.Werks;
			oDeepEntity.Uretici = oSendData.Uretici;
			oDeepEntity.UreticiAdresi = oSendData.UreticiAdresi;
			oDeepEntity.Kunnr = oSendData.Kunnr;
			oDeepEntity.Name1 = oSendData.Name1;
			oDeepEntity.CekmeTuru = oSendData.CekmeTuru;
			oDeepEntity.BelgeDurumu = sType;
			oDeepEntity.Varyant = oSendData.Varyant;
			oDeepEntity.Model = oSendData.Model;
			oDeepEntity.ModelAdi = oSendData.ModelAdi;
			oDeepEntity.GiysiGrubu = oSendData.GiysiGrubu;
			oDeepEntity.KumasTipi = oSendData.KumasTipi;
			oDeepEntity.UrunCinsi = oSendData.UrunCinsi;
			oDeepEntity.YikamaTalimati = oSendData.YikamaTalimati;
			oDeepEntity.BaslangicKoliNo = oSendData.BaslangicKoliNo;
			oDeepEntity.UrunCinsi = oSendData.UrunCinsi;
			oDeepEntity.AltSiparisDetay = oSendData.AltSiparisDetay;
			oDeepEntity.PaketlemeSekli = oSendData.PaketlemeSekli;
			oDeepEntity.PaketlemeSekliTanim = oSendData.PaketlemeSekliTanim;
			oDeepEntity.KoliSayisi = oSendData.KoliSayisi.toString();
			oDeepEntity.BosKoliAgirligi = (oSendData.BosKoliAgirligi.toString()) ? oSendData.BosKoliAgirligi.toString() : "0";
			oDeepEntity.KoliEbat = oSendData.KoliEbat;
			oDeepEntity.ToplamAskiSayisi = oSendData.ToplamAskiSayisi.toString();
			oDeepEntity.ToplamAgirlikKg = (oSendData.ToplamAgirlik.toString()) ? oSendData.ToplamAgirlik.toString() : "0";
			oDeepEntity.MetreAski = oSendData.MetreAski.toString();
			oDeepEntity.AskiGenisligi = (oSendData.AskiGenisligi.toString()) ? oSendData.AskiGenisligi.toString() : "0";
			oDeepEntity.AskiAgirligi = (oSendData.AskiAgirligi.toString()) ? oSendData.AskiAgirligi.toString() : "0";
			oDeepEntity.AskisizToplamAgirlikKg = (oSendData.AskisizToplamAgirlikKg.toString()) ? oSendData.AskisizToplamAgirlikKg.toString() :
				"0";
			oDeepEntity.MandalliAski = oSendData.MandalliAski;
			oDeepEntity.DropLoopYok = oSendData.DropLoopYok;
			oDeepEntity.IkiliDropLoop = oSendData.IkiliDropLoop;
			oDeepEntity.UcluDropLoop = oSendData.UcluDropLoop;

			sap.ui.core.BusyIndicator.show(0);

			oParams = {
				success: function (oData) {
					sap.ui.core.BusyIndicator.hide();
					//will be edited
					var sMessage;
					if (!that._orderId) {
						sMessage = that.i18nBundle.getText("deliveryCreated", [oData.VbelnVl]);
					} else {
						sMessage = that.i18nBundle.getText("deliveryChanged", [oData.VbelnVl]);
					}
					//MessageBox.success(sMessage);
					MessageBox.success(sMessage, {
						actions: [sap.m.MessageBox.Action.CLOSE],
						onClose: function (sAction) {
							that.getRouter().navTo("OrderList");
						}
					});

					that._clearAllFields();
				}.bind(that),
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
				}
			};

			this._oModel.create("/CreateDeliverySet", oDeepEntity, oParams);

		},
		_clearAllFields: function () {
			//clear
			this.getModel("worklistViewModel").setProperty("/rows", []);
			this.getModel("headerModel").setProperty("/ToplamAdet", "");
			this.getModel("headerModel").setProperty("/ToplamAgirlik", "");
			//this._getDetailData();
			//this._addOneLine();
		},
		_changeDelivery: function (sType) {
			//change delivery
			var bStatus = this._mandatoryFields();
			if (!bStatus) {
				return;
			}
			var aDefaultData = this._oViewModel.getProperty("/defaultData");
			var aSizes = this._oViewModel.getProperty("/sizes");
			var aRows = this._oViewModel.getProperty("/rows");
			var sFlag, oBoxLine, oRackLine;
			var oDeepEntity = {};
			var oViewModel = this.getModel("viewModel");
			oDeepEntity.to_BoxDetail = [];
			oDeepEntity.to_DefaultSize = [];
			oDeepEntity.to_RackDetail = [];
			var oTotalSizes = this._oViewModel.getProperty("/rowsDefault")[this._oViewModel.getProperty("/rowsDefault").length - 2];
			for (var i = 0; i < aSizes.length; i++) {
				var cCurrentVal = oTotalSizes["dynamicColumnDefault-" + aSizes[i]];
				for (var j = 0; j < aDefaultData.length; j++) {
					var cCurrentAcikMiktar = parseInt(aDefaultData[j].AcikMiktar, 10) + parseInt(aDefaultData[j].TeslimatMiktari, 10);
					if (aDefaultData[j].FshScStxt === aSizes[i]) {
						if (cCurrentVal > cCurrentAcikMiktar && aDefaultData[j].BedeninSonSatiri === false) {
							aDefaultData[j].DegisenTeslimatMiktari = cCurrentAcikMiktar.toString();
							cCurrentVal = cCurrentVal - cCurrentAcikMiktar;
						} else {
							aDefaultData[j].DegisenTeslimatMiktari = cCurrentVal.toString();
							break;
						}
					}
				}
			}
			if (oViewModel.getProperty("/packageType") === "K") {
				for (let m = 0; m < aRows.length; m++) {
					var cBoxIndex = (m + 1).toString();
					var aBoxs = aRows[m].KoliNo.split("-");
					for (var n = 0; n < aBoxs.length; n++) {
						for (var y = 0; y < aSizes.length; y++) {
							oBoxLine = {};
							oBoxLine.Vbeln = "";
							oBoxLine.Posnr = "";
							oBoxLine.FshScStxt = aSizes[y];
							oBoxLine.KaleminKoliEbati = aRows[m].KoliEbat;
							oBoxLine.KoliNo = aBoxs[n];
							oBoxLine.KoliIciAdedi = (aRows[m]["dynamicColumn-" + aSizes[y]]) ? (aRows[m]["dynamicColumn-" + aSizes[y]]).toString() : "";
							oBoxLine.Matnr = aDefaultData.find(item => item.FshScStxt === oBoxLine.FshScStxt).Matnr;
							//aRows[m].KoliIciAdet;
							oBoxLine.KoliAdedi = aRows[m].KoliAdedi;
							oBoxLine.ToplamAdet = aRows[m].ToplamAdet;
							//oBoxLine.BirimAgirlikGram = aRows[m].BirimAgirlik;
							oBoxLine.BirimAgirlikGram = aRows[m].BirimAgirlik.toString();
							oBoxLine.ToplamAgirlikKg = aRows[m].ToplamAgirlik;
							oBoxLine.EkranSirasi = cBoxIndex;
							oDeepEntity.to_BoxDetail.push(oBoxLine);
						}
					}
				}
			} else {
				for (let m = 0; m < aRows.length; m++) {
					oRackLine = {};
					oRackLine.Vbeln = "";
					oRackLine.Posnr = "";
					oRackLine.FshScStxt = aRows[m].FshScStxt;
					oRackLine.Matnr = aDefaultData.find(item => item.FshScStxt === oRackLine.FshScStxt).Matnr;
					oRackLine.AskiSayisi = aRows[m].ToplamAdet.toString();
					oRackLine.AskiliBirimBoy = aRows[m].BirimBoy.toString();
					oRackLine.BirimAgirlik = aRows[m].BirimAgirlik.toString();
					oRackLine.EkranSirasi = (m + 1).toString();
					oDeepEntity.to_RackDetail.push(oRackLine);
				}
			}

			// for (var m = 0; m < aRows.length; m++) {
			// 	var cBoxIndex = (m + 1).toString();
			// 	var aBoxs = aRows[m].KoliNo.split("-");
			// 	for (var n = 0; n < aBoxs.length; n++) {
			// 		for (var y = 0; y < aSizes.length; y++) {
			// 			oBoxLine = {};
			// 			oBoxLine.Vbeln = "";
			// 			oBoxLine.Posnr = "";
			// 			oBoxLine.FshScStxt = aSizes[y];
			// 			oBoxLine.KoliNo = aBoxs[n];
			// 			oBoxLine.KoliIciAdedi = (aRows[m]["dynamicColumn-" + aSizes[y]]).toString();
			// 			oBoxLine.Matnr = aDefaultData.find(item => item.FshScStxt === oBoxLine.FshScStxt).Matnr;
			// 			//aRows[m].KoliIciAdet;
			// 			oBoxLine.KoliAdedi = aRows[m].KoliAdedi;
			// 			oBoxLine.ToplamAdet = aRows[m].ToplamAdet;
			// 			//oBoxLine.BirimAgirlikGram = aRows[m].BirimAgirlik;
			// 			oBoxLine.BirimAgirlikGram = aRows[m].BirimAgirlik.toString();
			// 			oBoxLine.ToplamAgirlikKg = aRows[m].ToplamAgirlik;
			// 			oBoxLine.EkranSirasi = cBoxIndex;
			// 			oDeepEntity.to_BoxDetail.push(oBoxLine);
			// 		}
			// 	}

			// }
			oDeepEntity.to_DefaultSize = aDefaultData;
			oDeepEntity.to_UnitWeight = [];
			var aWeight = this._oViewModel.getProperty("/weight");
			var oWeight = {};
			for (var s = 0; s < aWeight.length; s++) {
				oWeight.VbelnVl = ((this._orderId) ? this._orderId : "");
				oWeight.FshScStxt = aWeight[s].Name;
				oWeight.BirimAgirlik = aWeight[s][aWeight[s].Name].toString();
				oWeight.BirimBoy = ((aWeight[s]["Boy"]) ? aWeight[s]["Boy"].toString() : "0"); //Askı
				oDeepEntity.to_UnitWeight.push(oWeight);
				oWeight = {};
			}
			this._createDelivery(oDeepEntity, sType);
		},
		_prepareDeliveryData: function (sType) {
			var bStatus = this._mandatoryFields();
			if (sType !== "01") {
				if (!bStatus) {
					return;
				}
			}

			var aDefaultData = this._oViewModel.getProperty("/defaultData");
			var aSizes = this._oViewModel.getProperty("/sizes");
			var aRows = this._oViewModel.getProperty("/rows");
			var oViewModel = this.getModel("viewModel");
			var sFlag, oBoxLine, oRackLine;
			var oDeepEntity = {};
			oDeepEntity.to_BoxDetail = [];
			oDeepEntity.to_DefaultSize = [];
			oDeepEntity.to_RackDetail = [];

			var oTotalSizes = this._oViewModel.getProperty("/rowsDefault")[this._oViewModel.getProperty("/rowsDefault").length - 2];
			for (var i = 0; i < aSizes.length; i++) {
				var cCurrentVal = oTotalSizes["dynamicColumnDefault-" + aSizes[i]];
				for (var j = 0; j < aDefaultData.length; j++) {
					var cCurrentAcikMiktar = parseInt(aDefaultData[j].AcikMiktar, 10);
					if (aDefaultData[j].FshScStxt === aSizes[i]) {
						if (cCurrentVal > cCurrentAcikMiktar && aDefaultData[j].BedeninSonSatiri === false) {
							aDefaultData[j].TeslimatMiktari = cCurrentAcikMiktar.toString();
							cCurrentVal = cCurrentVal - cCurrentAcikMiktar;
						} else {
							aDefaultData[j].TeslimatMiktari = cCurrentVal.toString();
							break;
						}
					}
				}
			}

			if (oViewModel.getProperty("/packageType") === "K") {
				//koli adedi 0 olamaz

				for (var y = 0; y < aRows.length; y++) {
					if (parseInt(aRows[y].KoliAdedi) === 0) {
						MessageBox.error(this.i18nBundle.getText("KoliAdedi"));
						return;
					}
				}

				for (let m = 0; m < aRows.length; m++) {
					var cBoxIndex = (m + 1).toString();
					var aBoxs = aRows[m].KoliNo.split("-");
					for (var n = 0; n < aBoxs.length; n++) {
						for (var y = 0; y < aSizes.length; y++) {
							oBoxLine = {};
							oBoxLine.Vbeln = "";
							oBoxLine.Posnr = "";
							oBoxLine.FshScStxt = aSizes[y];
							oBoxLine.KoliNo = aBoxs[n];
							oBoxLine.KaleminKoliEbati = aRows[m].KoliEbat;
							oBoxLine.KoliIciAdedi = (aRows[m]["dynamicColumn-" + aSizes[y]]) ? (aRows[m]["dynamicColumn-" + aSizes[y]]).toString() : "";
							oBoxLine.Matnr = aDefaultData.find(item => item.FshScStxt === oBoxLine.FshScStxt).Matnr;
							//aRows[m].KoliIciAdet;
							oBoxLine.KoliAdedi = aRows[m].KoliAdedi;
							oBoxLine.ToplamAdet = aRows[m].ToplamAdet;
							//oBoxLine.BirimAgirlikGram = aRows[m].BirimAgirlik;
							oBoxLine.BirimAgirlikGram = aRows[m].BirimAgirlik.toString();
							oBoxLine.ToplamAgirlikKg = aRows[m].ToplamAgirlik;
							oBoxLine.EkranSirasi = cBoxIndex;
							oDeepEntity.to_BoxDetail.push(oBoxLine);
						}
					}
				}
			} else {
				for (let m = 0; m < aRows.length; m++) {
					oRackLine = {};
					oRackLine.Vbeln = "";
					oRackLine.Posnr = "";
					oRackLine.FshScStxt = aRows[m].FshScStxt;
					oRackLine.Matnr = aDefaultData.find(item => item.FshScStxt === oRackLine.FshScStxt).Matnr;
					oRackLine.AskiSayisi = aRows[m].ToplamAdet.toString();
					oRackLine.AskiliBirimBoy = aRows[m].BirimBoy.toString();
					oRackLine.BirimAgirlik = aRows[m].BirimAgirlik.toString();
					oRackLine.EkranSirasi = (m + 1).toString();
					oDeepEntity.to_RackDetail.push(oRackLine);
				}
			}

			oDeepEntity.to_DefaultSize = aDefaultData;
			oDeepEntity.to_UnitWeight = [];
			var aWeight = this._oViewModel.getProperty("/weight");
			var oWeight = {};
			for (var s = 0; s < aWeight.length; s++) {
				oWeight.VbelnVl = ((this._orderId) ? this._orderId : "");
				oWeight.FshScStxt = aWeight[s].Name;
				oWeight.BirimAgirlik = aWeight[s][aWeight[s].Name].toString();
				oWeight.BirimBoy = ((aWeight[s]["Boy"]) ? aWeight[s]["Boy"].toString() : "0");
				oDeepEntity.to_UnitWeight.push(oWeight);
				oWeight = {};
			}
			this._createDelivery(oDeepEntity, sType);

		},
		_addOneLine: function () {
			var aData = this._oViewModel.getData();
			var aRows = aData.rows;
			var aColumns = aData.columns;
			var oRow = {};

			for (var i = 0; i < aColumns.length; i++) {

				oRow[aColumns[i].valuePath] = "";
				//oRow["KoliIciAdet"] = "";
			}
			oRow["OrderNo"] = this.getModel("headerModel").getData().OrderNo;
			oRow["KoliEbat"] = this.getModel("headerModel").getData().KoliEbat;
			aRows.push(oRow);

			this.getModel("worklistViewModel").setProperty("/rows", aRows);
		},
		_calculateBoxNumber: function () {
			var aRows = this.getModel("worklistViewModel").getData().rows;
			if (this.getModel("headerModel").getData().BaslangicKoliNo === "") {
				this.getModel("headerModel").getData().BaslangicKoliNo = 0;
			}
			var iCount = parseInt(this.getModel("headerModel").getData().BaslangicKoliNo);
			if (parseInt(this.getModel("headerModel").getData().BaslangicKoliNo) === 0) {
				iCount = parseInt(this.getModel("headerModel").getData().BaslangicKoliNo) + 1;
			}
			var sKoliNo = "";
			for (var i = 0; i < aRows.length; i++) {
				sKoliNo = "";
				for (var j = 0; j < parseInt(aRows[i].KoliAdedi, 10); j++) {
					sKoliNo += iCount.toString() + "-";
					iCount++;
				}
				aRows[i].KoliNo = sKoliNo.substring(0, sKoliNo.length - 1);

			}
			if (parseInt(this.getModel("headerModel").getData().BaslangicKoliNo) === 0) {
				this.getModel("headerModel").setProperty("/KoliSayisi", iCount - this.getModel("headerModel").getData().BaslangicKoliNo - 1);
				this.getModel("worklistViewModel").setProperty("/rows", aRows);
			} else {
				this.getModel("headerModel").setProperty("/KoliSayisi", iCount - this.getModel("headerModel").getData().BaslangicKoliNo);
				this.getModel("worklistViewModel").setProperty("/rows", aRows);
			}

		},
		_calculateTotalValue: function () {
			// TODO: 
			var aRowsDefault = this.getModel("worklistViewModel").getProperty("/rowsDefault");
			var aSizes = this.getModel("worklistViewModel").getProperty("/sizes");
			var aRows = this._oViewModel.getData().rows;
			var cToplamAdet = aRows.map(
				item =>
				parseFloat(item.ToplamAdet, 10)).reduce((total, value) => total + value, 0);
			var cToplamAgirlik = aRows.map(
				item =>
				parseFloat(item.ToplamAgirlik, 10)).reduce((total, value) => total + value, 0);
			if (isNaN(cToplamAdet) || cToplamAdet === 0) {
				cToplamAdet = "";
			}
			if (isNaN(cToplamAgirlik) || cToplamAgirlik === 0) {
				cToplamAgirlik = "";
			}

			for (var i = 0; i < aSizes.length; i++) {

				aRowsDefault[aRowsDefault.length - 2]["dynamicColumnDefault-" + aSizes[i]] = aRows.filter(item => item["total-" +
						aSizes[i]] !==
					"" && item["total-" + aSizes[i]] !== undefined).map(item =>
					parseInt(item["total-" + aSizes[i]], 10)).reduce((total, value) => total + value, 0);

				aRowsDefault[aRowsDefault.length - 1]["dynamicColumnDefault-" + aSizes[i]] = parseInt(aRowsDefault[aRowsDefault.length - 2][
						"dynamicColumnDefault-" + aSizes[i]
					], 10) - parseInt(aRowsDefault[aRowsDefault.length - 5]["dynamicColumnDefault-" + aSizes[i]], 10) +
					parseInt(aRowsDefault[aRowsDefault.length - 4]["dynamicColumnDefault-" + aSizes[i]], 10);

				if (isNaN(aRowsDefault[aRowsDefault.length - 1]["dynamicColumnDefault-" + aSizes[i]])) {
					aRowsDefault[aRowsDefault.length - 1]["dynamicColumnDefault-" + aSizes[i]] = "";
				}

			}

			aRowsDefault[aRowsDefault.length - 2].SiparisAdet = cToplamAdet;
			aRowsDefault[aRowsDefault.length - 1].SiparisAdet = parseInt(aRowsDefault[aRowsDefault.length - 4].SiparisAdet, 10) - parseInt(
					aRowsDefault[aRowsDefault.length - 3].SiparisAdet, 10) - parseInt(aRowsDefault[aRowsDefault.length - 5].SiparisAdet, 10) +
				parseInt(aRowsDefault[aRowsDefault.length - 2].SiparisAdet, 10);

			if (isNaN(aRowsDefault[aRowsDefault.length - 1].SiparisAdet)) {
				aRowsDefault[aRowsDefault.length - 1].SiparisAdet = "";
			}

			this.getModel("headerModel").setProperty("/ToplamAdet", cToplamAdet);
			this.getModel("headerModel").setProperty("/ToplamAgirlik",
				(cToplamAgirlik ? parseFloat(cToplamAgirlik.toFixed(3)) : cToplamAgirlik));
			this.getModel("worklistViewModel").setProperty("/rowsDefault", aRowsDefault);

		},
		_sizeEntryTableColumnFactory: function (sId, oContext) {
			//dynamic table
			return new sap.ui.table.Column({
				label: new sap.m.Label({
					text: oContext.getProperty("label"),
					design: sap.m.LabelDesign.Bold
				}),

				template: new sap.m.Input({
					value: {
						model: "worklistViewModel",
						path: oContext.getProperty("valuePath")
					},
					editable: oContext.getProperty("editable"),
					change: this._changeInputFields.bind(this),
					type: oContext.getProperty("type")
				}),
				sortProperty: oContext.getProperty("valuePath"),
				filterProperty: oContext.getProperty("valuePath"),
				autoResizable: true,
				minWidth: 192,
				hAlign: sap.ui.core.TextAlign.Center
			});
		},
		_sizeDefaultTableColumnFactory: function (sId, oContext) {
			// dynamic table 
			return new sap.ui.table.Column({
				label: new sap.m.Label({
					text: oContext.getProperty("label"),
					design: sap.m.LabelDesign.Bold
				}),

				template: new sap.m.Input({
					value: {
						model: "worklistViewModel",
						path: oContext.getProperty("valuePath")
					},
					editable: oContext.getProperty("editable"),
					type: oContext.getProperty("type")
				}),
				autoResizable: true,
				minWidth: 192,
				hAlign: sap.ui.core.TextAlign.Center
			});

		},
		_prepareRackData: function (oData) {
			debugger;
			let cEkranSirasi = 1,
				oLine = {},
				aRacks = [],
				oHeaderModel = this.getModel("headerModel");
			for (let i = 0; i < oData.length; i++) {
				oLine = {};
				oLine["dynamicColumn-" + oData[i].FshScStxt] = parseInt(oData[i].AskiSayisi, 10);
				oLine.OrderNo = oHeaderModel.getProperty("/OrderNo");
				aRacks.push(oLine);

			}
			this.getModel("worklistViewModel").setProperty("/rows", aRacks);
		},
		_prepareBoxData: function (oData) {
			debugger;
			var cEkranSirasi = 1;
			var cKoliAdedi = 0;
			var aBoxes = [];
			var oLine = {};
			var cCount = 1;
			var oHeaderModel = this.getModel("headerModel");
			var oViewModel = this.getModel("viewModel");

			/*			BirimAgirlik: 130
			FshScStxt: "L"
			KoliAdedi: "3"
			KoliIciAdet: 25
			KoliNo: ""
			OrderNo: "ORDERA"
			ToplamAdet: "75"
			ToplamAgirlik: "10.2"
			dynamicColumn-L: "15"
			dynamicColumn-M: "10"*/
			//	parseInt(aRows[j]["dynamicColumn-" + aSizes[m]], 10);
			for (let i = 0; i < oData.length; i++) {
				if (cEkranSirasi < parseInt(oData[i].EkranSirasi, 10)) {
					oLine.KoliIciAdet = "";
					aBoxes.push(oLine);
					oLine = {};
				}
				cEkranSirasi = parseInt(oData[i].EkranSirasi, 10);
				oLine["dynamicColumn-" + oData[i].FshScStxt] = parseInt(oData[i].KoliIciAdedi, 10);
				//oLine.KoliAdedi = cCount;
				oLine.KoliAdedi = parseInt(oData[i].KoliAdedi, 10).toString();
				oLine.OrderNo = oHeaderModel.getProperty("/OrderNo");
				oLine.KoliEbat = oHeaderModel.getProperty("/KoliEbat");
				cCount++;
			}
			aBoxes.push(oLine);
			this.getModel("worklistViewModel").setProperty("/rows", aBoxes);

			//this._changeInputFields();
			//askı
			if (oViewModel.getProperty("/packageType") === "K") {
				this._calculateBoxNumber();
			}

		},
		_prepareUnitWeight: function (oData) {
			debugger;
			let oWeight = {},
				aWeight = [],
				//oDialog = this.byId("dialogAddUnitWeight"),
				oLabel, oInput, oDialog, oText,
				oViewModel = this.getModel("viewModel");
			for (let i = 0; i < oData.length; i++) {
				oWeight.Name = oData[i].FshScStxt;
				oWeight[oWeight.Name] = parseInt(oData[i].BirimAgirlik, 10);
				oWeight.Boy = ((oData[i].BirimBoy) ? parseInt(oData[i].BirimBoy, 10) : ""); //Askı
				aWeight.push(oWeight);
				oWeight = {};
			}
			this.getModel("worklistViewModel").setProperty("/weight", aWeight);
			if (!oDialog) {
				//Create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(this.getView().getId(), "com.sun.sd.packinglist.view.fragment.main.AddUnitWeight", this);
				this.getView().addDependent(oDialog);
				jQuery.sap.syncStyleClass(this.getOwnerComponent().getContentDensityClass(), this.getView(), oDialog);
				if (this._orderId) {
					if (oViewModel.getProperty("/packageType") === "A") {
						oLabel = new sap.m.Label({
							text: "",
							design: sap.m.LabelDesign.Bold
						});
						oDialog.getAggregation("content")[0].addContent(oLabel);
						oText = new sap.m.Text({
							text: "Boy(cm)",
							textAlign: "Center"

						});
						oDialog.getAggregation("content")[0].addContent(oText);
						oText = new sap.m.Text({
							text: "Gramaj",
							textAlign: "Center"
						});
						oDialog.getAggregation("content")[0].addContent(oText);
						for (let j = 0; j < aWeight.length; j++) {
							oLabel = new sap.m.Label({
								text: aWeight[j].Name,
								design: sap.m.LabelDesign.Bold
							});
							oDialog.getAggregation("content")[0].addContent(oLabel);
							oInput = new sap.m.Input({
								value: aWeight[j]["Boy"],
								type: "Number"
							});

							oDialog.getAggregation("content")[0].addContent(oInput);
							oInput = new sap.m.Input({
								value: aWeight[j][aWeight[j].Name],
								type: "Number"

							});
							oDialog.getAggregation("content")[0].addContent(oInput);

						}
					} else {
						for (let j = 0; j < aWeight.length; j++) {

							oLabel = new sap.m.Label({
								text: aWeight[j].Name,
								design: sap.m.LabelDesign.Bold
							});
							oDialog.getAggregation("content")[0].addContent(oLabel);
							oInput = new sap.m.Input({
								value: aWeight[j][aWeight[j].Name],
								type: "Number"

							});
							oDialog.getAggregation("content")[0].addContent(oInput);
						}
					}

					this._changeInputFields();
				}
			}

		},
		_prepareStaticColumnsForRack: function () {
			var aColumns = [];
			aColumns.push({
				label: "Order no",
				valuePath: "OrderNo",
				editable: false
			});
			aColumns.push({
				label: "Toplam adet",
				valuePath: "ToplamAdet",
				editable: false
			});
			aColumns.push({
				label: "Askılı birim boy(CM)",
				valuePath: "BirimBoy",
				editable: false
			});
			aColumns.push({
				label: "Askılı birim ağırlık(GR)",
				valuePath: "BirimAgirlik",
				editable: false
			});
			aColumns.push({
				label: "Toplam ağırlık(KG)",
				valuePath: "ToplamAgirlik",
				editable: false
			});
			return aColumns;
		},
		_prepareStaticColumnsForPack: function () {
			var aColumns = [];
			aColumns.push({
				label: "Koli no",
				valuePath: "KoliNo",
				editable: false
			});
			aColumns.push({
				label: "Order no",
				valuePath: "OrderNo",
				editable: false
			});
			aColumns.push({
				label: "Koli Ebat",
				valuePath: "KoliEbat",
				editable: "{viewModel>/editMode}"
			});

			aColumns.push({
				label: "Koli içi adet",
				valuePath: "KoliIciAdet",
				//valuePath: "dynamicColumn-M",
				editable: false
			});
			aColumns.push({
				label: "Koli adedi",
				valuePath: "KoliAdedi",
				type: "Number",
				editable: "{viewModel>/editMode}"

			});
			aColumns.push({
				label: "Toplam adet",
				valuePath: "ToplamAdet",
				editable: false
			});
			aColumns.push({
				label: "Birim ağırlık(GR)",
				valuePath: "BirimAgirlik",
				editable: false
			});
			aColumns.push({
				label: "Toplam ağırlık(KG)",
				valuePath: "ToplamAgirlik",
				editable: false
			});
			return aColumns;
		},
		_getDetailData: function () {
			var oSide = {},
				oDeepEntity = {},
				oParams = {},
				that = this,
				oViewModel = this.getModel("viewModel"),
				aSdDocument = oViewModel.getProperty("/to_SdDocument");

			oDeepEntity.Flag = "X"; //dummy
			oDeepEntity.IvLgort = (aSdDocument.length > 0 ? aSdDocument.find(item => item.Vbeln !== "").Lgort : "");
			oDeepEntity.IvCekmeTuru = oViewModel.getProperty("/cekmeTuru");
			oDeepEntity.IvTeslimat = ((this._orderId) ? this._orderId : "");
			oDeepEntity.IvAltSipDetay = oViewModel.getProperty("/subOrderDetail");
			oDeepEntity.IvPaketlemeSekli = oViewModel.getProperty("/packageType");
			oDeepEntity.to_HeaderDetail = [];
			oDeepEntity.to_SdDocument = [];
			oDeepEntity.to_DifferentSize = [];
			oDeepEntity.to_DefaultSize = [];
			oDeepEntity.to_BoxDetail = [];
			oDeepEntity.to_OrderItem = [];
			oDeepEntity.to_SdDocument = oViewModel.getProperty("/to_SdDocument");
			oDeepEntity.to_UnitWeight = [];
			oDeepEntity.to_RackDetail = [];

			sap.ui.core.BusyIndicator.show(0);
			oParams = {
				success: function (oSuccess) {

					sap.ui.core.BusyIndicator.hide();

					//will be edited
					var oHeaderDetail = oSuccess.to_HeaderDetail.results[0];
					//comm
					oHeaderDetail.KoliSayisi = parseInt(oHeaderDetail.KoliSayisi, 10);
					oHeaderDetail.BosKoliAgirligi = parseInt(oHeaderDetail.BosKoliAgirligi, 10);
					oHeaderDetail.MetreAski = parseInt(oHeaderDetail.MetreAski, 10);
					oHeaderDetail.AskiAgirligi = parseInt(oHeaderDetail.AskiAgirligi, 10);
					oHeaderDetail.AskiGenisligi = parseInt(oHeaderDetail.AskiGenisligi, 10);
					oHeaderDetail.DropLoopYok = ((this._orderId) ? oHeaderDetail.DropLoopYok : true);
					oHeaderDetail.KoliSayisi = ((oHeaderDetail.KoliSayisi === 0) ? "" : oHeaderDetail.KoliSayisi);
					oHeaderDetail.BosKoliAgirligi = ((oHeaderDetail.BosKoliAgirligi === 0) ? "" : oHeaderDetail.BosKoliAgirligi);
					oHeaderDetail.MetreAski = ((oHeaderDetail.MetreAski === 0) ? "" : oHeaderDetail.MetreAski);
					oHeaderDetail.AskiAgirligi = ((oHeaderDetail.AskiAgirligi === 0) ? "" : oHeaderDetail.AskiAgirligi);
					oHeaderDetail.AskiGenisligi = ((oHeaderDetail.AskiGenisligi === 0) ? "" : oHeaderDetail.AskiGenisligi);

					//	var c = ((a < b) ? 'minor' : 'major');

					oHeaderDetail.ToplamAskiSayisi = "";
					oHeaderDetail.AskisizToplamAgirlikKg = "";

					that.getModel("headerModel").setData(oHeaderDetail);
					oViewModel.setProperty("/packageType", oHeaderDetail.PaketlemeSekli);
					//	that._prepareBoxData(oSuccess.to_BoxDetail.results);
					var aSizes = [...new Set(oSuccess.to_DifferentSize.results.map(oSize => oSize.Size))];
					var aOrderItem = oSuccess.to_OrderItem.results;
					var aData = that._oViewModel.getData();
					var aColumns = [];
					var aColumnsDefault = [];
					var oContext = this.getModel("viewModel");
					// static columns
					var oRow = {};
					var aRows = [];

					if (oViewModel.getProperty("/packageType") === "A") {
						aColumns = this._prepareStaticColumnsForRack();
						oRow["OrderNo"] = oHeaderDetail.OrderNo;
						aRows.push(oRow);
					} else {
						aColumns = this._prepareStaticColumnsForPack();
						oRow["OrderNo"] = oHeaderDetail.OrderNo;
						oRow["KoliEbat"] = oHeaderDetail.KoliEbat;
						oRow["KoliIciAdet"] = "";
						oRow["KoliAdedi"] = "";
						oRow["KoliNo"] =
							"";
						aRows.push(oRow);
					}

					// dynamic columns
					for (var i = 0; i < aSizes.length; i++) {
						aColumns.push({
							label: aSizes[i].toString(),
							valuePath: "dynamicColumn-" + aSizes[i].toString(),
							type: "Number",
							editable: "{viewModel>/editMode}"
						});
					}

					that.getModel("worklistViewModel").setProperty("/columns", aColumns);
					that.getModel("worklistViewModel").setProperty("/rows",
						aRows);
					that.getModel("worklistViewModel").setProperty("/sizes", aSizes);

					var aDefaultData = oSuccess.to_DefaultSize.results;

					//gaydin

					// var AcikveYuklenen = oSuccess.to_OrderItem.results;
					//

					// static columns
					aColumnsDefault.push({
						label: "Ana sipariş no",
						valuePath: "Vbeln",
						editable: false
					});
					aColumnsDefault.push({
						label: "Alt sipariş no",
						valuePath: "Posnr",
						editable: false
					});
					aColumnsDefault.push({
						label: "Order no",
						valuePath: "OrderNo",
						editable: false
					});
					aColumnsDefault.push({
						label: "Varyant",
						valuePath: "Varyant",
						editable: false
					});
					aColumnsDefault.push({
						label: "Duyuru adet",
						valuePath: "SiparisAdet",
						editable: false
					});

					// dynamic columns

					for (var k = 0; k < aSizes.length; k++) {
						aColumnsDefault.push({
							label: aSizes[k].toString(),
							valuePath: "dynamicColumnDefault-" + aSizes[k].toString(),
							type: "Number",
							editable: false
						});
					}
					var oRowDefault = {};
					var aRowsDefault = [];
					var cTotalOrder = 0,
						cTotalSize = 0;

					for (var m = 0; m < aOrderItem.length; m++) {
						// TODO: 
						// AcikMiktar - > ReqQty

						if (oRowDefault.Vbeln === aOrderItem[m].Vbeln && oRowDefault.Posnr === parseInt(aOrderItem[m].Posnr, 10)) {
							oRowDefault["dynamicColumnDefault-" + aOrderItem[m].FshScStxt] = parseInt(aOrderItem[m].ReqQty, 10);
							oRowDefault["SiparisAdet"] = cTotalOrder + parseInt(aOrderItem[m].ReqQty, 10);
							cTotalOrder = oRowDefault["SiparisAdet"];
						} else {
							aRowsDefault.push(oRowDefault);
							oRowDefault = {};
							cTotalOrder = 0;
							oRowDefault["Vbeln"] = aOrderItem[m].Vbeln;
							oRowDefault["Posnr"] = parseInt(aOrderItem[m].Posnr, 10);
							oRowDefault["OrderNo"] = oHeaderDetail.OrderNo;
							oRowDefault["Varyant"] = oHeaderDetail.Varyant;
							oRowDefault["SiparisAdet"] = parseInt(aOrderItem[m].ReqQty, 10);
							cTotalOrder = cTotalOrder + parseInt(aOrderItem[m].ReqQty, 10);
							oRowDefault["dynamicColumnDefault-" + aOrderItem[m].FshScStxt] = parseInt(aOrderItem[m].ReqQty, 10);

						}

					}
					aRowsDefault.splice(0, 1);
					aRowsDefault.push(oRowDefault);

					var aSizes = this.getModel("worklistViewModel").getProperty("/sizes");
					oRowDefault = {};
					oRowDefault["Varyant"] =
						"TOPLAM PAKET DUYURU AD";

					var cTotalValue = 0;
					for (let n = 0; n < aRowsDefault.length; n++) {
						cTotalValue = cTotalValue + aRowsDefault[n].SiparisAdet;
					}

					oRowDefault["SiparisAdet"] = cTotalValue;

					for (var i = 0; i < aSizes.length; i++) {
						oRowDefault["dynamicColumnDefault-" + aSizes[i]] = aDefaultData.filter(item => item.FshScStxt === aSizes[i])
							.map(item => parseInt(item.ReqQty, 10)).reduce((total, value) => total + value, 0);
					}

					aRowsDefault.push(oRowDefault);
					oRowDefault = {};

					//	yeni 2 alan  açık çeki ve yüklenen alanlar

					oRowDefault["Varyant"] = "AÇIK ÇEKİ";
					var cTotalValue = 0;
					for (let n = 0; n < aOrderItem.length; n++) {
						cTotalValue = cTotalValue + parseInt(aOrderItem[n].AcikCeki, 10);
					}

					oRowDefault["SiparisAdet"] = cTotalValue;

					for (var y = 0; y < aSizes.length; y++) {
						oRowDefault["dynamicColumnDefault-" + aSizes[y]] = aOrderItem.filter(item => item.FshScStxt === aSizes[y])
							.map(item => parseInt(item.AcikCeki, 10)).reduce((total, value) => total + value, 0);
					}
					aRowsDefault.push(oRowDefault);
					oRowDefault = {};

					oRowDefault["Varyant"] = "YÜKLENEN SATIRLAR";
					var cTotalValue = 0;
					for (let n = 0; n < aRowsDefault.length; n++) {
						cTotalValue = cTotalValue + parseInt(aOrderItem[n].Yuklenen, 10);
					}

					oRowDefault["SiparisAdet"] = cTotalValue;

					for (var z = 0; z < aSizes.length; z++) {
						oRowDefault["dynamicColumnDefault-" + aSizes[z]] = aOrderItem.filter(item => item.FshScStxt === aSizes[z])
							.map(item => parseInt(item.Yuklenen, 10)).reduce((total, value) => total + value, 0);
					}
					aRowsDefault.push(oRowDefault);
					oRowDefault = {};
					oRowDefault["Varyant"] = "TOPLAM ÇEKİ LİST AD";
					oRowDefault["SiparisAdet"] =
						"";
					aRowsDefault.push(oRowDefault);
					oRowDefault = {};

					oRowDefault["Varyant"] = "FARK";
					oRowDefault["SiparisAdet"] = "";
					aRowsDefault
						.push(oRowDefault);
					that.getModel("worklistViewModel").setProperty("/columnsDefault", aColumnsDefault);
					that.getModel(
						"worklistViewModel").setProperty("/rowsDefault", aRowsDefault);
					that.getModel("worklistViewModel").setProperty(
						"/defaultData", aDefaultData);
					this.getModel("worklistViewModel").setProperty("/weight", []);
					if (that._orderId) {
						if (oViewModel.getProperty("/packageType") === "A") {
							that._prepareRackData(oSuccess.to_RackDetail.results);
						} else {
							that._prepareBoxData(oSuccess.to_BoxDetail.results);
						}

						that._prepareUnitWeight(oSuccess.to_UnitWeight.results);
					}

				}.bind(that),
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
				}
			};
			this._oModel.create("/DetailSet", oDeepEntity, oParams);

		}
	});
});