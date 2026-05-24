import type { Payload } from 'payload'

import assert from 'assert'
import path from 'path'
import { fileURLToPath } from 'url'
import { beforeAll, describe, it } from 'vitest'

import { initPayloadInt } from '../helpers/initPayloadInt.js'

let payload: Payload

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

describe('Create repo', () => {
  beforeAll(async () => {
    // @ts-expect-error: initPayloadInt does not have a proper type definition
    ;({ payload } = await initPayloadInt(dirname))
  })

  it('reproduces the error', async () => {
    await payload.create({
      collection: 'orgs',
      data: {
        name: 'Test Org',
      },
      locale: 'en',
    })

    try {
      await payload.find({
        collection: 'orgs',
        depth: 0,
        draft: true,
        limit: 10,
        locale: 'en',
        page: 1,
        sort: 'id',
      })
      assert(true)
    } catch (error) {
      console.error(error)
      throw error
    }
  })
})
