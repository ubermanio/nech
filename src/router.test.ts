import { describe, expect, test } from 'bun:test'
import { node, router } from '.'

const sumNode = node('SumNode', ({ x, y }: { x: number; y: number }) => x + y)

const subNode = node('SubNode', ({ x, y }: { x: number; y: number }) => x - y)

const ExampleRouter = router('ExampleRouter', {
   lt50: sumNode,
   gt50: subNode,
})

describe('Router', () => {
   test('Router with valid input routes to sumNode', async () => {
      const result = await ExampleRouter('lt50')({ x: 10, y: 20 })

      expect(result.error).toBeUndefined()
      expect(result.data).toBe(30)
   })

   test('Router with valid input routes to subNode', async () => {
      const result = await ExampleRouter('gt50')({ x: 100, y: 20 })

      expect(result.error).toBeUndefined()
      expect(result.data).toBe(80)
   })
})
