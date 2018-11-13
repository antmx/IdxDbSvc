
/**
 * Represents the arguments required for creating an index on a database table/store.
 */
export class CreateDbIndexArgs {

    IndexName: string;
    KeyPath: string | Array<string>;
    OptionalParameters: IDBIndexParameters;

    /**
     * Constructor.
     * @param indexName Name of the index.
     * @param keyPath Single field name or array of field names the index applies to.
     * @param optionalParameters Optional parameters for the index.
     */
    public constructor(indexName: string, keyPath: string | string[], optionalParameters: IDBIndexParameters) {

        this.IndexName = indexName;
        this.KeyPath = keyPath;
        this.OptionalParameters = optionalParameters;
    }

}
