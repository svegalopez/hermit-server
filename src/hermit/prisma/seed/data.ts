/* istanbul ignore file */
import { getHash } from './../../utils/passwordHash';


const users = [
    {
        email: 'svegalopez@gmail.com',
        password: getHash('Rootroot1!')
    },
    {
        email: 'sebastianvega.dev@gmail.com',
        password: getHash('Rootroot1!')
    },
    {
        email: 'admin1@test.com',
        password: getHash('Rootroot1!')
    }
]

const roles = [{ name: 'admin' }]

export { users, roles };