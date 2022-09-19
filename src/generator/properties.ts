import { DMMF } from '@prisma/generator-helper'
import { DEFINITIONS_ROOT, DEFINITIONS_ROOT_OPENAPI } from './constants'
import {
    assertNever,
    isEnumType,
    isDefined,
    isScalarType,
    PrismaPrimitive,
} from './helpers'
import {
    ModelMetaData,
    PropertyMap,
    PropertyMetaData,
    TransformOptions,
} from './types'

import type {
    JSONSchema7,
    JSONSchema7Definition,
    JSONSchema7TypeName,
} from 'json-schema'

import { Relations } from './model'
import { assertFieldTypeIsString } from './assertions'

function getJSONSchemaScalar(
    fieldType: PrismaPrimitive,
    { openapiCompatible }: TransformOptions,
): JSONSchema7TypeName | Array<JSONSchema7TypeName> {
    switch (fieldType) {
        case 'Int':
        case 'BigInt':
            return 'integer'
        case 'DateTime':
        case 'Bytes':
        case 'String':
            return 'string'
        case 'Float':
        case 'Decimal':
            return 'number'
        case 'Json':
            if (openapiCompatible !== 'false') {
                // openapi not support type as string[]
                return 'object'
            }
            return ['number', 'string', 'boolean', 'object', 'array', 'null']
        case 'Boolean':
            return 'boolean'
        default:
            assertNever(fieldType)
    }
}

function getJSONSchemaType(
    field: DMMF.Field,
    transformOptions: TransformOptions,
): JSONSchema7['type'] {
    const { isList, isRequired } = field
    const scalarFieldType =
        isScalarType(field) && !isList
            ? getJSONSchemaScalar(field.type, transformOptions)
            : field.isList
            ? 'array'
            : isEnumType(field)
            ? 'string'
            : 'object'

    const isFieldUnion = Array.isArray(scalarFieldType)

    if (transformOptions.openapiCompatible !== 'false') {
        // openapi not support both type = 'null' and type as string[]
        return scalarFieldType
    }

    return isRequired || isList
        ? scalarFieldType
        : isFieldUnion
        ? Array.from(new Set([...scalarFieldType, 'null']))
        : [scalarFieldType, 'null']
}

function getDefaultValue(field: DMMF.Field): JSONSchema7['default'] {
    const fieldDefault = field.default

    if (!field.hasDefaultValue) {
        return null
    }

    if (field.kind === 'enum') {
        return typeof fieldDefault === 'string' ? fieldDefault : null
    }

    if (!isScalarType(field)) {
        return null
    }

    switch (field.type) {
        case 'String':
        case 'BigInt':
        case 'DateTime':
            return typeof fieldDefault === 'string' ? fieldDefault : null
        case 'Int':
        case 'Float':
        case 'Decimal':
            return typeof fieldDefault === 'number' ? fieldDefault : null
        case 'Boolean':
            return typeof fieldDefault === 'boolean' ? fieldDefault : null
        case 'Json':
        case 'Bytes':
            return null
        default:
            return assertNever(field.type)
    }
}

function getFormatByDMMFType(
    fieldType: DMMF.Field['type'],
): string | undefined {
    switch (fieldType) {
        case 'DateTime':
            return 'date-time'
        default:
            return
    }
}

function getJSONSchemaForPropertyReference(
    field: DMMF.Field,
    { schemaId, openapiCompatible }: TransformOptions,
): JSONSchema7WithX {
    const notNullable = field.isRequired || field.isList

    assertFieldTypeIsString(field.type)

    const typeRef = `${
        openapiCompatible !== 'false'
            ? DEFINITIONS_ROOT_OPENAPI
            : DEFINITIONS_ROOT
    }${field.type}`
    const ref = { $ref: schemaId ? `${schemaId}${typeRef}` : typeRef }

    if (openapiCompatible === 'refWithAllOf') {
        // openapi not support type = 'null'
        return { allOf: [ref] }
    }

    if (openapiCompatible === 'true') {
        // openapi not support type = 'null'
        return ref
    }

    return notNullable ? ref : { anyOf: [ref, { type: 'null' }] }
}

function getItemsByDMMFType(
    field: DMMF.Field,
    transformOptions: TransformOptions,
): JSONSchema7['items'] {
    return (isScalarType(field) && !field.isList) || isEnumType(field)
        ? undefined
        : isScalarType(field) && field.isList
        ? { type: getJSONSchemaScalar(field.type, transformOptions) }
        : getJSONSchemaForPropertyReference(field, transformOptions)
}

function isSingleReference(field: DMMF.Field) {
    return !isScalarType(field) && !field.isList && !isEnumType(field)
}

function getEnumListByDMMFType(modelMetaData: ModelMetaData) {
    return (field: DMMF.Field): string[] | undefined => {
        const enumItem = modelMetaData.enums.find(
            ({ name }) => name === field.type,
        )

        if (!enumItem) return undefined
        return enumItem.values.map((item) => item.name)
    }
}

function getDescription(field: DMMF.Field) {
    return field.documentation
}

function getPropertyDefinition(
    modelMetaData: ModelMetaData,
    transformOptions: TransformOptions,
    field: DMMF.Field,
) {
    const type = getJSONSchemaType(field, transformOptions)
    const format = getFormatByDMMFType(field.type)
    const items = getItemsByDMMFType(field, transformOptions)
    const enumList = getEnumListByDMMFType(modelMetaData)(field)
    const defaultValue = getDefaultValue(field)
    const description = getDescription(field)

    const definition: JSONSchema7WithX = {
        type,
        ...(isDefined(defaultValue) && { default: defaultValue }),
        ...(isDefined(format) && { format }),
        ...(isDefined(items) && { items }),
        ...(isDefined(enumList) && { enum: enumList }),
        ...(isDefined(description) && { description }),
    }

    return definition
}

type JSONSchema7WithX = JSONSchema7 & {
    'x-prisma-is-id'?: boolean
    'x-prisma-is-relation-id'?: boolean
    'x-prisma-relation'?: string
    'x-prisma-is-unique'?: boolean
    'x-prisma-has-default'?: boolean
    'x-prisma-is-notnull'?: boolean
    'x-prisma-field-json'?: boolean
    'x-openapi-settable'?: boolean
    'x-openapi-field-json'?: boolean | string
    'x-openapi-optional'?: boolean
}

export function getJSONSchemaProperty(
    modelMetaData: ModelMetaData,
    transformOptions: TransformOptions,
    relations: Relations,
) {
    return (field: DMMF.Field): PropertyMap => {
        const propertyMetaData: PropertyMetaData = {
            required: field.isRequired,
            hasDefaultValue: field.hasDefaultValue,
            isScalar: isScalarType(field) || isEnumType(field),
        }

        const property = isSingleReference(field)
            ? getJSONSchemaForPropertyReference(field, transformOptions)
            : getPropertyDefinition(modelMetaData, transformOptions, field)

        if (!property.description && field.documentation) {
            property.description = field.documentation
        }

        if (
            transformOptions.openapiCompatible !== 'false' &&
            transformOptions.relationMetadata
        ) {
            if (field.isId) {
                property['x-prisma-is-id'] = true
            }

            if (field.isUnique) {
                property['x-prisma-is-unique'] = true
            }

            if (field.hasDefaultValue) {
                property['x-prisma-has-default'] = true
            }

            if (field.isRequired && !field.hasDefaultValue) {
                property['x-prisma-is-notnull'] = true
            }

            // detect json
            if (field.type === 'Json') {
                property['x-prisma-field-json'] = true
            }

            const definedJsonInDocRegex = /\[\[openapi:.*type=json.*\]\]/gm
            if (
                field.documentation &&
                field.documentation.search(definedJsonInDocRegex) !== -1
            ) {
                property['x-openapi-field-json'] = true
            }

            const definedJsonArrayInDocRegex =
                /\[\[openapi:.*type=jsonarray.*\]\]/gm
            if (
                field.documentation &&
                field.documentation.search(definedJsonArrayInDocRegex) !== -1
            ) {
                property['x-openapi-field-json'] = 'array'
            }

            const definedSettableInDocRegex =
                /\[\[openapi:.*settable=true.*\]\]/gm
            if (
                field.documentation &&
                field.documentation.search(definedSettableInDocRegex) !== -1
            ) {
                property['x-openapi-settable'] = true
            }

            const definedReadonlyInDocRegex =
                /\[\[openapi:.*settable=false.*\]\]/gm
            if (
                field.documentation &&
                field.documentation.search(definedReadonlyInDocRegex) !== -1
            ) {
                property['x-openapi-settable'] = false
            }

            const definedOptionalInDocRegex =
                /\[\[openapi:.*optional=true.*\]\]/gm
            if (
                field.documentation &&
                field.documentation.search(definedOptionalInDocRegex) !== -1
            ) {
                property['x-openapi-optional'] = true
            }

            Object.keys(relations).forEach((relationName) => {
                const { relationFromFields, modelDefined } =
                    relations[relationName]

                if (
                    relationFromFields.includes(field.name) &&
                    modelMetaData.name === modelDefined
                ) {
                    property['x-prisma-is-relation-id'] = true
                }
            })

            if (modelMetaData.ids) {
                if (modelMetaData.ids.includes(field.name)) {
                    property['x-prisma-is-id'] = true
                }
            }

            if (field.relationName) {
                const rel = relations[field.relationName]
                const fromType = rel.modelDefined
                const toType = rel.modelRef
                const fromFields = rel.relationFromFields.join(',')
                const toFields = rel.relationToFields.join(',')

                // console.log(
                //     'model:',
                //     modelMetaData.name,
                //     '| field:',
                //     field.name,
                //     '| type:',
                //     field.type,
                //     '| rel:',
                //     field.relationName,
                //     fromType,
                //     fromFields,
                //     toType,
                //     toFields,
                // )

                const currentModel = modelMetaData.name

                if (
                    currentModel === fromType &&
                    field.name === rel.fieldDefined
                ) {
                    property[
                        'x-prisma-relation'
                    ] = `rel:belongs-to,join:${fromFields}=${toFields}`
                }

                if (currentModel === toType && field.name === rel.fieldRef) {
                    if (field.isList) {
                        property[
                            'x-prisma-relation'
                        ] = `rel:has-many,join:${toFields}=${fromFields}`
                    } else {
                        property[
                            'x-prisma-relation'
                        ] = `rel:has-one,join:${toFields}=${fromFields}`
                    }
                }

                if (
                    fromType === toType && // self references type
                    currentModel === toType &&
                    field.name === rel.fieldDefined
                ) {
                    property[
                        'x-prisma-relation'
                    ] = `rel:belongs-to,join:${fromFields}=${toFields}`
                }
            }
        }

        return [field.name, property, propertyMetaData]
    }
}
