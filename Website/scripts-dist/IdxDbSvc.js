"use strict";
/// <reference path="dbtabledef.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
var CreateDbIndexArgs_1 = require("./CreateDbIndexArgs");
var IdxDbSvc = /** @class */ (function () {
    function IdxDbSvc(idxDbEnv) {
        this.AddIsModifiedColumn = function (indexArray) {
            indexArray.push(new CreateDbIndexArgs_1.CreateDbIndexArgs("IsModified", "IsModified", { unique: false, multiEntry: false }));
        };
        this.IdxDbEnv = idxDbEnv;
    }
    IdxDbSvc.prototype.CreateDb = function (dbName, dbVersion, tableDefs) {
        var self = this;
        return new Promise(function (resolve, reject) {
            var dbOpenRequest = self.IdxDbEnv.open(dbName, dbVersion);
            dbOpenRequest.onupgradeneeded = function (event) {
                console.log("onupgradeneeded");
                self.OpenDbRequestStatus = "upgrading";
                //deferred.notify("onupgradeneeded started");
                var db = dbOpenRequest.result;
                db.onerror = function (event) {
                    reject(Error("Error opening database "));
                };
                db.onabort = function (event) {
                    reject("Database opening aborted");
                };
                // Create a store (table) for each table definition provided
                tableDefs.forEach(function (tblDef) {
                    //deferred.notify("Creating store " + tblDef.TableName);
                    self.BuildStore(db, tblDef.TableName, tblDef.ColNames, tblDef.PkColName, tblDef.AddIsModifiedCol);
                    //deferred.notify("Created store " + tblDef.TableName);
                });
                self.OpenDbRequestStatus = "ok";
                //deferred.notify("dbOpenRequest.onupgradeneeded completed");
                dbOpenRequest.result.close();
                //resolve(true);
            };
            dbOpenRequest.onsuccess = function (event) {
                if (self.OpenDbRequestStatus == "ok") {
                    //deferred.notify("dbOpenRequest.onsuccess - ok");
                    dbOpenRequest.result.close();
                    resolve(true);
                }
                else {
                    //deferred.notify("dbOpenRequest.onsuccess - upgrading");
                }
            };
            dbOpenRequest.onerror = function (event) {
                reject("dbOpenRequest.onerror " + event);
            };
            dbOpenRequest.onblocked = function (event) {
                reject("dbOpenRequest.onblocked " + event);
            };
        });
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
        colNames.forEach(function (colName) {
            if (colName === pkColName) {
                isPkCol = true;
            }
            else {
                isPkCol = false;
            }
            if (isPkCol) {
                // Only create indexes for PK columns
                indexesToCreate.push(new CreateDbIndexArgs_1.CreateDbIndexArgs(colName, colName, { unique: isPkCol, multiEntry: false }));
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
        indexesToCreate.forEach(function (dbIdxArgs) {
            store.createIndex(dbIdxArgs.IndexName, dbIdxArgs.KeyPath, dbIdxArgs.OptionalParameters);
        });
    };
    IdxDbSvc.prototype.GetStoreNames = function (dbName, dbVersion) {
        var self = this;
        var dbOpenRequest = self.IdxDbEnv.open(dbName, dbVersion);
        return new Promise(function (resolve, reject) {
            dbOpenRequest.onsuccess = function (ev /*Event*/) {
                var db = ev.target.result;
                resolve(db.objectStoreNames);
                dbOpenRequest.result.close();
            };
            dbOpenRequest.onerror = function (event) {
                reject(Error("Error opening database"));
            };
            dbOpenRequest.onblocked = function (event) {
                reject(Error("Database opening blocked"));
            };
        });
    };
    IdxDbSvc.prototype.DeleteDb = function (dbName) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var dbDeleteRequest = _this.IdxDbEnv.deleteDatabase(dbName);
            dbDeleteRequest.onerror = function (event) {
                reject(Error(event.type));
            };
            dbDeleteRequest.onblocked = function (event) {
                reject(Error(event.type));
                event.target.result.close();
                console.log("blocked");
            };
            dbDeleteRequest.onupgradeneeded = function (event) {
                reject(Error(event.type));
            };
            dbDeleteRequest.onsuccess = function (event) {
                resolve(true);
            };
        });
    };
    ;
    return IdxDbSvc;
}());
exports.IdxDbSvc = IdxDbSvc;
//# sourceMappingURL=IdxDbSvc.js.map