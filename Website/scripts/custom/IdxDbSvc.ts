/// <reference path="dbtabledef.ts" />

import { DbTableDef } from "./DbTableDef";
import { CreateDbIndexArgs } from "./CreateDbIndexArgs";

export class IdxDbSvc {

    IdxDbEnv: IDBFactory;
    OpenDbRequestStatus: string | undefined;

    public constructor(idxDbEnv: IDBFactory) {

        this.IdxDbEnv = idxDbEnv;
    }

    public CreateDb(dbName: string, dbVersion: number, tableDefs: Array<DbTableDef>): Promise<boolean>  {

        var self = this;

        return new Promise(function (resolve, reject) {

            var dbOpenRequest: IDBOpenDBRequest = self.IdxDbEnv.open(dbName, dbVersion);

            dbOpenRequest.onupgradeneeded = function (event: IDBVersionChangeEvent) {

                console.log("onupgradeneeded");

                self.OpenDbRequestStatus = "upgrading";
                //deferred.notify("onupgradeneeded started");

                var db: IDBDatabase = dbOpenRequest.result;

                db.onerror = (event: Event) => {

                    reject(Error("Error opening database "));
                };

                db.onabort = (event: Event) => {

                    reject("Database opening aborted");
                };

                // Create a store (table) for each table definition provided
                tableDefs.forEach((tblDef: DbTableDef) => {

                    //deferred.notify("Creating store " + tblDef.TableName);

                    self.BuildStore(db, tblDef.TableName, tblDef.ColNames, tblDef.PkColName, tblDef.AddIsModifiedCol);

                    //deferred.notify("Created store " + tblDef.TableName);
                });

                self.OpenDbRequestStatus = "ok";
                //deferred.notify("dbOpenRequest.onupgradeneeded completed");
                dbOpenRequest.result.close();
                resolve(true);
            };

            dbOpenRequest.onsuccess = function (event: Event) {

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

    }

    private BuildStore(db: IDBDatabase, tblName: string, colNames: string[], pkColName: string, addIsModifiedCol:boolean): void {

        if (!colNames || !colNames.length || colNames[0] == null) {
            alert("No column data found for table " + tblName);
            //deferred.notify("No column data found for table " + tblName);
            return;
        }

        var self = this;
        var indexesToCreate: CreateDbIndexArgs[] = [];
        var isPkCol = false;
        var createStoreOptions = {
            keyPath: "",
            autoIncrement: false
        };

        colNames.forEach((colName) => {

            if (colName === pkColName) {
                isPkCol = true;
            }
            else {
                isPkCol = false;
            }

            if (isPkCol) {
                // Only create indexes for PK columns
                indexesToCreate.push(
                    new CreateDbIndexArgs(colName, colName, { unique: isPkCol, multiEntry: false })
                );
            }

            if (colName === pkColName) {
                createStoreOptions.keyPath = colName;
            }

            createStoreOptions.autoIncrement = false;
        });

        if (addIsModifiedCol) {
            self.AddIsModifiedColumn(indexesToCreate);
        }

        var store: IDBObjectStore = db.createObjectStore(tblName, createStoreOptions);

        indexesToCreate.forEach((dbIdxArgs) => {

            store.createIndex(dbIdxArgs.IndexName, dbIdxArgs.KeyPath, dbIdxArgs.OptionalParameters);
        });
    }

    private AddIsModifiedColumn = function (indexArray: CreateDbIndexArgs[]): void {

        indexArray.push(
            new CreateDbIndexArgs("IsModified", "IsModified", { unique: false, multiEntry: false })
        );
    };

    public GetStoreNames(dbName: string, dbVersion: number): Promise<DOMStringList> {

        var self = this;
        var dbOpenRequest: IDBOpenDBRequest = self.IdxDbEnv.open(dbName, dbVersion);

        return new Promise(function (resolve, reject) {

            dbOpenRequest.onsuccess = function (ev: any /*Event*/) {

                var db: IDBDatabase = ev.target.result;

                resolve(db.objectStoreNames);

                dbOpenRequest.result.close();
            };

            dbOpenRequest.onerror = function (event: Event) {

                reject(Error("Error opening database"));
            };

            dbOpenRequest.onblocked = function (event: Event) {

                reject(Error("Database opening blocked"));
            };

        });

    }

    public DeleteDb(dbName: string): Promise<boolean> {

        return new Promise((resolve, reject) => {
            
            var dbDeleteRequest = this.IdxDbEnv.deleteDatabase(dbName);

            dbDeleteRequest.onerror = function (event: Event) {

                reject(Error(event.type));
            };

            dbDeleteRequest.onblocked = function (event: Event) {

                reject(Error(event.type));
                (event.target as any).result.close();
                console.log("blocked");
            };

            dbDeleteRequest.onupgradeneeded = function (event: Event) {

                reject(Error(event.type));
            };

            dbDeleteRequest.onsuccess = function (event: Event) {

                resolve(true);
            };

        });
    };

    
}
