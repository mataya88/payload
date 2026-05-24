import type { CollectionConfig } from 'payload'

export const Repo: CollectionConfig = {
  slug: 'repos',
  defaultSort: ['_status', '-updatedAt'], // Commentout this line can fix the text
  dbName: 'r',
  fields: [
    {
      name: 'org',
      type: 'relationship',
      relationTo: 'orgs',
      required: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
  ],
  versions: {
    drafts: {
      localizeStatus: true, // Comment this line can fix the text
    },
    maxPerDoc: 0,
  },
}
