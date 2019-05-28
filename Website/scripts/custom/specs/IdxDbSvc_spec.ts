/// <reference path="../../jasmine/jasmine.d.ts" />
/// <reference path="../idxdbsvc.ts" />

import { CreateDbIndexArgs } from "../CreateDbIndexArgs";
import { DbTableDef } from "../DbTableDef";
import { IdxDbSvc } from "../IdxDbSvc";

describe("IdxDbSvc", () => {

    var isDbCreated = false;
    var svc: IdxDbSvc;
    var originalTimeout: number;

    beforeEach((done: Function) => {

        //    console.log("beforeEach - increasing timeout");
        //    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        //    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

        if (!isDbCreated) {

            console.log("beforeEach - deleting db");

            svc = new IdxDbSvc(window.indexedDB);

            svc.DeleteDb("DBName")
                .then((result) => {
                    expect(result).toBeTruthy();
                    isDbCreated = true;
                    done();
                })
                .catch((failReason) => {
                    console.error(failReason);
                    done();
                });
        }
        else {
            //done();
            setInterval(done, 1000);
        }
    });

    describe("constructor", () => {

        it("sets up the properties from the args", (done: Function) => {

            expect(svc.IdxDbEnv).toBeDefined();

            done();
        });
    });

    describe("CreateDb", () => {

        it("Creates a database", (done: Function) => {

            var tblDefs: DbTableDef[] = [];
            tblDefs.push(new DbTableDef("tblFoo", ["FooCol1", "FooCol2"], "FooCol1", true));
            tblDefs.push(new DbTableDef("tblBar", ["BarCol1", "BarCol2", "BarCol3"], "BarCol1", false));

            svc.CreateDb("DBName", 1, tblDefs)
                .then((result) => {

                    expect(result).toBeTruthy();

                    svc.GetStoreNames("DBName", 1)
                        .then((objectStoreNames) => {

                            expect(objectStoreNames).toBeDefined();
                            expect(objectStoreNames.length).toEqual(2);
                            expect(objectStoreNames[0]).toEqual("tblBar");
                            expect(objectStoreNames[1]).toEqual("tblFoo");

                            done();
                        });
                })
                .catch((err) => {
                    console.error(err);
                })

        });
    });

    describe("Query", () => {
        it("Retrieves all rows", (done: Function) => {

            svc.Query("DBName", "tblFoo").then((results: any[]) => {

                expect(results.length).toEqual(0);

                done();
            });
        });

        it("Retrieves all matching rows", (done: Function) => {

            var prom1 = svc.Store("DBName", "tblFoo", { FooCol1: 1, FooCol2: "one" });
            var prom2 = svc.Store("DBName", "tblFoo", { FooCol1: 2, FooCol2: "two" });
            var prom3 = svc.Store("DBName", "tblFoo", { FooCol1: 3, FooCol2: "three" });

            Promise.all([prom1, prom2, prom3]).then(() => {

                svc.Query("DBName", "tblFoo", (itm) => { return itm.FooCol1 <= 2; }).then((results: any[]) => {

                    expect(results.length).toEqual(2);

                    done();
                });

            });

        });

        it("Retrieves all matching rows and transforms the results", (done: Function) => {

            svc.Query("DBName", "tblFoo", (itm) => { return itm.FooCol1 <= 2; }, (itm) => { return itm.FooCol2; }).then((results: any[]) => {

                expect(results.length).toEqual(2);
                expect(results[0]).toEqual("one");
                expect(results[1]).toEqual("two");

                done();
            });

        });

    });
    
    describe("DeleteDb", () => {
        it("Deletes a database", (done: Function) => {

            console.log("DeleteDb - creating db to be deleted");

            svc.DeleteDb("DBName").then((deleteResult) => {

                console.log("DeleteDb - It deletes a database - deleting db - result %s", deleteResult);

                expect(deleteResult).toBeTruthy();

                done();

            }).catch((error) => {

                console.error(error);

            });

        });

    });

});
