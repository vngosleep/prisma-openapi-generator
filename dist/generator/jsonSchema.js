"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getInitialJSON", {
    enumerable: true,
    get: ()=>getInitialJSON
});
const getInitialJSON = (transformOptions)=>{
    if (transformOptions.openapiCompatible !== "false") {
        return {
            openapi: "3.0.0",
            info: {
                version: "1.0.0",
                title: "openapi document",
                description: "openapi document"
            },
            components: {
                schemas: {}
            },
            paths: {
                "/model/{name}": {
                    get: {
                        responses: {
                            "200": {
                                description: "model",
                                content: {
                                    "application/json": {
                                        schema: {
                                            oneOf: []
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
        $schema: "http://json-schema.org/draft-07/schema#",
        definitions: {},
        type: "object"
    };
};
