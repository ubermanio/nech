import { Node } from './node'

type Router<Routes extends string[], Input, Output> = ((
   route: Routes
) => Node<Input, Output>) & {
   __name: string
}

const routerFactory = <Input, Output>(
   name: string,
   routes: Record<any, Node<Input, Output>>
) => {
   const router: Router<keyof typeof routes, Input, Output> = (
      route: keyof typeof routes
   ) => {
      return routes[route]
   }

   router.__name = name

   return router
}

export { routerFactory as router }
