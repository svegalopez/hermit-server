/* istanbul ignore file */
import { getHash } from './../../utils/passwordHash';

export default [
    {
        email: 'svegalopez@gmail.com',
        password: getHash('Rootroot1!')
    },
    {
        email: 'sebastianvega.dev@gmail.com',
        password: getHash('Rootroot1!')
    }
];