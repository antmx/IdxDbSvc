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
//# sourceMappingURL=IdxDbSvc_spec.js.map