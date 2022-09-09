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
            servers: [
                {
                    url: "http://localhost:3000"
                }, 
            ],
            tags: [
                {
                    name: "models"
                }, 
            ],
            info: {
                version: "1.0.0",
                title: "openapi document",
                description: "openapi document",
                contact: {
                    email: "danh.tt1294@gmail.com",
                    name: "Danh Tran",
                    url: "danhtran94.dev"
                }
            },
            components: {
                schemas: {}
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
                                description: "model-schema",
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
