/// <reference path="../../jasmine/jasmine.d.ts" />
/// <reference path="../idxdbsvc.ts" />

import { CreateDbIndexArgs } from "../CreateDbIndexArgs";
import { DbTableDef } from "../DbTableDef";
import { IdxDbSvc } from "../IdxDbSvc";

describe("IdxDbSvc", () => {

    var svc: IdxDbSvc;

    beforeEach((done: Function) => {

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

    describe("constructor", () => {

        it("sets up the properties from the args", (done: Function) => {

            //expect(svc.$).toBeDefined();
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
                            debugger;
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

    //describe("DeleteDb", () => {
    //    it("Deletes a database", (done) => {

    //    });

    //});
});
