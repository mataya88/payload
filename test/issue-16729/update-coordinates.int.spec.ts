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
    const locale = 'ar'
    const user = await payload.create({
      collection: 'users',
      data: {
        email: 'test@example.com',
        password: 'password',
      },
    })
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: 'Test Media',
        point: [40.7128, -74.006],
        // user: user.id,
        // myPoints: [
        //   {
        //     name: 'Point 1',
        //     point: [34.0522, -18.2437],
        //     tab1: {
        //       pointInTab1: [35.6895, 39.6917],
        //     },
        //     tab2: {
        //       pointInTab2: [55.7558, 37.6173],
        //     },
        //   },
        //   {
        //     name: 'Point 2',
        //     point: [51.5074, -0.1278],
        //     tab1: {
        //       pointInTab1: [41.9028, 12.4964],
        //     },
        //     tab2: {
        //       pointInTab2: [52.52, 13.405],
        //     },
        //   },
        // ],
        // blockPoints: [
        //   {
        //     blockType: 'blockWithPoint',
        //     pointInBlock: [37.7749, -22.4194],
        //   },
        // ],
      },
      filePath: 'test/issue-16729/test_image.jpg',
    })
    const newCoordinates = [14.7128, -67.006]
    // const newPointsArray = [
    //   media.myPoints![0], // Keep the first point unchanged
    //   {
    //     name: media.myPoints![1]!.name, // Keep the name unchanged
    //     point: [48.8566, 2.3522],
    //     tab1: {
    //       pointInTab1: [41.9028, 12.4964],
    //     },
    //     tab2: {
    //       pointInTab2: [52.52, 13.405],
    //     },
    //   },
    // ]
    // const newBlockPointsArray = [
    //   {
    //     blockType: 'blockWithPoint',
    //     pointInBlock: [37.7749, -22.4194],
    //   },
    // ]
    const updatedMedia = await payload.update({
      collection: 'media',
      id: media.id,
      select: {
        id: true,
        alt: true,
        point: false,
      },
      data: {
        alt: 'Updated Test Media',
        point: newCoordinates,
        // myPoints: newPointsArray,
        // blockPoints: newBlockPointsArray,
      },
    })

    const retrievedMedia = await payload.findByID({
      collection: 'media',
      id: media.id,
    })
    const mediaVersion = await payload.findVersions({
      collection: 'media',
      where: {
        parent: {
          equals: media.id,
        },
      },
    })
    const latestVersion = mediaVersion?.docs?.[0]?.version
    assert.strictEqual(retrievedMedia.alt, 'Updated Test Media')
    assert.strictEqual(retrievedMedia.point![0], newCoordinates[0])
    assert.strictEqual(retrievedMedia.point![1], newCoordinates[1])

    // array
    // assert.strictEqual(retrievedMedia.myPoints![0]!.name, newPointsArray[0]!.name)
    // assert.strictEqual(retrievedMedia.myPoints![0]!.point![0], newPointsArray[0]!.point![0])
    // assert.strictEqual(retrievedMedia.myPoints![0]!.point![1], newPointsArray[0]!.point![1])
    // assert.strictEqual(retrievedMedia.myPoints![1]!.name, newPointsArray[1]!.name)
    // assert.strictEqual(retrievedMedia.myPoints![1]!.point![0], newPointsArray[1]!.point![0])
    // assert.strictEqual(retrievedMedia.myPoints![1]!.point![1], newPointsArray[1]!.point![1])

    // tabs
    // assert.strictEqual(
    //   retrievedMedia.myPoints![0]!.tab1?.pointInTab1![0],
    //   newPointsArray[0]!.tab1?.pointInTab1![0],
    // )
    // assert.strictEqual(
    //   retrievedMedia.myPoints![0]!.tab1?.pointInTab1![1],
    //   newPointsArray[0]!.tab1?.pointInTab1![1],
    // )
    // assert.strictEqual(
    //   retrievedMedia.myPoints![0]!.tab2?.pointInTab2![0],
    //   newPointsArray[0]!.tab2?.pointInTab2![0],
    // )
    // assert.strictEqual(
    //   retrievedMedia.myPoints![0]!.tab2?.pointInTab2![1],
    //   newPointsArray[0]!.tab2?.pointInTab2![1],
    // )
    // assert.strictEqual(
    //   retrievedMedia.myPoints![1]!.tab1?.pointInTab1![0],
    //   newPointsArray[1]!.tab1?.pointInTab1![0],
    // )
    // assert.strictEqual(
    //   retrievedMedia.myPoints![1]!.tab1?.pointInTab1![1],
    //   newPointsArray[1]!.tab1?.pointInTab1![1],
    // )
    // assert.strictEqual(
    //   retrievedMedia.myPoints![1]!.tab2?.pointInTab2![0],
    //   newPointsArray[1]!.tab2?.pointInTab2![0],
    // )
    // assert.strictEqual(
    //   retrievedMedia.myPoints![1]!.tab2?.pointInTab2![1],
    //   newPointsArray[1]!.tab2?.pointInTab2![1],
    // )

    if (!latestVersion) {
      throw new Error('No version found for the media item')
    }
    assert.strictEqual(latestVersion?.alt, 'Updated Test Media')
    assert.strictEqual(latestVersion?.point![0], newCoordinates[0])
    assert.strictEqual(latestVersion?.point![1], newCoordinates[1])

    // // array
    // assert.strictEqual(latestVersion?.myPoints![0]!.name, newPointsArray[0]!.name)
    // assert.strictEqual(latestVersion?.myPoints![0]!.point![0], newPointsArray[0]!.point![0])
    // assert.strictEqual(latestVersion?.myPoints![0]!.point![1], newPointsArray[0]!.point![1])
    // assert.strictEqual(latestVersion?.myPoints![1]!.name, newPointsArray[1]!.name)
    // assert.strictEqual(latestVersion?.myPoints![1]!.point![0], newPointsArray[1]!.point![0])
    // assert.strictEqual(latestVersion?.myPoints![1]!.point![1], newPointsArray[1]!.point![1])

    // // tabs
    // assert.strictEqual(
    //   latestVersion?.myPoints![0]!.tab1?.pointInTab1![0],
    //   newPointsArray[0]!.tab1?.pointInTab1![0],
    // )
    // assert.strictEqual(
    //   latestVersion?.myPoints![0]!.tab1?.pointInTab1![1],
    //   newPointsArray[0]!.tab1?.pointInTab1![1],
    // )
    // assert.strictEqual(
    //   latestVersion?.myPoints![0]!.tab2?.pointInTab2![0],
    //   newPointsArray[0]!.tab2?.pointInTab2![0],
    // )
    // assert.strictEqual(
    //   latestVersion?.myPoints![0]!.tab2?.pointInTab2![1],
    //   newPointsArray[0]!.tab2?.pointInTab2![1],
    // )
    // assert.strictEqual(
    //   latestVersion?.myPoints![1]!.tab1?.pointInTab1![0],
    //   newPointsArray[1]!.tab1?.pointInTab1![0],
    // )
    // assert.strictEqual(
    //   latestVersion?.myPoints![1]!.tab1?.pointInTab1![1],
    //   newPointsArray[1]!.tab1?.pointInTab1![1],
    // )
    // assert.strictEqual(
    //   latestVersion?.myPoints![1]!.tab2?.pointInTab2![0],
    //   newPointsArray[1]!.tab2?.pointInTab2![0],
    // )
    // assert.strictEqual(
    //   latestVersion?.myPoints![1]!.tab2?.pointInTab2![1],
    //   newPointsArray[1]!.tab2?.pointInTab2![1],
    // )

    // // blocks
    // console.log('Latest version blockPoints:', latestVersion?.blockPoints)
    // assert.strictEqual(
    //   latestVersion?.blockPoints![0]!.pointInBlock![0],
    //   newBlockPointsArray[0]!.pointInBlock[0],
    // )
    // assert.strictEqual(
    //   latestVersion?.blockPoints![0]!.pointInBlock![1],
    //   newBlockPointsArray[0]!.pointInBlock[1],
    // )
  })
})
