import { randomBytes, scryptSync } from "crypto";

export const getHash = (password: string) => {
    const salt = randomBytes(16).toString("hex");
    return `${scryptSync(password, salt, 32).toString("hex")}-$-${salt}`;
};

export const compareSync = (provided: string, stored: string) => {
    const storedSalt = stored.split('-$-')[1];
    const storedHash = stored.split('-$-')[0];
    return (storedHash === scryptSync(provided, storedSalt, 32).toString("hex"));
};