const { resolveSoa } = require("dns")
let fs = require("fs")
let path = require("path")
let usersFile = path.join(__dirname, "db", "users.json")

function getAllUsers() {
    return new Promise(function(resolve, reject) {
        fs.readFile(usersFile, "utf8", (err, data) => {
            if (err) {
                reject(new Error("An error occurred while trying to read file"))
            }
            resolve(JSON.parse(data))
        })
    })
}

function authenticateUser(req, res, role) {
    return new Promise(function(resolve, reject) {
        let body = []
        req.on("data", chunk => {
            body.push(chunk)
        }) 
        req.on("end", async () => {
            body = Buffer.concat(body).toString()
            if (!body) {
                reject(new Error("Username or password not provided"))
                return
            }

            let parsedBody = JSON.parse(body)
            let book;
            if (req.method == "POST" || req.method == "PUT") {
                if (!parsedBody.user) {
                    reject(new Error("Login details not provided"))
                    return
                }
                if (!parsedBody.book) {
                    reject(new Error("Login details not provided"))
                    return
                }
                book = parsedBody.book
                parsedBody = parsedBody.user

            }
            
            let {username, password} = parsedBody
            let allUsers
            try {
                allUsers = await getAllUsers()
            } catch(err) {
                reject(err)
            }
            let userFound = allUsers.find(user => user.username == username && user.password == password)
            if (!userFound) {
                reject(new Error("Username or password incorrect"))
                return
            }
            
            if (!role.includes(userFound.role)) {
                reject(new Error("You do not have access to this content"))
                return
            }
            resolve(book || userFound)
            
        })
    })
}

module.exports = authenticateUser