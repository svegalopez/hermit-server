import { PrismaClient, User } from "@prisma/client"

export { }

declare global {
    namespace Express {
        export interface Request {
            prisma: PrismaClient,
            user?: Omit<User, "password">
        }
    }
}