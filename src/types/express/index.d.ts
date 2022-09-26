import { PrismaClient } from "@prisma/client"

export { }

declare global {
    namespace Express {
        export interface Request {
            prisma: PrismaClient
        }
    }
}