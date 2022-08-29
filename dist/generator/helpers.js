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
    isScalarType: ()=>isScalarType,
    isEnumType: ()=>isEnumType,
    isDefined: ()=>isDefined,
    assertNever: ()=>assertNever,
    toCamelCase: ()=>toCamelCase,
    toCamel: ()=>toCamel,
    toSnakeCase: ()=>toSnakeCase
});
function isScalarType(field) {
    return field["kind"] === "scalar";
}
function isEnumType(field) {
    return field["kind"] === "enum";
}
function isDefined(value) {
    return value !== undefined && value !== null;
}
function assertNever(value) {
    throw new Error(`Unhandled discriminated union member: ${JSON.stringify(value)}`);
}
function toCamelCase(name) {
    return name.substring(0, 1).toLowerCase() + name.substring(1);
}
const toCamel = (s)=>{
    return s.replace(/([-_][a-z])/gi, ($1)=>{
        return $1.toUpperCase().replace("-", "").replace("_", "");
    });
};
const toSnakeCase = (str)=>{
    const matched = str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g);
    if (matched) {
        return matched.map((x)=>x.toLowerCase()).join("_");
    }
    return "";
};
