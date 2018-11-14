{
  "version": 3,
  "sources": [
    "node_modules/browser-pack/_prelude.js",
    "scripts-dist/CreateDbIndexArgs.js",
    "scripts-dist/IdxDbSvc.js"
  ],
  "names": [],
  "mappings": "AAAA;ACAA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;ACpBA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA",
  "file": "generated.js",
  "sourceRoot": "",
  "sourcesContent": [
    "(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c=\"function\"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error(\"Cannot find module '\"+i+\"'\");throw a.code=\"MODULE_NOT_FOUND\",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u=\"function\"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()",
    "\"use strict\";\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\n/**\r\n * Represents the arguments required for creating an index on a database table/store.\r\n */\r\nvar CreateDbIndexArgs = /** @class */ (function () {\r\n    /**\r\n     * Constructor.\r\n     * @param indexName Name of the index.\r\n     * @param keyPath Single field name or array of field names the index applies to.\r\n     * @param optionalParameters Optional parameters for the index.\r\n     */\r\n    function CreateDbIndexArgs(indexName, keyPath, optionalParameters) {\r\n        this.IndexName = indexName;\r\n        this.KeyPath = keyPath;\r\n        this.OptionalParameters = optionalParameters;\r\n    }\r\n    return CreateDbIndexArgs;\r\n}());\r\nexports.CreateDbIndexArgs = CreateDbIndexArgs;\r\n//# sourceMappingURL=CreateDbIndexArgs.js.map",
    "\"use strict\";\r\n/// <reference path=\"dbtabledef.ts\" />\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nvar CreateDbIndexArgs_1 = require(\"./CreateDbIndexArgs\");\r\nvar IdxDbSvc = /** @class */ (function () {\r\n    function IdxDbSvc(idxDbEnv) {\r\n        this.AddIsModifiedColumn = function (indexArray) {\r\n            indexArray.push(new CreateDbIndexArgs_1.CreateDbIndexArgs(\"IsModified\", \"IsModified\", { unique: false, multiEntry: false }));\r\n        };\r\n        this.IdxDbEnv = idxDbEnv;\r\n    }\r\n    IdxDbSvc.prototype.CreateDb = function (dbName, dbVersion, tableDefs) {\r\n        var self = this;\r\n        return new Promise(function (resolve, reject) {\r\n            var dbOpenRequest = self.IdxDbEnv.open(dbName, dbVersion);\r\n            dbOpenRequest.onupgradeneeded = function (event) {\r\n                console.log(\"onupgradeneeded\");\r\n                self.OpenDbRequestStatus = \"upgrading\";\r\n                //deferred.notify(\"onupgradeneeded started\");\r\n                var db = dbOpenRequest.result;\r\n                db.onerror = function (event) {\r\n                    reject(Error(\"Error opening database \"));\r\n                };\r\n                db.onabort = function (event) {\r\n                    reject(\"Database opening aborted\");\r\n                };\r\n                // Create a store (table) for each table definition provided\r\n                tableDefs.forEach(function (tblDef) {\r\n                    //deferred.notify(\"Creating store \" + tblDef.TableName);\r\n                    self.BuildStore(db, tblDef.TableName, tblDef.ColNames, tblDef.PkColName, tblDef.AddIsModifiedCol);\r\n                    //deferred.notify(\"Created store \" + tblDef.TableName);\r\n                });\r\n                self.OpenDbRequestStatus = \"ok\";\r\n                //deferred.notify(\"dbOpenRequest.onupgradeneeded completed\");\r\n                dbOpenRequest.result.close();\r\n                //resolve(true);\r\n            };\r\n            dbOpenRequest.onsuccess = function (event) {\r\n                if (self.OpenDbRequestStatus == \"ok\") {\r\n                    //deferred.notify(\"dbOpenRequest.onsuccess - ok\");\r\n                    dbOpenRequest.result.close();\r\n                    resolve(true);\r\n                }\r\n                else {\r\n                    //deferred.notify(\"dbOpenRequest.onsuccess - upgrading\");\r\n                }\r\n            };\r\n            dbOpenRequest.onerror = function (event) {\r\n                reject(\"dbOpenRequest.onerror \" + event);\r\n            };\r\n            dbOpenRequest.onblocked = function (event) {\r\n                reject(\"dbOpenRequest.onblocked \" + event);\r\n            };\r\n        });\r\n    };\r\n    IdxDbSvc.prototype.BuildStore = function (db, tblName, colNames, pkColName, addIsModifiedCol) {\r\n        if (!colNames || !colNames.length || colNames[0] == null) {\r\n            alert(\"No column data found for table \" + tblName);\r\n            //deferred.notify(\"No column data found for table \" + tblName);\r\n            return;\r\n        }\r\n        var self = this;\r\n        var indexesToCreate = [];\r\n        var isPkCol = false;\r\n        var createStoreOptions = {\r\n            keyPath: \"\",\r\n            autoIncrement: false\r\n        };\r\n        colNames.forEach(function (colName) {\r\n            if (colName === pkColName) {\r\n                isPkCol = true;\r\n            }\r\n            else {\r\n                isPkCol = false;\r\n            }\r\n            if (isPkCol) {\r\n                // Only create indexes for PK columns\r\n                indexesToCreate.push(new CreateDbIndexArgs_1.CreateDbIndexArgs(colName, colName, { unique: isPkCol, multiEntry: false }));\r\n            }\r\n            if (colName === pkColName) {\r\n                createStoreOptions.keyPath = colName;\r\n            }\r\n            createStoreOptions.autoIncrement = false;\r\n        });\r\n        if (addIsModifiedCol) {\r\n            self.AddIsModifiedColumn(indexesToCreate);\r\n        }\r\n        var store = db.createObjectStore(tblName, createStoreOptions);\r\n        indexesToCreate.forEach(function (dbIdxArgs) {\r\n            store.createIndex(dbIdxArgs.IndexName, dbIdxArgs.KeyPath, dbIdxArgs.OptionalParameters);\r\n        });\r\n    };\r\n    IdxDbSvc.prototype.GetStoreNames = function (dbName, dbVersion) {\r\n        var self = this;\r\n        var dbOpenRequest = self.IdxDbEnv.open(dbName, dbVersion);\r\n        return new Promise(function (resolve, reject) {\r\n            dbOpenRequest.onsuccess = function (ev /*Event*/) {\r\n                var db = ev.target.result;\r\n                resolve(db.objectStoreNames);\r\n                dbOpenRequest.result.close();\r\n            };\r\n            dbOpenRequest.onerror = function (event) {\r\n                reject(Error(\"Error opening database\"));\r\n            };\r\n            dbOpenRequest.onblocked = function (event) {\r\n                reject(Error(\"Database opening blocked\"));\r\n            };\r\n        });\r\n    };\r\n    IdxDbSvc.prototype.DeleteDb = function (dbName) {\r\n        var _this = this;\r\n        return new Promise(function (resolve, reject) {\r\n            var dbDeleteRequest = _this.IdxDbEnv.deleteDatabase(dbName);\r\n            dbDeleteRequest.onerror = function (event) {\r\n                reject(Error(event.type));\r\n            };\r\n            dbDeleteRequest.onblocked = function (event) {\r\n                reject(Error(event.type));\r\n                event.target.result.close();\r\n                console.log(\"blocked\");\r\n            };\r\n            dbDeleteRequest.onupgradeneeded = function (event) {\r\n                reject(Error(event.type));\r\n            };\r\n            dbDeleteRequest.onsuccess = function (event) {\r\n                resolve(true);\r\n            };\r\n        });\r\n    };\r\n    ;\r\n    return IdxDbSvc;\r\n}());\r\nexports.IdxDbSvc = IdxDbSvc;\r\n//# sourceMappingURL=IdxDbSvc.js.map"
  ]
}