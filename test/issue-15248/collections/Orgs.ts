import type { CollectionConfig } from 'payload'

export const Org: CollectionConfig = {
  slug: 'orgs',
  dbName: 'o',
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          name: 'extra', // Change name to label can also fix the text
          fields: [
            {
              name: 'repos',
              type: 'join',
              collection: 'repos',
              on: 'org',
            },
          ],
        },
      ],
    },
  ],
  versions: {
    drafts: {
      localizeStatus: true,
    },
    maxPerDoc: 0,
  },
}
