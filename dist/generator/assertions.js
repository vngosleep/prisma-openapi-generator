"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "assertFieldTypeIsString", {
    enumerable: true,
    get: ()=>assertFieldTypeIsString
});
const _assert = /*#__PURE__*/ _interopRequireDefault(require("assert"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function assertFieldTypeIsString(fieldType) {
    _assert.default.equal(typeof fieldType, "string");
}
