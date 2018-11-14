"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Represents the arguments required for creating an index on a database table/store.
 */
var CreateDbIndexArgs = /** @class */ (function () {
    /**
     * Constructor.
     * @param indexName Name of the index.
     * @param keyPath Single field name or array of field names the index applies to.
     * @param optionalParameters Optional parameters for the index.
     */
    function CreateDbIndexArgs(indexName, keyPath, optionalParameters) {
        this.IndexName = indexName;
        this.KeyPath = keyPath;
        this.OptionalParameters = optionalParameters;
    }
    return CreateDbIndexArgs;
}());
exports.CreateDbIndexArgs = CreateDbIndexArgs;
//# sourceMappingURL=CreateDbIndexArgs.js.map