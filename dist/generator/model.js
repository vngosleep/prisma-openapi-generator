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
    getRelations: ()=>getRelations,
    getJSONSchemaModel: ()=>getJSONSchemaModel
});
const _properties = require("./properties");
const _helpers = require("./helpers");
function getRelationScalarFields(model) {
    return model.fields.flatMap((field)=>field.relationFromFields || []);
}
function getRelations(models) {
    const relations = {};
    models.forEach((model)=>{
        model.fields.forEach((field)=>{
            if (field.relationName && field.relationFromFields && field.relationToFields && field.relationFromFields.length && field.relationToFields.length) {
                // console.log(
                //     model.name,
                //     field.name,
                //     field.relationName,
                //     field.relationFromFields,
                //     field.relationToFields,
                // )
                relations[field.relationName] = {
                    ...relations[field.relationName],
                    modelDefined: model.name,
                    fieldDefined: field.name,
                    relationFromFields: field.relationFromFields,
                    relationToFields: field.relationToFields
                };
            } else if (field.relationName) {
                relations[field.relationName] = {
                    ...relations[field.relationName],
                    fieldRef: field.name,
                    modelRef: model.name
                };
            }
        });
    });
    return relations;
}
function getJSONSchemaModel(modelMetaData, transformOptions, relations) {
    return (model)=>{
        const definitionPropsMap = model.fields.map((0, _properties.getJSONSchemaProperty)({
            ...modelMetaData,
            ids: model.primaryKey ? model.primaryKey.fields : undefined
        }, transformOptions, relations));
        const propertiesMap = definitionPropsMap.map(([name, definition])=>[
                transformOptions.propertyName === "camelCase" ? (0, _helpers.toCamel)(name) : name,
                definition, 
            ]);
        const relationScalarFields = getRelationScalarFields(model);
        const propertiesWithoutRelationScalars = propertiesMap.filter((prop)=>relationScalarFields.findIndex((field)=>field === prop[0]) === -1);
        const properties = Object.fromEntries((transformOptions === null || transformOptions === void 0 ? void 0 : transformOptions.keepRelationScalarFields) === "true" ? propertiesMap : propertiesWithoutRelationScalars);
        const definition = {
            type: "object",
            properties
        };
        if (transformOptions.relationMetadata == "true" && transformOptions.openapiCompatible !== "false") {
            definition["x-prisma-model"] = transformOptions.metadataModelName === "snake_case" ? (0, _helpers.toSnakeCase)(model.name) : model.name;
        }
        if (transformOptions.includeRequiredFields) {
            const required = definitionPropsMap.reduce((filtered, [name, , fieldMetaData])=>{
                if (fieldMetaData.required && fieldMetaData.isScalar && !fieldMetaData.hasDefaultValue) {
                    filtered.push(name);
                }
                return filtered;
            }, []);
            definition.required = required;
        }
        return [
            model.name,
            definition
        ];
    };
}
