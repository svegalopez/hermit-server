/* istanbul ignore file */
import { hashSync } from "bcrypt";

export default [
    {
        email: 'svegalopez@gmail.com',
        password: hashSync('Rootroot1!', 10)
    },
    {
        email: 'sebastianvega.dev@gmail.com',
        password: hashSync('Rootroot1!', 10)
    }
];