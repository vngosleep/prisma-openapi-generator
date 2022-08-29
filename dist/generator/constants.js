"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    DEFINITIONS_ROOT: ()=>DEFINITIONS_ROOT,
    DEFINITIONS_ROOT_OPENAPI: ()=>DEFINITIONS_ROOT_OPENAPI
});
const DEFINITIONS_ROOT = "#/definitions/";
const DEFINITIONS_ROOT_OPENAPI = "#/components/schemas/";
