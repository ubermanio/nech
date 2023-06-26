import type { Node } from './node'

type NodeChain<Input, Output, Context> = [
   Node<Input, Context>,
   ...Node<Context, Context>[],
   Node<Context, Output>
]

export type Chain<Input, Output> = Node<Input, Output>

const chainFactory = <Context, Input, Output>(
   name: string,
   nodes: NodeChain<Input, Output, Context>
): Chain<Input, Output> => {
   if (nodes.length < 2) {
      throw new Error('Chain requires at least 2 nodes')
   }

   const chain: Chain<Input, Output> = async (input: Input) => {
      const calledAt = new Date()

      let context: Context | Output = input as any

      for (const node of nodes) {
         const result = await node(context as Context & Input)

         if ('error' in result) {
            return {
               error: result.error,
               calledAt,
               resolvedAt: new Date(),
            }
         }

         context = result.data as Context
      }

      return {
         data: context as Output,
         calledAt,
         resolvedAt: new Date(),
      }
   }

   chain.__name = name

   return chain
}

export { chainFactory as chain }
