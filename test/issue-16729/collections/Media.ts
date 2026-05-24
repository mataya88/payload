import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'point',
      type: 'point',
    },
  ],
  upload: true,
  versions: {
    drafts: true,
    maxPerDoc: 1,
  },
}
