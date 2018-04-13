var DbTableDef = /** @class */ (function () {
    function DbTableDef(tableName, colNames, pkColName, addIsModifiedCol) {
        if (addIsModifiedCol === void 0) { addIsModifiedCol = false; }
        this.TableName = tableName;
        this.ColNames = colNames;
        this.PkColName = pkColName;
        this.AddIsModifiedCol = addIsModifiedCol;
    }
    return DbTableDef;
}());
var BudgetType;
(function (BudgetType) {
    BudgetType[BudgetType["YearSpecific"] = 1] = "YearSpecific";
    BudgetType[BudgetType["MultiYear"] = 2] = "MultiYear";
})(BudgetType || (BudgetType = {}));
//# sourceMappingURL=DbTableDef.js.map