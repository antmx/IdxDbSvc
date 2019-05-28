"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CreateDbIndexArgs_1 = require("./CreateDbIndexArgs");
var Misc_1 = require("./Misc");
var Misc_2 = require("./Misc");
var Misc_3 = require("./Misc");
var Misc_4 = require("./Misc");
var Misc_5 = require("./Misc");
var Misc_6 = require("./Misc");
/** IndexedDB Service */
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
                //console.log("onupgradeneeded");
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
                //dbOpenRequest.result.close();
                event.target.result.close();
                resolve(true);
            };
            dbOpenRequest.onsuccess = function (event) {
                if (self.OpenDbRequestStatus == "ok") {
                    //deferred.notify("dbOpenRequest.onsuccess - ok");
                    //dbOpenRequest.result.close();
                    event.target.result.close();
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
    IdxDbSvc.prototype.GetStoreNames = function (dbName, dbVersion) {
        var self = this;
        return new Promise(function (resolve, reject) {
            var dbOpenRequest = self.IdxDbEnv.open(dbName, dbVersion);
            dbOpenRequest.onsuccess = function (ev /*Event*/) {
                var db = ev.target.result;
                resolve(db.objectStoreNames);
                //dbOpenRequest.result.close();
                ev.target.result.close();
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
        var self = this;
        return new Promise(function (resolve, reject) {
            var dbDeleteRequest = self.IdxDbEnv.deleteDatabase(dbName);
            dbDeleteRequest.onerror = function (event) {
                reject(Error(event.type));
            };
            dbDeleteRequest.onblocked = function (event) {
                reject(Error(event.type));
                event.target.result.close();
                console.error("blocked");
            };
            dbDeleteRequest.onupgradeneeded = function (event) {
                reject(Error(event.type));
            };
            dbDeleteRequest.onsuccess = function (event) {
                resolve(true);
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
    /**
     * Searches for records.
     * @param dbName The name of the database containing dbTableName.
     * @param dbTableName The name of the table to search in.
     * @param filterFn Optional filter function.
     * @param transformFn Optional transformation function.
     * @param orderBy Optional ordering function, field name or array of field names.
     * @param returnFirstItemOnly Optional flag stating if only the first matching item should be returned.
     */
    IdxDbSvc.prototype.Query = function (dbName, dbTableName, filterFn, transformFn, orderBy, returnFirstItemOnly) {
        var self = this;
        return new Promise(function (resolve, reject) {
            var callBackFunction = function (resultItems, errorMsg) {
                if (!Misc_1.StrIsNullOrEmpty(errorMsg)) {
                    reject(errorMsg);
                    return;
                }
                // filterFn should be something like
                // function (elementOfArray[, indexInArray]) { return elementOfArray.pr_Deleted == "False"; })
                // transformFn should be something like
                // function (valueOfElement) { return new Genus.PriceMatrixRule(valueOfElement); }
                // Apply filter
                if (typeof filterFn === "function") {
                    resultItems = Misc_2.Grep(resultItems, filterFn);
                }
                // Apply transform to each element
                if (typeof transformFn === "function") {
                    var transformed;
                    resultItems.forEach(function (valueOfElement /*: any*/, indexInArray) {
                        transformed = transformFn.call(null, valueOfElement);
                        resultItems[indexInArray] = transformed;
                    });
                }
                // Sort
                if (orderBy != null) {
                    self.SortResultItems(resultItems, orderBy);
                }
                if (returnFirstItemOnly) {
                    // Return just the first result item
                    var first = resultItems[0];
                    resolve(first);
                }
                else {
                    resolve(resultItems);
                }
            };
            var openDbRequest = self.IdxDbEnv.open(dbName);
            openDbRequest.onsuccess = function (event) {
                try {
                    var db = event.target.result;
                    var trans = db.transaction(dbTableName, "readonly");
                    //if (trans) {
                    trans.oncomplete = function (evt /*Event*/) {
                        //db.close();
                        evt.target.result.close();
                        trans.db.close();
                    };
                    trans.onabort = function (evt /*Event*/) {
                        var storeName = "", keyPath = "", error = "";
                        //try {
                        if (evt && evt.target) {
                            if (evt.target.source) {
                                storeName = evt.target.source.name;
                                keyPath = evt.target.source.keyPath;
                            }
                            error = evt.target.error;
                        }
                        //} catch (e) {
                        //}
                        console.error("DbQuerySvc.Query transaction abort at " + storeName + "." + keyPath + ": " + error);
                        //db.close();
                        evt.target.result.close();
                    };
                    trans.onerror = function (evt /*Event*/) {
                        var storeName = "", keyPath = "", error = "";
                        //try {
                        if (evt && evt.target) {
                            if (evt.target.source) {
                                storeName = evt.target.source.name;
                                keyPath = evt.target.source.keyPath;
                            }
                            error = evt.target.error;
                        }
                        //} catch (e) {
                        //}
                        console.error("DbQuerySvc.Query transaction error at " + storeName + "." + keyPath + ": " + error);
                        //db.close();
                        evt.target.result.close();
                    };
                    var objectStore = trans.objectStore(dbTableName);
                    var index = null;
                    //if (indexName) {
                    //    try {
                    //        index = objectStore.index(indexName);
                    //    }
                    //    catch (e) {
                    //    }
                    //}
                    var range = null;
                    //if (keyRange) {
                    //    try {
                    //        range = IDBKeyRange.only(keyRange);
                    //    } catch (e) {
                    //    }
                    //}
                    //var cursorRequest: IDBRequest;
                    //if (index && range) {
                    //    cursorRequest = index.openCursor(range);
                    //}
                    //else if (index) {
                    //    cursorRequest = index.openCursor();
                    //}
                    //else if (range) {
                    //    cursorRequest = objectStore.openCursor(range);
                    //}
                    //else {
                    //    cursorRequest = objectStore.openCursor();
                    //}
                    var cursorRequest = objectStore.openCursor();
                    var results = [];
                    cursorRequest.onsuccess = function (evt /*Event*/) {
                        //var cursor = cursorRequest.result;
                        var cursor /*: IDBCursor*/ = evt.target.result;
                        if (cursor) {
                            results.push(cursor.value);
                            cursor.continue();
                        }
                        else if (typeof callBackFunction === "function") {
                            callBackFunction.call(null, results /*, callBackArgs*/);
                            trans.db.close();
                        }
                    };
                    //}
                }
                catch (e) {
                    console.error(dbTableName + " table; " + e.name + "; " + e.message);
                    if (typeof callBackFunction === "function") {
                        callBackFunction.call(null, null, e.name /*, callBackArgs*/);
                        //dbOpenRequest.result.close();
                    }
                }
            };
            openDbRequest.onblocked = function (evt /*: Event*/) {
                console.error(evt);
            };
            openDbRequest.onerror = function (evt /*: Event*/) {
                console.error(evt);
            };
        });
    };
    IdxDbSvc.prototype.SortResultItems = function (resultIems, orderBy) {
        // Sort
        if (orderBy != null) {
            if (typeof orderBy === "function") {
                resultIems.sort(orderBy);
            }
            else if (typeof orderBy === "string") {
                var fnSort = function (item1, item2) {
                    return Misc_4.SortByStringField(orderBy, item1, item2);
                };
                resultIems.sort(fnSort);
            }
            else if (Misc_5.IsArray(orderBy)) {
                resultIems.sort(Misc_3.SortByMany(orderBy));
            }
        }
    };
    /**
     * Saves data to the given object store.
     * @param {string} dbName The IndexedDB database name.
     * @param {string} dbTable The IndexedDB store/table name.
     * @param {object|array} dbData The single item or the array of items to save.
     * @returns {Promise} Returns a Promise that is resolved when the async store operation completes.
     */
    IdxDbSvc.prototype.Store = function (dbName, dbTable, dbData) {
        var self = this;
        return new Promise(function (resolve, reject) {
            var openDbRequest = self.IdxDbEnv.open(dbName);
            openDbRequest.onsuccess = function (evt) {
                try {
                    var db = evt.target.result;
                    var tx = db.transaction(dbTable, "readwrite");
                    var store = tx.objectStore(dbTable);
                    // Check for array of items to store
                    if (Misc_5.IsArray(dbData)) {
                        // Array of items to store
                        dbData.forEach(function (dataItem) {
                            try {
                                // Use put versus add to always write, even if exists
                                //console.log("Putting item index " + idx + " into " + dbTable + "...");
                                store.put(dataItem);
                            }
                            catch (e) {
                                console.error("Error putting data for " + dbTable + " - " + e);
                            }
                        });
                    }
                    else {
                        // Single item to store
                        // Use put versus add to always write, even if exists
                        store.put(dbData);
                    }
                    tx.oncomplete = function (evt) {
                        resolve(); // Signal success
                    };
                    tx.onerror = function (evt) {
                        console.error(evt);
                        console.error(dbTable);
                        var storeName = "", keyPath = "", error = "";
                        try {
                            if (evt && evt.target) {
                                if (evt.target.source) {
                                    storeName = evt.target.source.name;
                                    keyPath = evt.target.source.keyPath;
                                }
                                error = evt.target.error;
                            }
                        }
                        catch (e) {
                        }
                        console.error("DbQuerySvc.Store transaction abort at " + storeName + "." + keyPath + ": " + error);
                        alert("Tx error in Store for table " + dbTable + " " + error); //Temporary alert until sort out what to do with error here
                        reject("Store tx error"); // Signal error
                    };
                    tx.onabort = function (evt) {
                        var errorName = "";
                        try {
                            if (evt && evt.target) {
                                errorName = evt.target.error;
                            }
                        }
                        catch (e) {
                        }
                        console.error(evt);
                        console.error(dbTable);
                        alert("Tx aborted in Store for table " + dbTable + " " + errorName); //Temporary alert until sort out what to do with error here
                        reject("Store tx aborted"); // Signal error
                    };
                }
                catch (e) {
                    console.error(e);
                    console.error(dbTable);
                    alert("Error in Store"); //Temporary alert until sort out what to do with error here
                    reject("Store db open exception"); // Signal error
                }
            };
            openDbRequest.onblocked = function (evt) {
                console.error(evt);
                alert("Error in Load onblocked"); //Temporary alert until sort out what to do with error here    
                reject("Store db open onblocked"); // Signal error
            };
            openDbRequest.onerror = function (evt) {
                console.error(evt);
                alert("Error in Load request onerror"); //Temporary alert until sort out what to do with error here
                reject("Store db open onerror"); // Signal error
            };
        });
    };
    /**
     * Deletes from given store the rows whose primary-key index value matches one of the specified values. Returns a Promise which handles the async operation.
     * @param {string} dbName The IndexedDB database name.
     * @param {string} dbTable The IndexedDB store/table name.
     * @param {any|array<any>} primaryKeyVals A single, or array of, primary key values identifying the rows to delete.
     * @returns {promise} Promise that is resolved when the async store operation completes.
     */
    IdxDbSvc.prototype.Delete = function (dbName, dbTable, /*indexName,*/ primaryKeyVals) {
        return new Promise(function (resolve, reject) {
            var openDbRequest = window.indexedDB.open(dbName);
            openDbRequest.onsuccess = function (evt) {
                try {
                    var db = evt.target.result;
                    var tx = db.transaction(dbTable, "readwrite");
                    var store = tx.objectStore(dbTable);
                    //var index = store.index(indexName);
                    //var delReq;
                    if (!Misc_5.IsArray(primaryKeyVals)) {
                        // Make array of 1 item
                        primaryKeyVals = [primaryKeyVals];
                    }
                    // Delete the row for each key
                    //$.each(primaryKeyVals, function (idx, keyVal) {
                    //    store.delete(keyVal);
                    //});
                    for (var keyVal in primaryKeyVals) {
                        store.delete(keyVal);
                    }
                    tx.oncomplete = function (evt) {
                        resolve(); // Signal success
                    };
                    tx.onerror = function (evt) {
                        console.error(evt);
                        alert("Error in Delete onerror");
                        reject(Error("Delete tx error")); // Signal error
                    };
                    tx.onabort = function (evt) {
                        console.error(evt);
                        alert("Error in Delete abort");
                        reject(Error("Delete tx aborted")); // Signal error
                    };
                }
                catch (e) {
                    console.error("Delete - error deleting from " + dbTable + " - " + e);
                    alert("Error in Delete for table " + dbTable);
                    reject(e);
                }
            };
            openDbRequest.onblocked = function (evt) {
                console.error(evt);
                alert("Error in Delete, openDbRequest.onblocked " + evt); //Temporary alert until sort out what to do with error here
                reject(Error("Delete db open onblocked")); // Signal error
            };
            openDbRequest.onerror = function (evt) {
                console.error(evt);
                alert("Error in Delete, openDbRequest.onerror " + evt); //Temporary alert until sort out what to do with error here
                reject(Error("Delete db open onerror")); // Signal error
            };
        });
    };
    /**
     * Updates an existing record or records.
     * @param {string} dbName The IndexedDB database name.
     * @param {string} dbTableName The IndexedDB store/table name.
     * @param {string|array<string>|function} primaryKeyValsOrFilterFn A single, or array of, primary key values identifying the rows to update, or a function describing which rows to update.
     * @param {object} updateObj An object describing the fields and values to update.
     * @returns {promise} Returns a promise indicating the number of rows updates, that is resolved when the async store operation completes.
    */
    IdxDbSvc.prototype.Update = function (dbName, dbTableName, primaryKeyValsOrFilterFn, updateObj) {
        var self = this;
        return new Promise(function (resolve, reject) {
            if (typeof primaryKeyValsOrFilterFn === "function") {
                ProceedWithUpdate(primaryKeyValsOrFilterFn);
            }
            else {
                self.GetPrimaryKeyName(dbName, dbTableName)
                    .then(function (pkName) {
                    if (typeof primaryKeyValsOrFilterFn === "string") {
                        // Make array of single pk value
                        primaryKeyValsOrFilterFn = [primaryKeyValsOrFilterFn];
                    }
                    // Build filter function
                    var filterFn = function (dbItem) {
                        return Misc_6.StringArrayContains(primaryKeyValsOrFilterFn, dbItem[pkName]);
                    };
                    ProceedWithUpdate(filterFn);
                })
                    .catch(function (failReason) {
                    reject("Update failed for " + dbTableName + "; " + failReason);
                });
            }
            /**
             * Continues the update operation.
             * @param {any} filterFn A function describing which rows to update.
             */
            function ProceedWithUpdate(filterFn) {
                // Find the records to update
                self.Query(dbName, dbTableName, filterFn)
                    .then(function (itemsToUpdate) {
                    if (itemsToUpdate && itemsToUpdate.length > 0) {
                        // Update the matching records
                        $.each(itemsToUpdate, function (idx, item) {
                            itemsToUpdate[idx] = $.extend(itemsToUpdate[idx], updateObj);
                        });
                        // Store in db again
                        self.Store(dbName, dbTableName, itemsToUpdate)
                            .then(function () {
                            // Indicate success and number of rows updated
                            resolve(itemsToUpdate.length);
                        })
                            .catch(function (failReason) {
                            reject("Update failed for " + dbTableName + "; " + failReason);
                        });
                    }
                    else {
                        // Indicate success but zero rows updated
                        resolve(0);
                    }
                })
                    .catch(function (failReason) {
                    reject("Update failed for " + dbTableName + "; " + failReason);
                });
            }
        });
    };
    IdxDbSvc.prototype.GetPrimaryKeyName = function (dbName, dbTableName) {
        return new Promise(function (resolve, reject) {
            var openDbRequest = indexedDB.open(dbName);
            openDbRequest.onsuccess = function (event) {
                try {
                    var db = event.target.result;
                    var trans = db.transaction(dbTableName, "readonly");
                    var primaryKey;
                    if (trans) {
                        trans.oncomplete = function () {
                            db.close();
                            if (primaryKey) {
                                resolve(primaryKey);
                            }
                            else {
                                reject(Error("PK not found for " + dbTableName));
                            }
                        };
                        trans.onabort = function (evt) {
                            var storeName = "", keyPath = "", error = "";
                            if (evt && evt.target) {
                                if (evt.target.source) {
                                    storeName = evt.target.source.name;
                                    keyPath = evt.target.source.keyPath;
                                }
                                error = evt.target.error;
                            }
                            var msg = "DbQuerySvc.GetPrimaryKeyName transaction abort at " + storeName + "." + keyPath + ": " + error;
                            console.error(msg);
                            db.close();
                            reject(Error("onabort " + msg));
                        };
                        trans.onerror = function (evt) {
                            var storeName = "", keyPath = "", error = "";
                            if (evt && evt.target) {
                                if (evt.target.source) {
                                    storeName = evt.target.source.name;
                                    keyPath = evt.target.source.keyPath;
                                }
                                error = evt.target.error;
                            }
                            db.close();
                            var msg = "DbQuerySvc.GetPrimaryKeyName transaction error at " + storeName + "." + keyPath + ": " + error;
                            console.error(msg);
                            reject(Error("onerror " + msg));
                        };
                        var objectStore /*: IDBObjectStore*/ = trans.objectStore(dbTableName);
                        if (objectStore.indexNames != null) {
                            primaryKey = objectStore.indexNames[0];
                        }
                    }
                }
                catch (e) {
                    console.error(dbTableName + " table; " + e.name + "; " + e.message);
                    reject(Error("Error getting pk names for " + dbTableName + "; " + e.name + "; " + e.message));
                }
            };
            openDbRequest.onblocked = function (evt /*: Event*/) {
                console.error(evt);
                reject(Error("onblocked"));
            };
            openDbRequest.onerror = function (evt /*: Event*/) {
                console.error(evt);
                reject(Error("onerror"));
            };
        });
    };
    return IdxDbSvc;
}());
exports.IdxDbSvc = IdxDbSvc;
//# sourceMappingURL=IdxDbSvc.js.map