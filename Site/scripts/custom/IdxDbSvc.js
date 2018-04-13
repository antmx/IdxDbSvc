/// <reference path="../jquery/jquery.d.ts" />
/// <reference path="dbtabledef.ts" />
var IdxDbSvc = (function () {
    function IdxDbSvc($, idxDbEnv) {
        this.AddIsModifiedColumn = function (indexArray) {
            indexArray.push(new CreateDbIndexArgs("IsModified", "IsModified", { unique: false, multiEntry: false }));
        };
        this.$ = $;
        this.IdxDbEnv = idxDbEnv;
    }
    IdxDbSvc.prototype.CreateDb = function (dbName, dbVersion, tableDefs) {
        var self = this;
        var deferred = self.$.Deferred();
        deferred.notify("Opening database...");
        var dbOpenRequest = self.IdxDbEnv.open(dbName, dbVersion);
        dbOpenRequest.onupgradeneeded = function (event) {
            self.OpenDbRequestStatus = "upgrading";
            deferred.notify("onupgradeneeded started");
            var db = dbOpenRequest.result;
            db.onerror = function (event) {
                deferred.reject("Error opening database");
            };
            db.onabort = function (event) {
                deferred.reject("Database opening aborted");
            };
            // Create a store (table) for each server table
            self.$.each(tableDefs, function (idx, tblDef) {
                deferred.notify("Creating store " + tblDef.TableName);
                self.BuildStore(db, tblDef.TableName, tblDef.ColNames, tblDef.PkColName, tblDef.AddIsModifiedCol);
                deferred.notify("Created store " + tblDef.TableName);
            });
            tableDefs.forEach(function (tblDef, index) {
                deferred.notify("Creating store " + tblDef.TableName);
                self.BuildStore(db, tblDef.TableName, tblDef.ColNames, tblDef.PkColName, tblDef.AddIsModifiedCol);
                deferred.notify("Created store " + tblDef.TableName);
            });
            self.OpenDbRequestStatus = "ok";
            deferred.notify("dbOpenRequest.onupgradeneeded completed");
            deferred.resolve(true);
        };
        dbOpenRequest.onsuccess = function (event) {
            if (self.OpenDbRequestStatus == "ok") {
                deferred.notify("dbOpenRequest.onsuccess - ok");
                deferred.resolve();
            }
            else {
                deferred.notify("dbOpenRequest.onsuccess - upgrading");
            }
        };
        dbOpenRequest.onerror = function (event) {
            deferred.reject("dbOpenRequest.onerror " + event);
        };
        dbOpenRequest.onblocked = function (event) {
            deferred.reject("dbOpenRequest.onblocked " + event);
        };
        return deferred.promise();
    };
    IdxDbSvc.prototype.BuildStore = function (db, tblName, colNames, pkColName, addIsModifiedCol) {
        if (!colNames || !colNames.length || colNames[0] == null) {
            alert("No column data found for table " + tblName);
            //deferred.notify("No column data found for table " + tblName);
            return;
        }
        var self = this;
        var indexesToCreate = [];
        var isPkCol = false;
        var createStoreOptions = {
            keyPath: "",
            autoIncrement: false
        };
        self.$.each(colNames, function (k, colName) {
            if (colName === pkColName) {
                isPkCol = true;
            }
            else {
                isPkCol = false;
            }
            if (isPkCol) {
                // Only create indexes for PK columns
                indexesToCreate.push(new CreateDbIndexArgs(colName, colName, { unique: isPkCol, multiEntry: false }));
            }
            if (colName === pkColName) {
                createStoreOptions.keyPath = colName;
            }
            createStoreOptions.autoIncrement = false;
        });
        if (addIsModifiedCol) {
            self.AddIsModifiedColumn(indexesToCreate);
        }
        var store = db.createObjectStore(tblName, createStoreOptions);
        self.$.each(indexesToCreate, function (key, args) {
            store.createIndex(args.IndexName, args.KeyPath, args.OptionalParameters);
        });
    };
    ;
    IdxDbSvc.prototype.GetStoreNames = function (dbName, dbVersion) {
        var self = this;
        var dbOpenRequest = self.IdxDbEnv.open(dbName, dbVersion);
        var deferred = self.$.Deferred();
        dbOpenRequest.onsuccess = function (ev /*Event*/) {
            var db = ev.target.result;
            deferred.resolve(db.objectStoreNames);
        };
        dbOpenRequest.onerror = function (event) {
            deferred.reject("Error opening database");
        };
        dbOpenRequest.onblocked = function (event) {
            deferred.reject("Database opening blocked");
        };
        return deferred.promise();
    };
    IdxDbSvc.prototype.DeleteDb = function (dbName) {
        var deferred = this.$.Deferred();
        var dbDeleteRequest = this.IdxDbEnv.deleteDatabase(dbName);
        dbDeleteRequest.onerror = function (event) {
            deferred.reject();
        };
        dbDeleteRequest.onsuccess = function (event) {
            deferred.resolve();
        };
        return deferred.promise();
    };
    ;
    return IdxDbSvc;
}());
//# sourceMappingURL=IdxDbSvc.js.map