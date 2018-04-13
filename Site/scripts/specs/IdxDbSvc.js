/// <reference path="../jasmine/jasmine.d.ts" />
/// <reference path="../custom/IdxDbSvc.ts" />
/// <reference path="../custom/DbTableDef.ts" />
describe("IdxDbSvc", function () {
    var svc;
    beforeEach(function (done) {
        svc = new IdxDbSvc(jQuery, window.indexedDB);
        svc.DeleteDb("DBName").done(done);
    });
    describe("constructor", function () {
        it("sets up the properties from the args", function () {
            expect(svc.$).toBeDefined();
            expect(svc.IdxDbEnv).toBeDefined();
        });
    });
    describe("CreateDb", function () {
        it("Creates a database", function (done) {
            var tblDefs = [];
            tblDefs.push(new DbTableDef("tblFoo", ["FooCol1", "FooCol2"], "FooCol1", true));
            tblDefs.push(new DbTableDef("tblBar", ["BarCol1", "BarCol2", "BarCol3"], "BarCol1", false));
            svc.CreateDb("DBName", 1, tblDefs)
                .done(function (success) {
                expect(success).toEqual(true);
                svc.GetStoreNames("DBName", 1)
                    .done(function (objectStoreNames) {
                    expect(objectStoreNames).toBeDefined();
                    expect(objectStoreNames.length).toEqual(2);
                    expect(objectStoreNames[0]).toEqual("tblBar");
                    expect(objectStoreNames[1]).toEqual("tblFoo");
                    done();
                });
            })
                .progress(function () {
                console.log(arguments[0]);
            });
        });
    });
    describe("DeleteDb", function () {
        it("Deletes a database", function (done) {
        });
    });
});
//# sourceMappingURL=IdxDbSvc.js.map