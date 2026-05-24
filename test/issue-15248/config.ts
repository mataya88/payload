import { fileURLToPath } from 'node:url'
import path from 'path'

import { buildConfigWithDefaults } from '../buildConfigWithDefaults.js'
import { Org } from './collections/Orgs.js'
import { Repo } from './collections/Repo.js'
import { Users } from './collections/Users.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfigWithDefaults({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Org, Repo, Users],
  //   onInit: async (payload) => {
  //     if (process.env.SEED_IN_CONFIG_ONINIT !== 'false') {
  //       await seed(payload)
  //     }
  //   },
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  plugins: [],
  localization: {
    locales: ['en', 'ar'],
    defaultLocale: 'en',
  },
  experimental: {
    localizeStatus: true,
  },
})
