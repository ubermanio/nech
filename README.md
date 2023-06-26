# Nech

Nech is a simple library for encapsulating business logic into smaller, shareable DDD-inspired blocks. TypeScript + Batteries included. ⚡️

| Function          | Description                                                                                                                                                                        | Usage                                                                        |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [Entity](#entity) | A representation of an exchangable data entry.                                                                                                                                     | `const Price = entity('Price', z.number().positive())`                       |
| [Node](#node)     | Nodes are a single-responsibility abstraction of small steps of business logic. Nodes on their own are basically just functions (feel free to simply call them).                   | `const $createPrice = node('CreatePrice', z.number(), price => price * 100)` |
| [Chain](#chain)   | A `chain` is a node that executes an array of nodes in order. All nodes inside a chain (except for the first one) need to expect the same `schema` as their input.                 | TODO                                                                         |
| [Router](#router) | Routers allows you to define a set of nodes that expect the same `schema` as their input, that can be executed based on a given input. Each `node` inside a router needs to expect | ``                                                                           |

### Entity

```typescript
entity<T>(name: string, schema: ZodSchema<T>): Entity<T>
```

An entity represents some kind of (exchangable) data entry. Whether it be a Database model or just the result of an operation.

You can either define a simple entity

```typescript
import { z } from 'zod'
import { entity } from 'nech'

const Price = entity('Price', z.number().positive())
```

or a more complex one

```typescript
import { z } from 'zod'
import { entity } from 'nech'

const UserEntityy = entity(
   'User',
   z.object({
      id: z.string().uuid(),
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(8),
      createdAt: z.date(),
      updatedAt: z.date(),
   })
)
```

As `entity` i just a factory method for a new class extending `Entity`, you can also define custom methods, getters and setters etc. on your entities.

```typescript
import { z } from 'zod'
import { entity } from 'nech'

class UserEntity extends entity(
   'User',
   z.object({
      id: z.string().uuid(),
      name: z.string(),
      lastName: z.string(),
      email: z.string().email(),
      password: z.string().min(8),
      image: z.string().url().optional(),
      createdAt: z.date(),
      updatedAt: z.date(),
   })
) {
   public get fullName(): string {
      return `${this.name} ${this.lastName}`
   }

   public set fullName(fullName: string) {
      const [name, lastName] = fullName.split(' ')
      this.name = name
      this.lastName = lastName
   }

   introduce() {
      console.log(`Hello, my name is ${this.fullName}!`)
   }

   static create(input: ) {
      // ... this is just an example. You could connect you Database here and create a new user.
      return new UserEntity(input)
   }
}
```

### Node

```typescript
node<Input, Output>(name: string, inputSchema: ZodSchema<Input>, handler: ((input: Input): Output)): Node<Input, Output>
```

```typescript
import { z } from 'zod'
import { node, type EntityOf } from 'nech'

const $createUser = node(
   'CreateUser',
   z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(8),
      image: z.string().url().optional(),
   }),
   async ({ name, email, password }: EntityOf<UserEntity>) => {
      // Imagine
      const user = await UserEntity.create({ name, email, password })
      return user
   }
)

const $sendWelcomeEmail = node(
   'SendWelcomeEmail',
   UserEntity.schema,
   async user => {
      // Imagine
      await sendEmail(user.email, 'Welcome to our platform!')
      return user
   }
)

const $generateUserProfileImage = node(
   'GenerateUserProfileImage',
   UserEntity.schema,
   async user => {
      // Imagine
      const image = await generateUserProfileImage(user)
      user.image = image

      // Imagine
      await user.save()

      return user
   }
)
```

### Chain

```typescript
chain<Input, Output, Context>(name: string, nodes: [Node<Input, Context>, ...Node<Context, Context>, Node<Context, Output>]): Chain<Input, Output, Context>
```

```typescript
import { chain } from 'nodeflo'

const UserSignup = chain('UserSignup', [
   $createUser,
   $sendWelcomeEmail,
   $generateUserProfileImage,
])

// Somewhere in a route controller

const user = await UserSignup.execute(payloadData)
```

### Router

```typescript
router<Input, Output>(name: string, routes: Record<string, Node<Input, Output>>): Router<Input, Output>
```
