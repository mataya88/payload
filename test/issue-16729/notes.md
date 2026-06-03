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

fix: if the later assumption is incorrect, adding the transformation lines above in `traversFields` before write is a valid fix
if the assumption is correct, there should be something that retransforms the `point` between updating the document and creating the version
maybe we can insert a fields traverse function before `saveVersion` call in `update.ts`

why not update the `transform` function inside `upsertRow` after the sql call?
because this is a tranform for read. it returns the data in the form to be returned to the client.
this also means that the output of the `updateOne` function should not be tampered
