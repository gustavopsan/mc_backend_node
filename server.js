require("dotenv-safe").config();
const JWT = require("jsonwebtoken");
const http = require("http");
const express = require("express");
const app = express();

const port = 3000;

const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.get("/", verifyJWT, (req, res, next) => {
    res.json(
        {
            message: "Server initializated"
        }
    )
});

app.post("/auth", (req, res, next) => {
    // TODO: Apply MySQL queries to this flux

    if(req.query.username === "admin" && req.query.password === "admin")
    {
        const userId = 1; // returned in query result
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
                message: "Invalid credentials!"
            }
        )
    }
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
                message: "No token provided"
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