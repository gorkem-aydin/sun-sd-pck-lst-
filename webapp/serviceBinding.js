function initModel() {
	var sUrl = "/sap/opu/odata/sap/ZSD_PACKING_LIST_SRV/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}