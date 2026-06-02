import type { Payload } from 'payload'

import assert from 'assert'
import path from 'path'
import { fileURLToPath } from 'url'
import { beforeAll, describe, it } from 'vitest'

import { initPayloadInt } from '../__helpers/shared/initPayloadInt.js'

let payload: Payload

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

describe('Issue #16729 - Update coordinates', () => {
  beforeAll(async () => {
    ;({ payload } = await initPayloadInt(dirname))
  })

  it('should create and update a media item with coordinates', async () => {
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: 'Test Media',
        point: [40.7128, -74.006],
      },
      filePath: 'test/issue-16729/test_image.jpg',
    })
    const newCoordinates = [14.7128, -67.006]
    const updatedMedia = await payload.update({
      collection: 'media',
      id: media.id,
      select: {
        id: true,
        point: true,
      },
      data: {
        alt: 'Updated Test Media',
        point: newCoordinates,
      },
    })

    const retrievedMedia = await payload.findByID({
      collection: 'media',
      id: media.id,
    })
    assert.strictEqual(retrievedMedia.alt, 'Updated Test Media')
    assert.strictEqual(retrievedMedia.point[0], newCoordinates[0])
    assert.strictEqual(retrievedMedia.point[1], newCoordinates[1])
  })
})
