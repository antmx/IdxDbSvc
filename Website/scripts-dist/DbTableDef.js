"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Represents setting for defining a database table.
 */
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
exports.DbTableDef = DbTableDef;
//# sourceMappingURL=DbTableDef.js.map