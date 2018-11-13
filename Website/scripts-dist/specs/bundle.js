(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CreateDbIndexArgs = (function () {
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
var DbTableDef = (function () {
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
Object.defineProperty(exports, "__esModule", { value: true });
var CreateDbIndexArgs_1 = require("./CreateDbIndexArgs");
var IdxDbSvc = (function () {
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
                self.OpenDbRequestStatus = "upgrading";
                var db = dbOpenRequest.result;
                db.onerror = function (event) {
                    reject(Error("Error opening database "));
                };
                db.onabort = function (event) {
                    reject("Database opening aborted");
                };
                tableDefs.forEach(function (tblDef) {
                    self.BuildStore(db, tblDef.TableName, tblDef.ColNames, tblDef.PkColName, tblDef.AddIsModifiedCol);
                });
                self.OpenDbRequestStatus = "ok";
                resolve(true);
            };
            dbOpenRequest.onsuccess = function (event) {
                if (self.OpenDbRequestStatus == "ok") {
                    resolve(true);
                }
                else {
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
            dbOpenRequest.onsuccess = function (ev) {
                var db = ev.target.result;
                resolve(db.objectStoreNames);
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
Object.defineProperty(exports, "__esModule", { value: true });
var DbTableDef_1 = require("../DbTableDef");
var IdxDbSvc_1 = require("../IdxDbSvc");
describe("IdxDbSvc", function () {
    var svc;
    beforeEach(function (done) {
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
    describe("constructor", function () {
        it("sets up the properties from the args", function () {
            expect(svc.IdxDbEnv).toBeDefined();
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
});

},{"../DbTableDef":2,"../IdxDbSvc":3}]},{},[4])
//# sourceMappingURL=bundle.map.js
