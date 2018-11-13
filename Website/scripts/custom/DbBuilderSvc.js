///// <reference path="../../jQuery/jquery.js" />
///// <reference path="../Misc.js" />

/**
 * DbBuilderSvc : Performs IndexedDb building tasks
 */
function DbBuilderSvc(credentials) {

    this.Credentials = credentials;
    this.OpenDbRequestStatus = "ok";
}

DbBuilderSvc.prototype.CreateDb = function (progressCallbackFn) {

    var self = this;
    var deferred = $.Deferred();

    progressCallbackFn.call(null, "Opening database...");
    
    var dbOpenRequest = window.indexedDB.open(DBName, DBVersion);

    dbOpenRequest.onupgradeneeded = function (event) {
        
        self.OpenDbRequestStatus = "upgrading";
        console.log("onupgradeneeded started");
        var db = event.target.result;

        db.onerror = function (event) {
            progressCallbackFn.call(null, "Error opening database");
            deferred.reject("Error opening database");
        };

        db.onabort = function (event) {
            progressCallbackFn.call(null, "Database opening aborted");
            deferred.reject("Database opening aborted");
        };
        
        // Create a store (table) for each server table
        self.CreateStore(db, tblNews, "Message_ID", false, self.Credentials);
        self.CreateStore(db, tblCategoryLookup, "Category_ID", false, self.Credentials);
        self.CreateStore(db, tblCapexHeader, "Capex_Header_ID", true, self.Credentials);
        self.CreateStore(db, tblCapexLine, "Capex_Line_ID", true, self.Credentials);
        self.CreateStore(db, tblCustomerTypeLookup, "CustType_ID", true, self.Credentials);
        self.CreateStore(db, tblLandMeasurementLookup, "LandMeasure_ID", true, self.Credentials);
        self.CreateStore(db, tblDairyHerdCalHeader, "DairyHerdCal_Header_ID", true, self.Credentials);
        self.CreateStore(db, tblDairyHerdCalLine, "DairyHerdCalendar_Line_ID", true, self.Credentials);
        self.CreateStore(db, tblGrossMargin, "GrossMargin_ID", true, self.Credentials);
        self.CreateStore(db, tblJobTypeLookup, "JobType_ID", true, self.Credentials);
        self.CreateStore(db, tblLanguage, "Language_ID", true, self.Credentials);
        self.CreateStore(db, tblDairyYoungstockCalHeader, "DairyYoungstockCal_Header_ID", true, self.Credentials);
        self.CreateStore(db, tblDairyYoungstockCalLine, "DairyYoungstockCalendar_Line_ID", true, self.Credentials);
        self.CreateStore(db, tblBeefRearingCalHeader, "BeefRearing_Header_ID", true, self.Credentials);
        self.CreateStore(db, tblBeefRearingCalLine, "BeefRearingCalendar_Line_ID", true, self.Credentials);
        self.CreateStore(db, tblBreedingEweCalHeader, "BreedingEwes_Header_ID", true, self.Credentials);
        self.CreateStore(db, tblBreedingEweCalLine, "BreedingEwesCalendar_Line_ID", true, self.Credentials);
        self.CreateStore(db, tblArableCropReconcilHeader, "ArableCropRecon_Header_ID", true, self.Credentials);
        self.CreateStore(db, tblArableCropReconcilLine, "ArableCropReconcil_Line_ID", true, self.Credentials);
        self.CreateStore(db, tblCropSchedule, "CropSchedule_ID", true, self.Credentials);
        self.CreateStore(db, tblSubsidiesHeader, "Subsidies_Header_ID", true, self.Credentials);
        self.CreateStore(db, tblSubsidiesLine, "Subsidies_Lines_ID", true, self.Credentials);
        self.CreateStore(db, tblOverheadCost, "OverheadCosts_ID", true, self.Credentials);
        self.CreateStore(db, tblLoanScheduleHeader, "LoanSchedules_Header_ID", true, self.Credentials);
        self.CreateStore(db, tblLoanSchedulesLine, "LoanSchedules_Line_ID", true, self.Credentials);
        self.CreateStore(db, tblDOF, "DOF_ID", true, self.Credentials);
        self.CreateStore(db, tblBalanceSheet, "BalanceSheet_ID", true, self.Credentials);
        self.CreateStore(db, tblTradingSummary, "TradingSummary_ID", true, self.Credentials);
        self.CreateStore(db, tblEnterpriseMaster, "Enterprise_ID", true, self.Credentials);
        self.CreateStore(db, tblEnterpriseToCustomer, "Enter_Custom_ID", true, self.Credentials);
        self.CreateStore(db, tblConsultantToCustomer, "Consu_Custom_Key", true, self.Credentials);
        self.CreateStore(db, tblOtherRearingCalHeader, "OtherRearing_Header_ID", true, self.Credentials);
        self.CreateStore(db, tblOtherRearingCalLine, "OtherRearingCalendar_Line_ID", true, self.Credentials);
        self.CreateStore(db, tblSucklerCowCalHeader, "SucklerCows_Header_ID", true, self.Credentials);
        self.CreateStore(db, tblSucklerCowCalLine, "SucklerCowsCalendar_Line_ID", true, self.Credentials);
        self.CreateStore(db, tblOtherLivestockCalHeader, "OtherLivestock_Header_ID", true, self.Credentials);
        self.CreateStore(db, tblOtherLivestockCalLine, "OtherLivestockCalendar_Line_ID", true, self.Credentials);
        self.CreateStore(db, tblOtherCropReconHeader, "OtherCropRecon_Header_ID", true, self.Credentials);
        self.CreateStore(db, tblOtherCropReconLine, "OtherCropReconcil_Line_ID", true, self.Credentials);
        self.CreateStore(db, tblRentScheduleHeader, "RentSchedules_Header_ID", true, self.Credentials);
        self.CreateStore(db, tblRentScheduleLine, "RentSchedules_Line_ID", true, self.Credentials);
        self.CreateStore(db, tblTransfer, "Transfer_ID", true, self.Credentials);
        self.CreateStore(db, tblCashflowHeader, "Cashflow_Header_ID", true, self.Credentials);
        self.CreateStore(db, tblCashflowLine, "Cashflow_Line_ID", true, self.Credentials);
        self.CreateStore(db, tblWfmpImport, "WFMPImport_ID", true, self.Credentials);
        self.CreateStore(db, tblBudgetWorkflowStatus, "BudgetWorkflowStatus_ID", false, self.Credentials);
        
        /*
		self.CreateStore(db, tblBenchmark, "Benchmark_ID", true, self.Credentials);
		self.CreateStore(db, tblBenchmarkLookup, "Benchmark_Type_ID", true, self.Credentials);
		self.CreateStore(db, tblBudget, "Budget_ID", true, self.Credentials);
		self.CreateStore(db, tblBudgetScreenType, "Budget_Screen_Type_ID", true, self.Credentials);
		self.CreateStore(db, tblBusinessTrading, "BusinessTrading_ID", true, self.Credentials);
		self.CreateStore(db, tblBusinessTradingLine, "BusinessTrading_Lines_ID", true, self.Credentials);
		self.CreateStore(db, tblCashflow, "Cashflow_ID", true, self.Credentials);
		self.CreateStore(db, tblCashflowType, "Cashflow_Type_ID", true, self.Credentials);

		self.CreateStore(db, tblLanguageOption, "LanguageOptionsID", true, self.Credentials);
		self.CreateStore(db, tblOpeningBalancesheet, "OpeningBalanceSheets_ID", true, self.Credentials);
		self.CreateStore(db, tblOption, "Options_ID", true, self.Credentials);
		self.CreateStore(db, tblOptionLine, "Options_Lines_ID", true, self.Credentials);
		self.CreateStore(db, tblPageTypeLookup, "PageType_ID", true, self.Credentials);*/
        self.CreateStore(db, tblBudgetDate, "BudgetDate_ID", true, self.Credentials);
        self.CreateStore(db, tblCustomer, "Customer_ID", true, self.Credentials);
        self.CreateStore(db, tblTsdgVisit, "TsdgVisit_ID", true, self.Credentials);
        self.CreateStore(db, tblTsdgVisitBalShtSmry, "TsdgVisitBalShtSmry_ID", true, self.Credentials);
        self.CreateStore(db, tblTsdgVisitBusRiskArea, "TsdgVisitBusRiskArea_ID", true, self.Credentials);
        self.CreateStore(db, tblTsdgVisitBusTrdngSmry, "TsdgVisitBusTrdngSmry_ID", true, self.Credentials);
        self.CreateStore(db, tblTsdgVisitKtpi, "TsdgVisitKtpi_ID", true, self.Credentials);
        self.CreateStore(db, tblTsdgVisitOppAction, "TsdgVisitOppAction_ID", true, self.Credentials);
        self.CreateStore(db, tblTsdgVisitProfitReqrmnt, "TsdgVisitProfitReqrmnt_ID", true, self.Credentials);
        self.CreateStore(db, tblTsdgVisitProprtnlAnal, "TsdgVisitProprtnlAnal_ID", true, self.Credentials);
        self.CreateStore(db, tblTsdgVisitAnlMlkSale, "TsdgVisitAnlMlkSale_ID", true, self.Credentials);
        self.CreateStore(db, tblTsdgVisitEntprs, "TsdgVisitEntprs_ID", true, self.Credentials);
        self.CreateStore(db, tblTsdgVisitKtpiCtgryLkp, "TsdgVisitKtpiCtgryLkp_ID", true, self.Credentials);
        self.CreateStore(db, tblTsdgVisitEntprsNameLkp, "TsdgVisitEntprsNameLkp_ID", true, self.Credentials);
        self.CreateStore(db, tblTsdgVisitBusStrength, "TsdgVisitBusStrength_ID", true, self.Credentials);
        self.CreateStore(db, tblTsdgVisitBusStrengthNameLkp, "TsdgVisitBusStrengthNameLkp_ID", true, self.Credentials);
        self.CreateStore(db, tblTsdgVisitBusRiskAreaDescLkp, "TsdgVisitBusRiskAreaDescLkp_ID", true, self.Credentials);
        self.CreateStore(db, tblTsdgVisitAtchmnt, "TsdgVisitAtchmnt_ID", true, self.Credentials);
        self.CreateStore(db, tblTsdgVisitMgmtInfoSrc, "TsdgVisitMgmtInfoSrc_ID", true, self.Credentials);
        self.CreateStore(db, tblTsdgVisitMgmtInfoSrcNameLkp, "TsdgVisitMgmtInfoSrcNameLkp_ID", true, self.Credentials);
        self.CreateStore(db, tblTsdgVisitWorkflowStatus, "TsdgVisitWorkflowStatus_ID", true, self.Credentials);
        
        //self.CreateStore(db, tblOpeningBudgetDate, "OpeningBudgetDate_ID", true, self.Credentials);

        // Build non-server tables
        //self.BuildTempAtchmntStore(db);

        self.OpenDbRequestStatus = "ok";
        console.log("dbOpenRequest.onupgradeneeded completed");
        deferred.resolve();
    };

    dbOpenRequest.onsuccess = function (event) {
        
        if (self.OpenDbRequestStatus == "ok") {
            console.log("dbOpenRequest.onsuccess - ok");
            deferred.resolve();
        }
        else {
            console.log("dbOpenRequest.onsuccess - upgrading");
        }
    };

    dbOpenRequest.onerror = function (event) {

        alert("dbOpenRequest.onerror " + event);
    };

    dbOpenRequest.onblocked = function (event) {

        alert("dbOpenRequest.onblocked " + event);
    };

    return deferred.promise();
};

//DbBuilderSvc.prototype.BuildTempAtchmntStore = function (db) {
//    var self = this;
//    var columnData = [{
//        TempAtchmnt_ID: "uniqueidentifier",
//        TempAtchmnt_FileContent: "nvarchar"
//    }];
//    self.BuildStore(db, tblTempAtchmnt, columnData, "TempAtchmnt_ID", false);
//};

DbBuilderSvc.prototype.CreateStore = function (db, tbl, pkField, addModDataCol, credentials) {

    var self = this;
    //var deferred = $.Deferred();

    if (!db.objectStoreNames.contains(tbl)) {
        console.log("Creating store " + tbl);
        // Start creating the store (table)
        $.ajax({
            url: ColumnModelURL,
            data: { tableName: tbl },
            type: "GET",
            async: false,
            beforeSend: function (xhr) {
                // Apply authorization header to the request, which will be picked up on server by AuthenticationFilter
                ApplyTokenAuthorizationHeader(xhr, credentials);
            }
        })
			.done(function (columnData) {
			    
			    self.BuildStore(db, tbl, columnData, pkField, addModDataCol);
			})
			.error(function (e) {
			    alert("CreateStore error for " + tbl + " " + e);
			    //deferred.reject(e);
			});
    } else {
        console.log("Store " + tbl + " already created");
        //deferred.resolve();
    }

    //return deferred.promise();
};

DbBuilderSvc.prototype.AddModifiedDataColumn = function (indexArray) {

    indexArray.push({
        name: "ModifiedData",
        keypath: "ModifiedData",
        optionalParameters: { unique: false, multiEntry: false }
    });

    return indexArray;
};

DbBuilderSvc.prototype.BuildStore = function (db, tbl, columnData, pkField, addModDataCol) {

    if (!DoesArrayFirstItemExist(columnData)) {
        alert("No column data found for table " + tbl);
        deferred.notify("No column data found for table " + tbl);
        return;
    }

    var self = this;
    var indexArray = [];
    var bUnique = false;
    var tblCreationOptions = {
        keyPath: "",
        autoIncrement: false
    };
    
    $.each(columnData[0], function (k, v) {

        if (k === pkField) {
            bUnique = true;
        }
        else {
            bUnique = false;
        }

        if (bUnique) {
            // Only create indexes for PK columns
            indexArray.push({
                name: k,
                keypath: k,
                optionalParameters: { unique: bUnique, multiEntry: false }
            });
        }

        if (k === pkField) {
            tblCreationOptions.keyPath = k;
        }

        tblCreationOptions.autoIncrement = false;
    });

    if (addModDataCol) {
        indexArray = self.AddModifiedDataColumn(indexArray);
    }

    var store = db.createObjectStore(tbl, tblCreationOptions);

    $.each(indexArray, function (key, v) {
        store.createIndex(indexArray[key].name, indexArray[key].keypath, indexArray[key].optionalParameters);
    });

    console.log("Created store " + tbl);
};

DbBuilderSvc.prototype.DeleteDb = function () {

    var deferred = $.Deferred();
    var dbDeleteRequest = window.indexedDB.deleteDatabase(DBName);

    dbDeleteRequest.onerror = function (event) {
        deferred.reject();
    };

    dbDeleteRequest.onsuccess = function (event) {
        //console.log(event.result); // should be undefined
        deferred.resolve();
    };

    return deferred.promise();
};
