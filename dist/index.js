"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _generatorHelper = require("@prisma/generator-helper");
const _transformDMMF = require("./generator/transformDMMF");
const _fs = /*#__PURE__*/ _interopRequireWildcard(require("fs"));
const _path = /*#__PURE__*/ _interopRequireWildcard(require("path"));
const _internals = require("@prisma/internals");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interopRequireWildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {};
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
(0, _generatorHelper.generatorHandler)({
    onManifest () {
        return {
            defaultOutput: "./json-schema",
            prettyName: "Prisma JSON Schema Generator"
        };
    },
    async onGenerate (options) {
        const jsonSchema = (0, _transformDMMF.transformDMMF)(options.dmmf, options.generator.config);
        if (options.generator.output) {
            const outputDir = // This ensures previous version of prisma are still supported
            typeof options.generator.output === "string" ? options.generator.output : (0, _internals.parseEnvValue)(options.generator.output);
            try {
                await _fs.promises.mkdir(outputDir, {
                    recursive: true
                });
                await _fs.promises.writeFile(_path.join(outputDir, "json-schema.json"), JSON.stringify(jsonSchema, null, 2));
            } catch (e) {
                console.error("Error: unable to write files for Prisma Schema Generator");
                throw e;
            }
        } else {
            throw new Error("No output was specified for Prisma Schema Generator");
        }
    }
});
