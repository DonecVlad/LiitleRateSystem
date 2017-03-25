const express      = require('express')
const app          = express()
const server       = require('http').Server(app)
const bodyParser   = require('body-parser')
const cookieParser = require('cookie-parser')
const DB           = require('./db')

app.use(bodyParser.urlencoded({extended : true}))
app.use(cookieParser())
app.use(express.static(__dirname + '/public'))

server.listen(44004)

app.get('/', (req, res) => {
    res.sendFile('index.html', {root: __dirname })
})

app.get('/check_rights', (req, res) => {
    checkRights(req, res)
})

app.post('/login', (req, res) => {
    login(req, res)
})

app.get('/tickets', (req, res) => {
    DB.getTickets((tickets) => {
        res.status(200).send(tickets)
    })
})

function checkRights(req, res) {
    
    console.log(req.cookies)
    
    if(req.cookies.name == undefined || req.cookies.passhash == undefined) {
        res.status(200).send("0")
    } else {
        DB.autoLogin(req.cookies.name, req.cookies.passhash, (o) => {
            if(o != null){
                res.status(200).send(o.permissions)
            } else {
                res.status(200).send("0")
            }
        })
    }
}

function login(req, res) {
    DB.manualLogin(req.body.name, req.body.password, (e, o) => {
        if (!o){
            res.send(e, 400);
        } else {
            res.cookie('name', o.name, { maxAge: 900000 })
            res.cookie('passhash', o.passhash, { maxAge: 900000 })
            res.status(200).send(null)
        }
    })
}