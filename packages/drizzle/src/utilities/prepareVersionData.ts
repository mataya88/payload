import type { FlattenedBlock, FlattenedField } from 'payload'

import { deepCopyObjectSimple } from 'payload'
import { fieldIsVirtual, fieldShouldBeLocalized } from 'payload/shared'
import toSnakeCase from 'to-snake-case'

import type { DrizzleAdapter } from '../types.js'

import { isArrayOfRows } from './isArrayOfRows.js'

type Args = {
  adapter: DrizzleAdapter
  collectionFields: FlattenedField[]
  parentIsLocalized?: boolean
  versionData: Record<string, unknown>
}

/*
 * This function prepares the version data for upserting in _v table
 * The goal is to make sure the result obtained from document update/create
 * matches the expected format to be passed to createVersion
 * Warning: data transformation should be applied carefully to avoid breaking data integrity
 */

export const prepareVersionData = ({
  adapter,
  collectionFields,
  parentIsLocalized,
  versionData,
}: Args): Args['versionData'] => {
  const data = deepCopyObjectSimple(versionData)

  const versionGroupField = collectionFields
    .filter((field) => field.type === 'group')
    .find((field) => field.name === 'version')
  const versionFields = versionGroupField?.flattenedFields ?? []

  traverseFields({
    adapter,
    columnPrefix: '',
    data,
    fieldPrefix: '',
    fields: versionFields,
    parentIsLocalized,
  })

  return data
}

type TraverseFieldsArgs = {
  adapter: DrizzleAdapter
  columnPrefix: string
  data: Record<string, unknown>
  fieldPrefix: string
  fields: FlattenedField[]
  parentIsLocalized?: boolean
}

const traverseFields = ({
  adapter,
  columnPrefix,
  data,
  fieldPrefix,
  fields,
  parentIsLocalized,
}: TraverseFieldsArgs) => {
  let fieldsMatched = false

  fields.forEach((field) => {
    let columnName = ''
    let fieldName = ''

    if (fieldIsVirtual(field)) {
      return
    }

    // Mark that we found a matching field
    if (data[field.name] !== undefined) {
      fieldsMatched = true
    }

    columnName = `${columnPrefix || ''}${toSnakeCase(field.name)}`
    fieldName = `${fieldPrefix || ''}${field.name}`
    const fieldData = data[field.name]

    const isLocalized = fieldShouldBeLocalized({ field, parentIsLocalized })

    let formattedValue: unknown

    switch (field.type) {
      case 'array': {
        if (isLocalized) {
          if (typeof fieldData === 'object' && fieldData !== null) {
            Object.entries(fieldData).forEach(([localeKey, localeValue]) => {
              let localeData = localeValue

              if (localeValue && typeof localeValue === 'object' && '$push' in localeValue) {
                localeData = localeValue.$push
                if (!Array.isArray(localeData)) {
                  localeData = [localeData]
                }
              }

              if (isArrayOfRows(localeData)) {
                localeData.forEach((arrayRow) =>
                  traverseFields({
                    adapter,
                    columnPrefix: '',
                    data: arrayRow,
                    fieldPrefix: '',
                    fields: field.flattenedFields,
                    parentIsLocalized: parentIsLocalized || field.localized,
                  }),
                )
              }
            })
          }
        } else {
          const rows = fieldData
          if (isArrayOfRows(rows)) {
            rows.forEach((arrayRow) => {
              traverseFields({
                adapter,
                columnPrefix: '',
                data: arrayRow,
                fieldPrefix: '',
                fields: field.flattenedFields,
                parentIsLocalized: parentIsLocalized || field.localized,
              })
            })
          }
        }
        break
      }

      case 'blocks': {
        const rows = fieldData
        if (adapter.blocksAsJSON) {
          break
        }

        if (isLocalized) {
          if (typeof fieldData === 'object' && fieldData !== null) {
            Object.entries(fieldData).forEach(([localeKey, localeData]) => {
              if (Array.isArray(localeData)) {
                localeData.forEach((blockRow) => {
                  const matchedBlock =
                    adapter.payload.blocks[blockRow.blockType] ??
                    ((field.blockReferences ?? field.blocks).find(
                      (block) => typeof block !== 'string' && block.slug === blockRow.blockType,
                    ) as FlattenedBlock | undefined)

                  if (!matchedBlock) {
                    return
                  }
                  traverseFields({
                    adapter,
                    columnPrefix: '',
                    data: blockRow,
                    fieldPrefix: '',
                    fields: matchedBlock.flattenedFields,
                    parentIsLocalized: parentIsLocalized || field.localized,
                  })
                })
              }
            })
          }
        } else if (isArrayOfRows(rows)) {
          rows.forEach((blockRow) => {
            if (typeof blockRow.blockType !== 'string') {
              return
            }
            const matchedBlock =
              adapter.payload.blocks[blockRow.blockType] ??
              ((field.blockReferences ?? field.blocks).find(
                (block) => typeof block !== 'string' && block.slug === blockRow.blockType,
              ) as FlattenedBlock | undefined)

            if (!matchedBlock) {
              return
            }
            traverseFields({
              adapter,
              columnPrefix: '',
              data: blockRow,
              fieldPrefix: '',
              fields: matchedBlock.flattenedFields,
              parentIsLocalized: parentIsLocalized || field.localized,
            })
          })
        }

        break
      }

      case 'group':
      case 'tab': {
        if (typeof fieldData === 'object' && fieldData !== null) {
          if (isLocalized) {
            Object.entries(fieldData).forEach(([localeKey, localeData]) => {
              traverseFields({
                adapter,
                columnPrefix: `${columnName}_`,
                data: localeData as Record<string, unknown>,
                fieldPrefix: `${fieldName}_`,
                fields: field.flattenedFields,
                parentIsLocalized: parentIsLocalized || field.localized,
              })
            })
          } else {
            const groupData = data[field.name] as Record<string, unknown>

            traverseFields({
              adapter,
              columnPrefix: '',
              data: groupData,
              fieldPrefix: '',
              fields: field.flattenedFields,
              parentIsLocalized: parentIsLocalized || field.localized,
            })
          }
        }
        break
      }

      case 'point': {
        if (fieldData && adapter.name !== 'sqlite') {
          if (Array.isArray(fieldData) && fieldData[0] !== null && fieldData[1] !== null) {
            formattedValue = {
              type: 'Point',
              coordinates: [parseFloat(fieldData[0]), parseFloat(fieldData[1])],
            }
          }
        }

        break
      }

      default: {
        break
      }
    }

    if (typeof formattedValue !== 'undefined') {
      if (isLocalized) {
        Object.entries(fieldData).forEach(([localeKey, localeData]) => {
          if (typeof localeData !== 'undefined') {
            data[field.name][localeKey] = formattedValue
          }
        })
      } else {
        data[field.name] = formattedValue
      }
    }
  })

  // Handle dot-notation paths when no fields matched
  if (!fieldsMatched) {
    Object.keys(data).forEach((key) => {
      if (key.includes('.')) {
        // Split on first dot only
        const firstDotIndex = key.indexOf('.')
        const fieldName = key.substring(0, firstDotIndex)
        const remainingPath = key.substring(firstDotIndex + 1)

        // Create nested structure for this field
        if (!data[fieldName]) {
          data[fieldName] = {}
        }

        const nestedData = data[fieldName] as Record<string, unknown>

        // Move the value to the nested structure
        nestedData[remainingPath] = data[key]
        delete data[key]

        // Recursively process the newly created nested structure
        // The field traversal will naturally handle it if the field exists in the schema
        traverseFields({
          adapter,
          columnPrefix,
          data,
          fieldPrefix,
          fields,
          parentIsLocalized,
        })
      }
    })
  }
}
