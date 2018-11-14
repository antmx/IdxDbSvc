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
//# sourceMappingURL=IdxDbSvc_spec.js.map