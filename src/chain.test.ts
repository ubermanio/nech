import { describe, expect, test } from 'bun:test'
import z from 'zod'
import { entity, chain, node } from '.'

const sumNode = node('SumNode', ({ x, y }: { x: number; y: number }) => x + y)
const squareNode = node('SquareNode', (x: number) => x * x)
const printNode = node('PrintNode', (x: number) => `The result is ${x}`)

describe('Chain', () => {
   test('Valid Chain with multiple nodes', async () => {
      const chainNode = chain('NumberTransformationChain', [
         sumNode,
         squareNode,
         printNode,
      ])

      const result = await chainNode({ x: 2, y: 3 })

      expect(result.error).toBeUndefined()
      expect(result.data).toBe('The result is 25')
   })

   test('Throws with less than two nodes', async () => {
      // @ts-expect-error
      expect(() => chain('InvalidChainNode', [sumNode])).toThrow(
         'Chain requires at least 2 nodes'
      )
   })

   test('Chain with error throwing node', async () => {
      const errorNode = node('ErrorNode', () => {
         throw new Error('Node2 error')
      })

      const chainWithErrorChain = chain('chainWithErrorChain', [
         squareNode,
         squareNode,
         errorNode,
         printNode,
      ])

      const result = await chainWithErrorChain(10)

      expect(result.error).toBeInstanceOf(Error)
      expect(result.data).toBe(undefined)
   })

   test('Complex Chain', async () => {
      class UserEntity extends entity(
         'User',
         z.object({
            id: z.string(),
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
            // console.log(`Hello, my name is ${this.fullName}!`)
         }

         async save() {
            // console.log(`Saving user ${this.fullName}...`)
            await new Promise(resolve => setTimeout(resolve, 100))
            // console.log(`User ${this.fullName} saved!`)
         }

         static create(input: {
            name: string
            lastName: string
            email: string
            password: string
         }) {
            // ... this is just an example. You could connect you Database here and create a new user.
            const user = new UserEntity({
               ...input,
               id: '123',
               createdAt: new Date(),
               updatedAt: new Date(),
            })

            return user
         }
      }

      const $createUser = node(
         'CreateUser',
         async ({
            name,
            lastName,
            email,
            password,
         }: Pick<UserEntity, 'name' | 'lastName' | 'email' | 'password'>) => {
            // Imagine
            const user = await UserEntity.create({
               name,
               lastName,
               email,
               password,
            })
            return user
         }
      )

      const $sendWelcomeEmail = node(
         'SendWelcomeEmail',
         async (user: UserEntity) => {
            // Imagine
            const sendMail = async (email: string, message: string) => {
               // Imagine
               await new Promise(resolve => setTimeout(resolve, 100))
            }

            await sendMail(user.email, 'Welcome to our platform!')

            return user
         }
      )

      const $generateUserProfileImage = node(
         'GenerateUserProfileImage',
         async (user: UserEntity) => {
            // Imagine
            const generateImage = (user: UserEntity) => {
               return `https://ui-avatars.com/api/?name=${user.fullName}&size=256`
            }

            const image = generateImage(user)
            user.image = image

            // Imagine
            await user.save()

            return user
         }
      )

      const UserSignupChain = chain('UserSignup', [
         $createUser,
         $sendWelcomeEmail,
         $generateUserProfileImage,
      ])

      const res = await UserSignupChain({
         email: 'hello@world.com',
         lastName: 'Jackson',
         name: 'Michael',
         password: '12345678',
      })

      expect(res.error).toBeUndefined()
      expect(res.data).toBeInstanceOf(UserEntity)
      expect(res.data?.email).toBe('hello@world.com')
      expect(res.data?.fullName).toBe('Michael Jackson')
      expect(res.data?.image).toBe(
         'https://ui-avatars.com/api/?name=Michael Jackson&size=256'
      )
   })
})
