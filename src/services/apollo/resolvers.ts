export const resolvers = {
    Query: {
        users: (_parent: any, args: any, context: any) => {
            return context.req.prisma.user.findMany({ orderBy: { id: 'asc' } });
        },
    }
};