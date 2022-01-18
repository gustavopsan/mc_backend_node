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

app.get("/", verifyJWT, (req, res) => {
    res.json(
        {
            message: "Server initializated."
        }
    )
});

app.post("/auth", (req, res, next) => {
    let username = req.body.username;
    let password = req.body.password;

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
                if(password === rows[0]._password)
                {
                    const userId = rows[0].user_id;
                    const token = JWT.sign({userId}, process.env.SECRET, {
                        expiresIn: 600
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

function verifyJWT(req, res, next) {
    const token = req.headers["x-access-token"];

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
                res.json(
                    {
                        auth: false,
                        message: "Failed to authenticate token"
                    }
                )
            }
            else
            {
                req.userId = decoded.userId;
                next();
            }
        })
    }
}

const server = http.createServer(app);
server.listen(port);
console.log(`Server listen on http://localhost:${port}`);