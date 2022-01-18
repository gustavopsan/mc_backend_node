const mysql = require("mysql");
const DB = require("./.config/db.config");

const connection = mysql.createConnection(
    {
        host: DB.host,
        user: DB.user,
        password: DB.password,
        database: DB.db
    }
);

connection.connect(error => {
    if(error)
    {
        console.warn(error)
    }
    else
    {
        console.log("Successfully connect to database.")
    }
});

module.exports = connection;