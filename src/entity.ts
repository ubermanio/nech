import { z } from 'zod'

export const isEntity = <T>(input: unknown): input is EntityClass<T> => {
   return input instanceof Entity && '__name' in input && '__schema' in input
}

class Entity {
   constructor(input: unknown) {
      Object.assign(this, input)
   }

   static __name: string
   static __schema: z.ZodSchema<any>
}

export type EntityClass<T> = {
   new (input: T): T
} & {
   __name: string
   __schema: z.ZodSchema<T>
}

const entityFactory = <Name extends string, T extends object>(
   name: Name,
   schema: z.ZodSchema<T>
): EntityClass<T> => {
   const cls: Entity = class extends Entity {
      constructor(input: unknown) {
         super(schema.parse(input))
      }

      static __name = name
      static __schema = schema
   }
   return cls as EntityClass<T>
}

export { entityFactory as entity }
