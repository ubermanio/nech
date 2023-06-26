import type { MaybePromise } from './types'

export type NodeHandler<Input, Output> = (input: Input) => MaybePromise<Output>

export type NodeResult<T> = {
   error?: Error
   data?: T
   calledAt: Date
   resolvedAt: Date
}

export type Node<Input, Output> = ((
   input: Input
) => Promise<NodeResult<Output>>) & {
   __name: string
}

const nodeFactory = <Input, Output>(
   name: string,
   handler: NodeHandler<Input, Output>
): Node<Input, Output> => {
   const node: Node<Input, Output> = async (input: Input) => {
      const calledAt = new Date()

      try {
         const result = await handler(input)

         return {
            data: result,
            calledAt,
            resolvedAt: new Date(),
         }
      } catch (error) {
         return {
            error: error as Error,
            calledAt,
            resolvedAt: new Date(),
         }
      }
   }

   node.__name = name

   return node
}

export { nodeFactory as node }
