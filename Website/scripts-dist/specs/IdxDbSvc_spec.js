"use strict";
/// <reference path="../../jasmine/jasmine.d.ts" />
/// <reference path="../idxdbsvc.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
var DbTableDef_1 = require("../DbTableDef");
var IdxDbSvc_1 = require("../IdxDbSvc");
describe("IdxDbSvc", function () {
    var isDbCreated = false;
    var svc;
    var originalTimeout;
    beforeEach(function (done) {
        //    console.log("beforeEach - increasing timeout");
        //    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        //    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        if (!isDbCreated) {
            console.log("beforeEach - deleting db");
            svc = new IdxDbSvc_1.IdxDbSvc(window.indexedDB);
            svc.DeleteDb("DBName")
                .then(function (result) {
                expect(result).toBeTruthy();
                isDbCreated = true;
                done();
            })
                .catch(function (failReason) {
                console.error(failReason);
                done();
            });
        }
        else {
            //done();
            setInterval(done, 1000);
        }
    });
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
                expect(result).toBeTruthy();
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
    describe("Query", function () {
        it("Retrieves all rows", function (done) {
            svc.Query("DBName", "tblFoo").then(function (results) {
                expect(results.length).toEqual(0);
                done();
            });
        });
        it("Retrieves all matching rows", function (done) {
            var prom1 = svc.Store("DBName", "tblFoo", { FooCol1: 1, FooCol2: "one" });
            var prom2 = svc.Store("DBName", "tblFoo", { FooCol1: 2, FooCol2: "two" });
            var prom3 = svc.Store("DBName", "tblFoo", { FooCol1: 3, FooCol2: "three" });
            Promise.all([prom1, prom2, prom3]).then(function () {
                svc.Query("DBName", "tblFoo", function (itm) { return itm.FooCol1 <= 2; }).then(function (results) {
                    expect(results.length).toEqual(2);
                    done();
                });
            });
        });
        it("Retrieves all matching rows and transforms the results", function (done) {
            svc.Query("DBName", "tblFoo", function (itm) { return itm.FooCol1 <= 2; }, function (itm) { return itm.FooCol2; }).then(function (results) {
                expect(results.length).toEqual(2);
                expect(results[0]).toEqual("one");
                expect(results[1]).toEqual("two");
                done();
            });
        });
    });
    describe("DeleteDb", function () {
        it("Deletes a database", function (done) {
            console.log("DeleteDb - creating db to be deleted");
            svc.DeleteDb("DBName").then(function (deleteResult) {
                console.log("DeleteDb - It deletes a database - deleting db - result %s", deleteResult);
                expect(deleteResult).toBeTruthy();
                done();
            }).catch(function (error) {
                console.error(error);
            });
        });
    });
});
//# sourceMappingURL=IdxDbSvc_spec.js.map