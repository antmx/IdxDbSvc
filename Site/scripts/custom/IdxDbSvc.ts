/// <reference path="../jquery/jquery.d.ts" />
/// <reference path="dbtabledef.ts" />

class IdxDbSvc {

    $: JQueryStatic; // todo - create interfaces to mimick the parts of jquery used within IdxDbSvc ??
    IdxDbEnv: IDBFactory;
    OpenDbRequestStatus: string;

    public constructor($: JQueryStatic, idxDbEnv: IDBFactory) {

        this.$ = $;
        this.IdxDbEnv = idxDbEnv;
    }

    public CreateDb(dbName: string, dbVersion: number, tableDefs: Array<DbTableDef>): JQueryPromise<boolean> {

        var self = this;
        var deferred: JQueryDeferred<boolean> = self.$.Deferred();

        deferred.notify("Opening database...");

        var dbOpenRequest: IDBOpenDBRequest = self.IdxDbEnv.open(dbName, dbVersion);

        dbOpenRequest.onupgradeneeded = function (event: IDBVersionChangeEvent) {

            self.OpenDbRequestStatus = "upgrading";
            deferred.notify("onupgradeneeded started");

            var db: IDBDatabase = dbOpenRequest.result;

            db.onerror = function (event: Event) {

                deferred.reject("Error opening database");
            };

            db.onabort = function (event: Event) {

                deferred.reject("Database opening aborted");
            };

            // Create a store (table) for each server table
            self.$.each(tableDefs, (idx, tblDef) => {

                deferred.notify("Creating store " + tblDef.TableName);

                self.BuildStore(db, tblDef.TableName, tblDef.ColNames, tblDef.PkColName, tblDef.AddIsModifiedCol);

                deferred.notify("Created store " + tblDef.TableName);
            });

            tableDefs.forEach((tblDef: DbTableDef, index: number) => {

                deferred.notify("Creating store " + tblDef.TableName);

                self.BuildStore(db, tblDef.TableName, tblDef.ColNames, tblDef.PkColName, tblDef.AddIsModifiedCol);

                deferred.notify("Created store " + tblDef.TableName);
            });

            self.OpenDbRequestStatus = "ok";
            deferred.notify("dbOpenRequest.onupgradeneeded completed");
            deferred.resolve(true);
        };

        dbOpenRequest.onsuccess = function (event: Event) {

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
    }

    private BuildStore(db: IDBDatabase, tblName: string, colNames: string[], pkColName: string, addIsModifiedCol): void {

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

        self.$.each(colNames, function (k, colName) {

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

        self.$.each(indexesToCreate, function (key, args) {
            store.createIndex(args.IndexName, args.KeyPath, args.OptionalParameters);
        });
    };

    private AddIsModifiedColumn = function (indexArray): void {

        indexArray.push(
            new CreateDbIndexArgs("IsModified", "IsModified", { unique: false, multiEntry: false })
        );
    };

    public GetStoreNames(dbName: string, dbVersion: number): JQueryPromise<DOMStringList> {

        var self = this;
        var dbOpenRequest: IDBOpenDBRequest = self.IdxDbEnv.open(dbName, dbVersion);
        var deferred = self.$.Deferred();

        dbOpenRequest.onsuccess = function (ev: any /*Event*/) {

            var db: IDBDatabase = ev.target.result;

            deferred.resolve(db.objectStoreNames);
        };

        dbOpenRequest.onerror = function (event: Event) {

            deferred.reject("Error opening database");
        };

        dbOpenRequest.onblocked = function (event: Event) {

            deferred.reject("Database opening blocked");
        };

        return deferred.promise();
    }

    public DeleteDb(dbName: string): JQueryPromise<boolean> {

        var deferred = this.$.Deferred();
        var dbDeleteRequest = this.IdxDbEnv.deleteDatabase(dbName);

        dbDeleteRequest.onerror = function (event: Event) {
            deferred.reject();
        };

        dbDeleteRequest.onsuccess = function (event: Event) {
            deferred.resolve();
        };

        return deferred.promise();
    };

}