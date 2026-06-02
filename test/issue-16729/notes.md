file [update.ts](packages\payload\src\collections\operations\utilities\update.ts)
`beforeChange` receives an array `point` and returns the correct json format of `point`

inside `beforeChange` `traverseFunction` calls `promise.js` on all fields and does the following for point fields
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

suggestions

- call `traverseFields` before or inside `saveVersion`
- retransform geojson fields specifically before `saveVersion`
