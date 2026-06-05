file [update.ts](packages\payload\src\collections\operations\utilities\update.ts)
`beforeChange` receives an array `point` and returns the correct json format of `point`

inside `beforeChange` `traverseFields` calls `promise.js` on all fields and does the following for point fields
[promise.ts](packages\payload\src\fields\hooks\beforeChange\promise.ts)

```ts
case 'point': {
      // Transform point data for storage
      if (
        Array.isArray(siblingData[field.name]) &&
        siblingData[field.name][0] !== null &&
        siblingData[field.name][1] !== null
      ) {
        siblingData[field.name] = {
          type: 'Point',
          coordinates: [
            parseFloat(siblingData[field.name][0]),
            parseFloat(siblingData[field.name][1]),
          ],
        }
      }

      break
    }
```

inside `updateDocument` function
in the Update section `db.updateOne` is called at line 367 with the correct json `point` attribute
inside `updateOne`, `upsertrow` receives the point as a json object and returns an array

`upsertRow` inserts using drizzle at line 153 [index.ts](packages\drizzle\src\upsertRow\index.ts)
with undefined `retrurning` argument
drizzle receives correct sql-encoded json `point` object but returns `point` as an array

point is passed as array to `saveVersion` function from `docWithLocale`
error thrown at `createVersion` call line 105 at [saveVersion](packages\payload\src\versions\saveVersion.ts)
it appears that when `createVersion` calls `upsertRow`, the `transformForWrite` inside `upsertRow` encodes the `point` array without json transformation
this is because the `traverseFields` before write directly stringifies and plugs the incoming `point` value into the postgres `ST_GeomFromGeoJSON` function
it clearly assumes the incoming data is in the form `{ type: 'Point', coordinates: [1,2]}`

### Fix

- If the assumption about the above function (`traverseFields` before write) is incorrect, adding the transformation lines above inside `traversFields` will be a valid fix
  - But i believe the assumption is correct, so there should be something that retransforms the `point` between updating the document and creating the version
  - Also `traverseFields` inside the `upsertRow` has much wider use cases than creating a version.
- We may insert a fields traverse function before `saveVersion` call in `update.ts`
- A probably better idea is to run a function inside `createVersion` that prepares the `versionData` by traversing the fields and transforming all `point` fields. For example call it `prepareVersionData`. However, this new function should be handled carefully as failing to do so can break data integrity. I may add tests to ensure main document matches version data.

why not update the `transform` function inside `upsertRow` after the sql call?
because this is a tranform for read. it returns the data in the form to be returned to the client.
this also means that the output of the `updateOne` function should not be tampered

### P.S.

- New findings after implementing the last fix:
- This error does not happen with complex collections. Just adding localization prevents this error.
- The reason is that the `upsertRow` function only uses sql `returning` to return data when the the collection is simple.
- In any other case, `upsertRow` retrieves the document in a separate step, which returns correct GeoJson.
- A one-line fix would be adding document retrieval and ditching sql `returning`

- maybe i can investigate more why drizzle returns the geo point as an array
- Possible Fix: add point fields to `shouldUseOptimizeUpsertRow` to prevent using sql `returning`
- Possible Fix: Ran a check before the `returning` to skip it if a `point` field is found
