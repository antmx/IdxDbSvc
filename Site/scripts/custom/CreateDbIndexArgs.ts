
class CreateDbIndexArgs {

    IndexName: string;
    KeyPath: string | Array<string>;
    OptionalParameters: IDBIndexParameters;

    public constructor(indexName: string, keyPath: string | string[], optionalParameters: IDBIndexParameters) {

        this.IndexName = indexName;
        this.KeyPath = keyPath;
        this.OptionalParameters = optionalParameters;
    }

}

