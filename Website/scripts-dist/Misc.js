"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function StrIsNullOrEmpty(str) {
    if (str == null || str.length === 0) {
        return true;
    }
    return false;
}
exports.StrIsNullOrEmpty = StrIsNullOrEmpty;
function Grep(items, filterFn) {
    if (items == null || items.length == 0) {
        return items;
    }
    var matches = [];
    items.forEach(function (item) {
        if (filterFn(item)) {
            matches.push(item);
        }
    });
    return matches;
}
exports.Grep = Grep;
function ObjectToSortable(obj) {
    if (obj !== null && obj !== undefined && typeof obj === "string") {
        return obj.toLowerCase();
    }
    return obj;
}
exports.ObjectToSortable = ObjectToSortable;
/**
Pass this to array.sort(fn). Sorts an array by many fields and each in either asc or desc order.
@param {[]} fields An array of field string names and/or sub-arrays of names, direction flag, and conversion functions.
@returns {Function} Returns a function that can be consumed by array.sort(fn).
*/
function SortByMany(fields) {
    var n_fields = fields.length;
    return function (a, b) {
        var fieldValueA, fieldValueB, field, key, primer, reverse, result = 0;
        for (var i = 0, l = n_fields; i < l; i++) {
            result = 0;
            field = fields[i];
            if (typeof field === "string") {
                key = field;
                reverse = 1;
            }
            else {
                key = field[0];
                reverse = field[1] ? -1 : 1;
            }
            fieldValueA = a[key];
            fieldValueB = b[key];
            if (typeof field[2] === "function") {
                // Run values through optional conversion function
                fieldValueA = field[2].call(null, fieldValueA);
                fieldValueB = field[2].call(null, fieldValueB);
            }
            if (fieldValueA < fieldValueB)
                result = reverse * -1;
            if (fieldValueA > fieldValueB)
                result = reverse * 1;
            if (result !== 0)
                break;
        }
        return result;
    };
}
exports.SortByMany = SortByMany;
function SortByStringField(fieldName, item1, item2) {
    var item1Field = ObjectToSortable(item1[fieldName]);
    var item2Field = ObjectToSortable(item2[fieldName]);
    if (item1Field > item2Field) {
        return 1;
    }
    if (item2Field > item1Field) {
        return -1;
    }
    return 0; // Same    
}
exports.SortByStringField = SortByStringField;
function IsArray(obj) {
    if (obj && typeof obj === "object" && obj instanceof Array) {
        return true;
    }
    return false;
}
exports.IsArray = IsArray;
/**
  * Determines if 2 strings are equal.
  * @param {string} str1 The first string.
  * @param {string} str2 The second string.
  * @param {boolean} [cs] Optional flag indicating whether or not to do a case-sensitive comparison. Default is false (case-insensitive).
  * @param {boolean} [nullEqualsEmpty] Optional flag indicating whether or not to consider null and zero-length strings to be equal. Default is false (not equal).
  * @returns {boolean} True/false indicating if equal or not.
 */
function StrEq(str1, str2, cs, nullEqualsEmpty) {
    if (str1 == null && str2 == null) {
        // Both are null - match
        return true;
    }
    if (nullEqualsEmpty === true && (str1 == null || str1 == "") && (str2 == null || str2 == "")) {
        // Null and empty considered equal, and both are null or empty
        return true;
    }
    // One is null, the other isn't - no match
    if (str1 == null || str2 == null) {
        return false;
    }
    // Case-sensitive comparison
    if (cs === true) {
        return str1.toString() == str2.toString();
    }
    // Case-insensitive comparison
    return str1.toString().toLowerCase() == str2.toString().toLowerCase();
}
exports.StrEq = StrEq;
/**
 * Determines if a string array contains a particular string.
 * @param {Array<string>} arr Array of strings to search in.
 * @param {string} str The string to search for.
 * @param {boolean} cs Case-sensitive search. Defaults to false (case-insensitive) if not specified.
 */
function StringArrayContains(arr, str, cs) {
    if (arr != null) {
        for (var idx = 0; idx < arr.length; idx++) {
            if (StrEq(arr[idx], str, cs)) {
                return true;
            }
        }
    }
    return false;
}
exports.StringArrayContains = StringArrayContains;
//# sourceMappingURL=Misc.js.map