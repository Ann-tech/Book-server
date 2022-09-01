const http = require("http")
const path = require("path")
const fs = require("fs")
const authenticateUser = require("./tokenAuthenticate")
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
        body.push(chunk)
    })
    req.on("end", () => {
        body = Buffer.concat(body).toString()
        let book = JSON.parse(body)
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
        .then(result => {
            getBooks(req, res)
        })
        .catch(err => {
            res.writeHead(404)
            res.end(err.message)
        })
    }
    else if (req.url == "/books" && req.method == "POST") {
        authenticateUser(req, res)
        .then(result => {
            addBook(req, res)
        })
        .catch(err => {
            res.writeHead(404)
            res.end(err.message)
        })
    }
    else if (req.url == "/books" && req.method == "PUT") {
        authenticateUser(req, res)
        .then(result => {
            updateBook(req, res)
        })
        .catch(err => {
            res.writeHead(404)
            res.end(err.message)
        })
    }
    else if (req.url.startsWith("/books") && req.method == "DELETE") {
        authenticateUser(req, res)
        .then(result => {
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