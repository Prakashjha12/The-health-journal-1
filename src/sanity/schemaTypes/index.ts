
import { postType } from './postType'
import { authorType } from './authorType'
import { categoryType } from './categoryType'
import { blockContentType } from './blockContentType'
import { type SchemaTypeDefinition } from 'sanity'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [postType, authorType, categoryType, blockContentType],
}
