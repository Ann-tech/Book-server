require("dotenv").config();

const API_KEY = process.env.API_KEY;

function authenticateUser(req, res) {
    return new Promise(function(resolve, reject) {
        let token = req.headers.authentication
        if (!token) reject(new Error("Token not provided"))

        token = token.split(" ")[1]
        if (token === API_KEY) resolve("Done")
        else reject(new Error("Invalid token"))
    })
}

module.exports = authenticateUser