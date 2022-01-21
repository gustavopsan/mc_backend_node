require("dotenv-safe").config();
const JWT = require("jsonwebtoken");
const http = require("http");
const express = require("express");
const app = express();
const SQL = require("./database");
const CORS = require("cors");
const bodyParser = require("body-parser");

const port = 3000;

app.use(bodyParser.json());
app.use(CORS());

app.get("/", (req, res) => {
    res.json(
        {
            message: "Server initializated."
        }
    )
});

app.post("/checkLogin", (req, res) => {
    let token = req.body.token;

    if(!token)
    {
        res.json(
            {
                auth: false,
                message: "No token provided."
            }
        )
    }
    else
    {
        JWT.verify(token, process.env.SECRET, (error, decoded) =>{
            if (error)
            {
                console.info("API: Session invalid");
                res.json(
                    {
                        auth: false,
                        message: "Failed to authenticate token"
                    }
                )
            }
            else
            {
                console.info("API: Session authenticated successfully");
                res.json(
                    {
                        auth: true,
                        decodedInfo: decoded,
                        message: "Session authenticated successfully."
                    }
                )
            }
        })
    }
})

app.post("/auth", (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    console.log("API: Data received: ", req.body);

    SQL.query(`SELECT * FROM mc_users WHERE username="${username}"`, (error, rows) => {
        if (error)
        {
            res.json({
                message: "Unexpected error on database query.", error
            });
        }
        else
        {
            if(rows.length > 0)
            {
                console.info("API: Username matched on query.");
                if(password === rows[0]._password)
                {
                    console.info("API: Password matched on query.");
                    const userId = rows[0].user_id;
                    const token = JWT.sign({userId}, process.env.SECRET, {
                        expiresIn: 5000
                    });

                    return res.json(
                        {
                            auth: true,
                            token: token
                        }
                    )
                }
                else
                {
                    console.info("API: Failed to logon: Password not matched.");
                    res.json(
                        {
                            auth: false,
                            token: null,
                            message: "Invalid password"
                        }
                    )
                }
            }
            else
            {
                console.info("API: Failed to logon: User not matched.");
                res.json(
                    {
                        auth: false,
                        token: null,
                        message: "Username does not exist"
                    }
                )
            }
        }
    })
})

app.post("/logout", (req, res) => {
    res.json(
        {
            auth: false,
            token: null
        }
    )
})

const server = http.createServer(app);
server.listen(port);
console.log(`Server listen on http://localhost:${port}`);