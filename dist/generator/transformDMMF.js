"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "transformDMMF", {
    enumerable: true,
    get: ()=>transformDMMF
});
const _constants = require("./constants");
const _helpers = require("./helpers");
const _jsonSchema = require("./jsonSchema");
const _model = require("./model");
function getPropertyDefinition({ schemaId , openapiCompatible  }) {
    return (model)=>{
        const ref = `${openapiCompatible !== "false" ? _constants.DEFINITIONS_ROOT_OPENAPI : _constants.DEFINITIONS_ROOT}${model.name}`;
        return [
            (0, _helpers.toCamelCase)(model.name),
            openapiCompatible === "refWithAllOf" ? {
                allOf: [
                    {
                        $ref: schemaId ? `${schemaId}${ref}` : ref
                    }, 
                ]
            } : {
                $ref: schemaId ? `${schemaId}${ref}` : ref
            }, 
        ];
    };
}
function transformDMMF(dmmf, transformOptions = {
    openapiCompatible: "false"
}) {
    // TODO: Remove default values as soon as prisma version < 3.10.0 doesn't have to be supported anymore
    const { models =[] , enums =[] , types =[]  } = dmmf.datamodel;
    const initialJSON = (0, _jsonSchema.getInitialJSON)(transformOptions);
    const { schemaId  } = transformOptions;
    const relations = (0, _model.getRelations)(models);
    const modelDefinitionsMap = models.map((model)=>(0, _model.getJSONSchemaModel)({
            enums,
            name: model.name
        }, transformOptions, relations)(model));
    const typeDefinitionsMap = types.map((model)=>(0, _model.getJSONSchemaModel)({
            enums,
            name: model.name
        }, transformOptions, relations)(model));
    const modelPropertyDefinitionsMap = models.map(getPropertyDefinition(transformOptions));
    const definitions = Object.fromEntries([
        ...modelDefinitionsMap,
        ...typeDefinitionsMap, 
    ]);
    const properties = Object.fromEntries(modelPropertyDefinitionsMap);
    if (transformOptions.openapiCompatible !== "false") {
        return {
            ...initialJSON,
            components: {
                schemas: definitions
            },
            paths: {
                "/model/{name}": {
                    get: {
                        summary: "get-model-schema",
                        operationId: "get-model-schema",
                        description: "get-model-schema",
                        tags: [
                            "models"
                        ],
                        responses: {
                            "200": {
                                description: "model",
                                content: {
                                    "application/json": {
                                        schema: {
                                            oneOf: modelPropertyDefinitionsMap.map((prop)=>{
                                                return prop[1];
                                            })
                                        }
                                    }
                                }
                            }
                        }
                    },
                    parameters: [
                        {
                            schema: {
                                type: "string"
                            },
                            name: "name",
                            in: "path",
                            required: true
                        }, 
                    ]
                }
            }
        };
    }
    return {
        ...schemaId ? {
            $id: schemaId
        } : null,
        ...initialJSON,
        definitions,
        properties
    };
}
