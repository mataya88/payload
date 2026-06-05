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
    // {
    //   name: 'user',
    //   type: 'relationship',
    //   relationTo: 'users',
    // },
    // {
    //   name: 'myPoints',
    //   type: 'array',
    //   fields: [
    //     {
    //       name: 'name',
    //       type: 'text',
    //     },
    //     {
    //       name: 'point',
    //       type: 'point',
    //     },
    //     {
    //       type: 'tabs',
    //       tabs: [
    //         {
    //           name: 'tab1',
    //           fields: [
    //             {
    //               name: 'pointInTab1',
    //               type: 'point',
    //             },
    //           ],
    //         },
    //         {
    //           name: 'tab2',
    //           fields: [
    //             {
    //               name: 'pointInTab2',
    //               type: 'point',
    //             },
    //           ],
    //         },
    //       ],
    //     },
    //   ],
    // },
    // {
    //   name: 'blockPoints',
    //   type: 'blocks',
    //   localized: true,
    //   blocks: [
    //     {
    //       slug: 'blockWithPoint',
    //       fields: [
    //         {
    //           name: 'pointInBlock',
    //           type: 'point',
    //         },
    //       ],
    //     },
    //   ],
    // },
  ],
  upload: true,
  versions: {
    drafts: true,
    maxPerDoc: 30,
  },
}
