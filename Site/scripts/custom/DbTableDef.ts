
export class DbTableDef {

    TableName: string;
    ColNames: Array<string>;
    PkColName: string;
    AddIsModifiedCol: boolean;

    public constructor(tableName: string, colNames: Array<string>, pkColName: string, addIsModifiedCol: boolean = false) {

        this.TableName = tableName;
        this.ColNames = colNames;
        this.PkColName = pkColName;
        this.AddIsModifiedCol = addIsModifiedCol;
    }

}

enum BudgetType {
    YearSpecific = 1,
    MultiYear = 2
}
