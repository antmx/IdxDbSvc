/// <reference path="../../jasmine/jasmine.d.ts" />
/// <reference path="../idxdbsvc.ts" />

import { CreateDbIndexArgs } from "../CreateDbIndexArgs";
import { DbTableDef } from "../DbTableDef";
import { IdxDbSvc } from "../IdxDbSvc";

describe("IdxDbSvc", () => {

    var svc: IdxDbSvc;
    var originalTimeout: number;

    beforeEach((done: Function) => {

        //    console.log("beforeEach - increasing timeout");
        //    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        //    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

        console.log("beforeEach - deleting db");

        svc = new IdxDbSvc(window.indexedDB);

        svc.DeleteDb("DBName")
            .then((result) => {
                expect(result).toBeTruthy();
                done();
            })
            .catch((failReason) => {
                console.error(failReason);
                expect(false).toBeTruthy();
                done();
            });
    });

    //afterEach(() => {

    //    console.log("restoring timeout");
    //    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    //});

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

                    expect(result).toEqual(true);

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

    describe("DeleteDb", () => {
        it("Deletes a database", (done: Function) => {

            console.log("DeleteDb - creating db to be deleted");

            svc.CreateDb("DBName", 1, [new DbTableDef("tblFoo", ["FooCol1", "FooCol2"], "FooCol1", true)])
                .then((createResult) => {

                    console.log("DeleteDb - It deletes a database - creating db - result %s", createResult);

                    if (createResult) {

                        svc.DeleteDb("DBName").then((deleteResult) => {

                            console.log("DeleteDb - It deletes a database - deleting db - result %s", deleteResult);

                            expect(deleteResult).toEqual(true);

                            done();
                        });

                    }
                    else {
                        console.error("CreateDb result was %s", createResult);
                    }

                }).catch((failReason) => {

                    console.error("DeleteDb - It deletes a database - creating db failed: %s", failReason);

                    done();
                });
        });

    });
});
