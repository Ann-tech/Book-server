// const http = require("http")
// const path = require("path")
// const fs = require("fs")
// const port = 8000
// const hostName = "localhost"
// const bookFile = path.join(__dirname, "/db/books.json")

// function getBooks(req, res) {
//     fs.readFile(bookFile, (err, data) => {
//         if (err) {
//             console.log("An error has occurred")
//             res.writeHead(404)
//             res.end("An error has ocurred")
//             return
//         }
//         res.writeHead(200)
//         res.end(data)
//     })
// }

// function addBook(req, res) {
//     fs.readFile(bookFile, "utf8", (err, data) => {
//         if (err) {
//             res.writeHead(404)
//             console.log("An error has occurred")
//             return
//         }
//         console.log(data)
//         let bookObject = JSON.parse(data)
//         console.log(bookObject)
//         let body = [];
//         let book;
//         req.on("data", (chunk) => {
//             body.push(chunk)
//         })
//         req.on("end", () => {
//             body = Buffer.concat(body).toString()
//             book = JSON.parse(body)
//             let id = bookObject[bookObject.length - 1].id + 1
//             book.id = id
//             bookObject.push(book)
    
//             fs.writeFile(bookFile, JSON.stringify(bookObject, null, 2), (err) => {
//                 if (err) {
//                     console.log("An error has ocurred")
//                     res.writeHead(404)
//                     res.end("An error has ocurred")
//                     return
//                 }
//                 res.writeHead(404)
//                 res.end(JSON.stringify(bookObject))
//             })
//         })
//     })
// }


// function requestListener(req, res) {
//     if (req.url == "/books" && req.method == "GET") getBooks(req, res)
//     if (req.url == "/books" && req.method == "POST") addBook(req, res)
//     if (req.url == "/books" && req.method == "UPDATE") updateBook(req, res)
//     if (req.url == "/books" && req.method == "DELETE") deleteBooks(req, res)
// }


// const server = http.createServer(requestListener)
// server.listen(port, hostName, () => {
//     console.log(`Currently running on http://${hostName}:${port}`)
// })


const http = require("http")
const path = require("path")
const fs = require("fs")
const authenticateUser = require("./authenticate")
const port = 8000
const hostName = "localhost"
const bookFile = path.join(__dirname, "/db/books.json")
let booksDb = []

function getBooks(req, res) {
    fs.readFile(bookFile, (err, data) => {
        if (err) {
            res.writeHead(404)
            res.end("An error has ocurred")
            return
        }
        res.writeHead(200)
        res.end(data)
    })
}

function addBook(req, res) {
    let body = [];
    req.on("data", chunk => {
        console.log("hello")
        body.push(chunk)
    })
    req.on("end", () => {
        console.log("hello")
        body = Buffer.concat(body).toString()
        let book = JSON.parse(body)
        book = book.book
        let id = booksDb[booksDb.length - 1].id + 1
        book.id = id
        booksDb.push(book)

        fs.writeFile(bookFile, JSON.stringify(booksDb, null, 2), err => {
            if (err) {
                res.writeHead(404)
                res.end("An error has ocurred")
                return
            }
            
            res.writeHead(200)
            res.end(JSON.stringify(booksDb))
        })
    })
}

function updateBook(req, res) {
    let body = [];
    req.on("data", chunk => {
        body.push(chunk)
    })
    req.on("end", () => {
        body = Buffer.concat(body).toString()
        let book = JSON.parse(body)
        book = book.book
        let index = booksDb.findIndex(b => b.id == book.id)
        if (index == -1) {
            res.writeHead(404)
            res.end(JSON.stringify({message: "book id not found"}))
            return
        }
        booksDb[index] = {...booksDb[index], ...book}
        fs.writeFile(bookFile, JSON.stringify(booksDb, null, 2), err => {
            if (err) {
                res.writeHead(404)
                res.end("An error has ocurred")
                return
            }
            
            res.writeHead(200)
            res.end(JSON.stringify(booksDb))
        })
    })
}

function deleteBook(req, res) {
    let bookId = req.url.split("/")[2]
    let index = booksDb.findIndex(b => b.id == bookId)
    if (index == -1) {
        res.writeHead(404)
        res.end(JSON.stringify({message: "book id not found"}))
        return
    }
    booksDb.splice(index, 1)
    fs.writeFile(bookFile, JSON.stringify(booksDb, null, 2), err => {
        if (err) {
            res.writeHead(404)
            res.end("An error has ocurred")
            return
        }
        
        res.writeHead(200)
        res.end(JSON.stringify(booksDb))
    })
}


function requestListener(req, res) {
    res.setHeader("Content-Type", "application/json")
    if (req.url == "/books" && req.method == "GET") {
        authenticateUser(req, res)
        .then(user => {
            getBooks(req, res)
        })
        .catch(err => {
            res.writeHead(404)
            res.end(err.message)
        })
    }
    else if (req.url == "/books" && req.method == "POST") {
        authenticateUser(req, res)
        .then(user => {
            addBook(req, res)
        })
        .catch(err => {
            res.writeHead(404)
            res.end(err.message)
        })
    }
    else if (req.url == "/books" && req.method == "PUT") {
        authenticateUser(req, res)
        .then(user => {
            updateBook(req, res)
        })
        .catch(err => {
            res.writeHead(404)
            res.end(err.message)
        })
    }
    else if (req.url.startsWith("/books") && req.method == "DELETE") {
        authenticateUser(req, res)
        .then(user => {
            deleteBook(req, res)
        })
        .catch(err => {
            res.writeHead(404)
            res.end(err.message)
        })
    }
    else {
        res.writeHead(404)
        res.end(JSON.stringify({message: "method not supported"}))
    }
}


const server = http.createServer(requestListener)
server.listen(port, hostName, () => {
    booksDb = JSON.parse(fs.readFileSync(bookFile, "utf8"))
    console.log(`Currently running on http://${hostName}:${port}`)
})