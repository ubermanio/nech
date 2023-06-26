import { entity } from '.'
import { describe, expect, test } from 'bun:test'
import { z } from 'zod'

describe('Entity', () => {
   test('Entity with valid input', () => {
      const Product = entity(
         'Product',
         z.object({
            name: z.string(),
            price: z.number(),
         })
      )

      const product = new Product({ name: 'Test', price: 10 })

      expect(product.name).toBe('Test')
      expect(product.price).toBe(10)
      expect(Product.__name).toBe('Product')
   })

   test('Entity with invalid input', () => {
      const Product = entity(
         'Product',
         z.object({
            name: z.string(),
            price: z.number(),
         })
      )

      expect(
         () => new Product({ name: 'Test', price: 'invalid' } as any)
      ).toThrow()
   })

   test('Extra properties get stripped', () => {
      const Product = entity(
         'Product',
         z.object({
            name: z.string(),
            price: z.number(),
         })
      )

      const product = new Product({
         name: 'Test',
         price: 10,
         extra: 'invalid',
      } as any)

      expect(product).not.toHaveProperty('extra')
   })

   test('Extended entity with additional logic', () => {
      class ProductWithLogic extends entity(
         'ProductWithLogic',
         z.object({
            name: z.string(),
            price: z.number(),
         })
      ) {
         get discountLabel() {
            return `Discounted ${this.name} for ${this.price}!`
         }

         static create(input: z.infer<typeof ProductWithLogic.__schema>) {
            return new ProductWithLogic(input)
         }
      }

      const product = new ProductWithLogic({ name: 'Test', price: 10 })

      expect(product.discountLabel).toBe('Discounted Test for 10!')
   })
})
