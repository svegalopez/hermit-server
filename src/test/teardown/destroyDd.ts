/* istanbul ignore file */
const mysql = require("mysql");

export default function () {
    return new Promise<void>((res, rej) => {
        const conn = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'rootroot',
        });

        conn.connect(function (err: Error) {
            if (err) rej(err);
            conn.query(
                `DROP DATABASE IF EXISTS test_${process.pid}`,
                function (err: Error) {
                    if (err) return rej(err);
                    conn.end();
                    res();
                }
            );
        });
    });
};