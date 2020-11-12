sap.ui.define([
	"./BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (BaseController, Filter, FilterOperator, MessageToast, MessageBox) {
	"use strict";

	return BaseController.extend("com.sun.sd.packinglist.controller.OrderList", {

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/*
		 * Controller initialize event
		 * @public
		 */
		onInit: function () {
			this.getRouter().getRoute("OrderList").attachMatched(this._onPatternMatched, this);
			this.i18nBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		onInitSmartFilter: function () {
			var oSmartFilter = this.getView().byId("idSmartListFilterBar"),
				oJSONData = {};
			if (this._startupParameters.OrderNo) {
				oJSONData.VbelnVa = this._startupParameters.OrderNo[0];
				oSmartFilter.setFilterData(oJSONData);
				this.byId("smartTablePacking").rebindTable();
			}

		},
		/* =========================================================== */
		/* Internal methods */
		/* =========================================================== */

		/*
		 * Pattern matched
		 * @private
		 * @params {sap.ui.base.Event} oEvent - Event object
		 */
		_onPatternMatched: function (oEvent) {
			//use orderNo
			this._startupParameters = this._getMyComponent().getComponentData().startupParameters;
			this.getModel().metadataLoaded().then(function () {
				this._readAuthorization();
			}.bind(this));
			this.getModel("viewModel").setProperty("/footerMode", "orderList");
			this.byId("smartTablePacking").rebindTable();
		},
		_readAuthorization: function () {
			var oModel = this.getView().getModel(),
				oViewModel = this.getModel("viewModel"),
				oParams = {};
			oParams.method = "GET";
			oParams.success = function (oData, oResponse) {
				oViewModel.setProperty("/exportAuth", oData.ExportAuth.IhracatciYetki);
			};
			oParams.error = function (oError) {};
			oModel.callFunction("/ExportAuth", oParams);
		},
		/*
		 * Check smart filter item initially 
		 * @public
		 * @returns {boolean}
		 */
		_checkSmartFilterItem: function () {
			let oSmartFilterData = this.byId("idSmartListFilterBar").getFilterData();

			return oSmartFilterData.VbelnVa ? true : false;
		},

		/*
		 * query with VhOrders 
		 * @private
		 * @returns {Promise} Fields
		 */
		_queryWithOrder: function () {
			let sPath = `/VhOrdersSet`,
				oModel = this.getModel(),
				oViewModel = this.getModel("viewModel"),
				oValue = this.byId("idSmartListFilterBar").getFilterData().VbelnVa,
				fnPromise = (fnResolve, fnReject) => {
					let mParameters = {
						filters: [
							new Filter("Vbeln", "EQ", oValue)
						],
						success: fnResolve,
						error: fnReject
					};

					oModel.read(sPath, mParameters);
				};

			oViewModel.setProperty("/busy", true);
			return new Promise(fnPromise);
		},

		/*
		 * query with VhSubOrders 
		 * @private
		 * @params {String} sOrderNo - selection order no
		 * @returns {Promise} Fields
		 */
		_queryWithSubOrder: async function (sOrderNo) {
			let sPath = `/VhSubOrdersSet`,
				oModel = this.getModel(),
				oViewModel = this.getModel("viewModel"),
				oSubOrderHeader = oViewModel.getProperty("/subOrderHeader"),
				fnPromise = (fnResolve, fnReject) => {
					let mParameters = {
						filters: [
							new Filter("Vbeln", FilterOperator.EQ, oSubOrderHeader.VbelnVa),
							new Filter("Order", FilterOperator.EQ, sOrderNo)
						],
						success: fnResolve,
						error: fnReject
					};

					oModel.read(sPath, mParameters);
				};

			oViewModel.setProperty("/busy", true);
			return new Promise(fnPromise);
		},
		_updateDelivery: function (oEditline) {

			var oUrlParameters = {};
			var oModel = this.getModel();
			oUrlParameters.VbelnVl = oEditline.VbelnVl;
			oUrlParameters.Inco1 = oEditline.Inco1;
			// oUrlParameters.Volum = oEditline.Volum;
			oUrlParameters.VarisYeri = oEditline.VarisYeri;
			oUrlParameters.Zzservistipi = oEditline.Zzservistipi;
			oUrlParameters.Zzrezervasyon = oEditline.Zzrezervasyon;
			oUrlParameters.Vsart = oEditline.Vsart;
			oUrlParameters.YuklemeYeri = oEditline.YuklemeYeri;

			sap.ui.core.BusyIndicator.show(0);
			return new Promise((fnResolve, fnReject) => {
				let oParams = {
						success: fnResolve,
						error: fnReject
					},
					sPath = oModel.createKey("/ChangeDeliverySet", {
						VbelnVl: oUrlParameters.VbelnVl
					});

				oModel.update(sPath, oUrlParameters, oParams);
			});

		},
		_getMyComponent: function () {
			"use strict";
			var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
			return sap.ui.component(sComponentId);
		},
		/* =========================================================== */
		/* Event handlers */
		/* =========================================================== */

		onEditLinePress: function (oEvent) {
			let sSelectedIndex = this.byId("tablePacking").getSelectedIndex();
			if (sSelectedIndex < 0) {
				MessageBox.error(this.i18nBundle.getText("selectALine"));
				return;
			}
			let sPath = this.byId("tablePacking").getContextByIndex(this.byId("tablePacking").getSelectedIndex()).sPath,
				oTableModel = this.byId("tablePacking").getModel(),
				sBelgeDurumu = oTableModel.getProperty(sPath + "/Zzbelgedurumu");
			if (sBelgeDurumu === "04" || sBelgeDurumu === "07") {
				oTableModel.setProperty(sPath + "/EditLine", true);
			} else {
				MessageBox.error(this.i18nBundle.getText("onlyEditCompletedDelivery"));
				return;
			}

		},
		onButtonDeliverySavePress: function () {
			let sSelectedIndex = this.byId("tablePacking").getSelectedIndex();

			if (sSelectedIndex < 0) {
				MessageBox.error(this.i18nBundle.getText("selectALine"));
				return;
			}
			let sPath = this.byId("tablePacking").getContextByIndex(sSelectedIndex).sPath,
				oTableModel = this.byId("tablePacking").getModel(),
				sBelgeDurumu = oTableModel.getProperty(sPath + "/EditLine");
			if (!sBelgeDurumu) {
				MessageBox.error(this.i18nBundle.getText("pressEditMode"));
				return;
			}
			let fnSuccess = (oData) => {
					MessageToast.show(this.i18nBundle.getText("successfullyEdited"));
					sap.ui.core.BusyIndicator.hide();
					this.byId("tablePacking").getModel().setProperty(this.byId("tablePacking").getContextByIndex(this.byId("tablePacking").getSelectedIndex())
						.sPath + "/EditLine", false);
				},
				fnError = err => {
					sap.ui.core.BusyIndicator.hide();
				},
				fnFinally = () => {};
			this._updateDelivery(oTableModel.getProperty(sPath))
				.then(fnSuccess)
				.catch(fnError)
				.finally(fnFinally);

		},

		/*
		 * Selection row changed with all smart tables
		 * @public
		 * @param {sap.ui.base.Event} oEvent - Event object
		 */
		onButtonDetailPress: function (oEvent) {
			let oViewModel = this.getModel("viewModel"),
				oRowContext = oEvent.getSource().getBindingContext(),
				oRouter = this.getRouter();

			if (!oRowContext) {
				return;
			}

			jQuery.sap.delayedCall(100, this, () => {
				sap.ui.core.BusyIndicator.show(0);
				oRouter.navTo("orderDetail", {
					orderId: oRowContext.getProperty("VbelnVl")
				});
			});

			oViewModel.setProperty("/confirmAuthority", oRowContext.getProperty("Yetki"));
			oViewModel.setProperty("/cekmeTuru", oRowContext.getProperty("CekmeTuru"));
			oViewModel.setProperty("/answerPacking/Teslimat", oRowContext.getProperty("VbelnVl"));
			oViewModel.setProperty("/answerPacking/CekmeTuru", oRowContext.getProperty("CekmeTuru"));
			oViewModel.setProperty("/orderStatus", oRowContext.getProperty("Zzbelgedurumu"));
			oViewModel.setProperty("/editMode", false);
		},
		/*
		 * Before routing create packing  
		 * @public
		 * @param {sap.ui.base.Event} oEvent - Event object
		 */
		onCreatePacking: async function (oEvent) {
			let oViewModel = this.getModel("viewModel"),
				fnSuccess = (oData) => {
					oViewModel.setProperty("/subOrderHeader", oData.results[0]);
					oViewModel.setProperty("/order", oData.results);
				},
				fnError = err => {},
				fnFinally = () => {
					oViewModel.setProperty("/busy", false);
				};

			if (!this._checkSmartFilterItem()) {
				MessageBox.error("Belge oluşturabilmek için müşteri ana siparişi filtresi dolu olmalıdır");
				return;

			}

			await this._queryWithOrder()
				.then(fnSuccess)
				.catch(fnError)
				.finally(fnFinally);

			oViewModel.setProperty("/subOrder", []);
			oViewModel.setProperty("/selectedSubOrders", []);
			this.openDialog("dialogSubOrder", "com.sun.sd.packinglist.view.fragment.dialog.SubOrder").then((oDialog) => {});
		},

		/*
		 * Dialog Orders selected item
		 * @public
		 * @param {sap.ui.base.Event} oEvent - Event object
		 */
		onChangeOrder: async function (oEvent) {
			let oSelectedItem = oEvent.getSource().getSelectedItem().getKey(),
				oViewModel = this.getModel("viewModel"),
				fnSuccess = (oData) => {
					oViewModel.setProperty("/subOrder", oData.results);
				},
				fnError = err => {},
				fnFinally = () => {
					oViewModel.setProperty("/busy", false);
				};

			await this._queryWithSubOrder(oSelectedItem)
				.then(fnSuccess)
				.catch(fnError)
				.finally(fnFinally);
		},

		/*
		 * Nav to detail page
		 * @public
		 * @param {String} sCekmeTuru - Çekme Türü '01'- '02'
		 */
		onSendPackingPress: function (sCekmeTuru) {
			let oSide = {},
				aSide = [],
				oViewModel = this.getModel("viewModel"),
				oResourceBundle = this.getResourceBundle(),
				oModel = this.getModel(),
				aSubOrderKeys = oViewModel.getProperty("/selectedSubOrders"),
				sVbeln = oViewModel.getProperty("/subOrderHeader/VbelnVa"),
				oRouter = this.getRouter(),
				sPackageType = "",
				sSubOrderDetail = "",
				aSubOrder = [],
				bNotEqual = false;

			if (aSubOrderKeys.length === 0) {
				MessageToast.show(oResourceBundle.getText("message.subOrder"))
				return;
			}

			aSubOrderKeys.forEach(oSubOrderKeys => {
				let sPath = oModel.createKey("/VhSubOrdersSet", {
					Vbeln: sVbeln,
					Posnr: oSubOrderKeys
				});
				aSubOrder.push(oModel.getProperty(sPath));
			});

			aSubOrder.forEach(oSubOrder => {
				let oPackageType = aSubOrder.find(oFind => oFind.Zzpaketlemesekli !== oSubOrder.Zzpaketlemesekli);
				let oSubOrderDetail = aSubOrder.find(oFind => oFind.Zzaltsiparisdetay !== oSubOrder.Zzaltsiparisdetay);

				if (oPackageType || oSubOrderDetail) {
					bNotEqual = true;
				}
			});

			if (bNotEqual) {
				MessageToast.show(oResourceBundle.getText("message.packageAndSubOrder"))
				return;
			}

			aSubOrder.forEach(oSubOrder => {
				oSide.Vbeln = oSubOrder.Vbeln;
				oSide.Posnr = oSubOrder.Posnr;
				oSide.Lgort = oSubOrder.Lgort;
				oSide.CekmeTuru = sCekmeTuru;
				aSide.push(oSide);
				oSide = {};
				sPackageType = oSubOrder.Zzpaketlemesekli;
				sSubOrderDetail = oSubOrder.Zzaltsiparisdetay;
			});

			oViewModel.setProperty("/to_SdDocument", aSide);
			oViewModel.setProperty("/cekmeTuru", sCekmeTuru);
			oViewModel.setProperty("/editMode", true);
			oViewModel.setProperty("/packageType", sPackageType);
			oViewModel.setProperty("/subOrderDetail", sSubOrderDetail);
			oViewModel.setProperty("/weight", []);

			//  GAYDIN	sCekmeTuru === 01 ise  ZSD_023_FM_PAKET_BITIR_KONTROL isminde bir rfc çağır 

			if (sCekmeTuru === "01") {
				// var oSide = {},

				var oDeepEntity = {},
					oParams = {},
					that = this,

					aSdDocument = oViewModel.getProperty("/to_SdDocument");

				oDeepEntity.IvLgort = (aSdDocument.length > 0 ? aSdDocument.find(item => item.Vbeln !== "").Lgort : "");
				oDeepEntity.to_SdDocument = [];
				oDeepEntity.to_SdDocument = oViewModel.getProperty("/to_SdDocument");
				sap.ui.core.BusyIndicator.show(0);
				oParams = {
					success: function (oSuccess) {

						sap.ui.core.BusyIndicator.hide();
							oRouter.navTo("orderDetail", {});
						// var filtersOrder = new Array();
						// var filtersearch = new sap.ui.model.Filter("IvLgort", sap.ui.model.FilterOperator.EQ, aSubOrder[0].Lgort);
						// filtersOrder.push(filtersearch);
						// this.getView().getModel().read("/FinishPackControlSet", {
						// 	filters: filtersOrder,
						// 	success: function (oData) {
						// 		sap.ui.core.BusyIndicator.hide();

						// 	},
						// 	error: function () {
						// 		sap.ui.core.BusyIndicator.hide();
						// 		setTimeout(function () {
						// 			// that._getMessagePopover().openBy(that.getView().byId("messagePopoverBtn"));
						// 		}, 100);
						// 	}
						// });

					}.bind(that),
					error: function (oError) {
						sap.ui.core.BusyIndicator.hide();
					}
				};
				oModel.create("/FinishPackControlSet", oDeepEntity, oParams);
			} else {
				oRouter.navTo("orderDetail", {});
			}

		},

		/*
		 * Read reject text and open fragment
		 * @public
		 * @param {sap.ui.base.Event} oEvent -Event object
		 */
		onDisplayRejectReasonPress: async function (oEvent) {
			let oRowContext = oEvent.getSource().getBindingContext(),
				sDelivery = oRowContext.getProperty("VbelnVl"),
				oViewModel = this.getModel("viewModel"),
				fnSuccess = (oData) => {
					oViewModel.setProperty("/answerPacking", oData);
					oViewModel.setProperty("/answerPackingEnableMode", false);
				},
				fnError = err => {},
				fnFinally = () => {
					oViewModel.setProperty("/busy", false);
				};

			await this._readRejectReason(sDelivery)
				.then(fnSuccess)
				.catch(fnError)
				.finally(fnFinally);

			this.openDialog("dialogAnswerPacking", "com.sun.sd.packinglist.view.fragment.dialog.AnswerPacking").then((oDialog) => {});
		},

		_readRejectReason: async function (sDelivery) {
			let oModel = this.getModel(),
				sPath = oModel.createKey(`/ConfirmationSet`, {
					Teslimat: sDelivery
				}),
				oViewModel = this.getModel("viewModel"),
				fnPromise = (fnResolve, fnReject) => {
					let mParameters = {
						success: fnResolve,
						error: fnReject
					};

					oModel.read(sPath, mParameters);
				};

			oViewModel.setProperty("/busy", true);
			return new Promise(fnPromise);
		}

	});
});