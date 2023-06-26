import { describe, expect, test } from 'bun:test'
import { node } from '.'

describe('Node', () => {
   test('Node with valid input', async () => {
      const pNode = node(
         'TestNode',
         ({ x, y }: { x: number; y: number }) => x + y
      )

      const result = await pNode({ x: 2, y: 3 })

      expect(result.error).toBeUndefined()
      expect(result.data).toBe(5)
      expect(result.calledAt).toBeDate()
      expect(result.resolvedAt).toBeDate()
   })

   test('Node with error throwing handler', async () => {
      const pNode = node('TestNode', ({ x, y }: { x: number; y: number }) => {
         throw new Error('Handler error')
      })

      const result = await pNode({ x: 2, y: 3 })

      expect(result.error).toBeInstanceOf(Error)
      expect(result.data).toBe(undefined)
      expect(result.calledAt).toBeDate()
      expect(result.resolvedAt).toBeDate()
   })

   test('Node name', () => {
      const pNode = node(
         'TestNode',
         ({ x, y }: { x: number; y: number }) => x + y
      )

      expect(pNode.__name).toBe('TestNode')
   })
})
