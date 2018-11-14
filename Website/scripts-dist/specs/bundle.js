(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Represents the arguments required for creating an index on a database table/store.
 */
var CreateDbIndexArgs = /** @class */ (function () {
    /**
     * Constructor.
     * @param indexName Name of the index.
     * @param keyPath Single field name or array of field names the index applies to.
     * @param optionalParameters Optional parameters for the index.
     */
    function CreateDbIndexArgs(indexName, keyPath, optionalParameters) {
        this.IndexName = indexName;
        this.KeyPath = keyPath;
        this.OptionalParameters = optionalParameters;
    }
    return CreateDbIndexArgs;
}());
exports.CreateDbIndexArgs = CreateDbIndexArgs;

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Represents setting for defining a database table.
 */
var DbTableDef = /** @class */ (function () {
    function DbTableDef(tableName, colNames, pkColName, addIsModifiedCol) {
        if (addIsModifiedCol === void 0) { addIsModifiedCol = false; }
        this.TableName = tableName;
        this.ColNames = colNames;
        this.PkColName = pkColName;
        this.AddIsModifiedCol = addIsModifiedCol;
    }
    return DbTableDef;
}());
exports.DbTableDef = DbTableDef;

},{}],3:[function(require,module,exports){
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

},{"./CreateDbIndexArgs":1}],4:[function(require,module,exports){
"use strict";
/// <reference path="../../jasmine/jasmine.d.ts" />
/// <reference path="../idxdbsvc.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
var DbTableDef_1 = require("../DbTableDef");
var IdxDbSvc_1 = require("../IdxDbSvc");
describe("IdxDbSvc", function () {
    var svc;
    var originalTimeout;
    beforeEach(function (done) {
        //    console.log("beforeEach - increasing timeout");
        //    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        //    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        console.log("beforeEach - deleting db");
        svc = new IdxDbSvc_1.IdxDbSvc(window.indexedDB);
        svc.DeleteDb("DBName")
            .then(function (result) {
            expect(result).toBeTruthy();
            done();
        })
            .catch(function (failReason) {
            console.error(failReason);
            expect(false).toBeTruthy();
            done();
        });
    });
    //afterEach(() => {
    //    console.log("restoring timeout");
    //    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    //});
    describe("constructor", function () {
        it("sets up the properties from the args", function (done) {
            expect(svc.IdxDbEnv).toBeDefined();
            done();
        });
    });
    describe("CreateDb", function () {
        it("Creates a database", function (done) {
            var tblDefs = [];
            tblDefs.push(new DbTableDef_1.DbTableDef("tblFoo", ["FooCol1", "FooCol2"], "FooCol1", true));
            tblDefs.push(new DbTableDef_1.DbTableDef("tblBar", ["BarCol1", "BarCol2", "BarCol3"], "BarCol1", false));
            svc.CreateDb("DBName", 1, tblDefs)
                .then(function (result) {
                expect(result).toEqual(true);
                svc.GetStoreNames("DBName", 1)
                    .then(function (objectStoreNames) {
                    expect(objectStoreNames).toBeDefined();
                    expect(objectStoreNames.length).toEqual(2);
                    expect(objectStoreNames[0]).toEqual("tblBar");
                    expect(objectStoreNames[1]).toEqual("tblFoo");
                    done();
                });
            })
                .catch(function (err) {
                console.error(err);
            });
        });
    });
    describe("DeleteDb", function () {
        it("Deletes a database", function (done) {
            console.log("DeleteDb - creating db to be deleted");
            svc.CreateDb("DBName", 1, [new DbTableDef_1.DbTableDef("tblFoo", ["FooCol1", "FooCol2"], "FooCol1", true)])
                .then(function (createResult) {
                console.log("DeleteDb - It deletes a database - creating db - result %s", createResult);
                if (createResult) {
                    svc.DeleteDb("DBName").then(function (deleteResult) {
                        console.log("DeleteDb - It deletes a database - deleting db - result %s", deleteResult);
                        expect(deleteResult).toEqual(true);
                        done();
                    });
                }
                else {
                    console.error("CreateDb result was %s", createResult);
                }
            }).catch(function (failReason) {
                console.error("DeleteDb - It deletes a database - creating db failed: %s", failReason);
                done();
            });
        });
    });
});

},{"../DbTableDef":2,"../IdxDbSvc":3}]},{},[4])
//# sourceMappingURL=bundle.map.js
