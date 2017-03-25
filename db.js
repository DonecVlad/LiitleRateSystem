const crypto    = require('crypto')
const mysql     = require('mysql')
const db_config = {
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: 'gT3A76Z',
    database: 'testdb'
}

let connection
const fields = ["tickets", "title", "solution", "rate"]

function handleDisconnect() {
    connection = mysql.createConnection(db_config)
    connection.connect((err) => {
        if(err) {
            console.log('Error when connecting to db:', err)
            setTimeout(handleDisconnect, 2000)
        } else {
            console.log('DB Connected!')
        }
    })
    
    connection.on('error', (err) => {
        console.log('db error', err)
        if(err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect()
        } else {
            throw err
        }
    })
}

handleDisconnect()

exports.getTickets = (callback) => {
    connection.query('SELECT * FROM tickets ORDER BY id', (err, rows) => {
        if(err) throw err
        callback(rows)
    })
}

exports.updateTicket = (field, val, id, callback) => {
    connection.query("UPDATE tickets SET " + fields[field] + " = ? WHERE id = ?", [val, id], (err, rows) => {
        if(err) throw err
        callback(rows)
    })
}

exports.autoLogin = (name, passhash, callback) => {
    connection.query("SELECT * FROM users WHERE name = " + connection.escape(name), (err, rows) => {
        if(rows.length > 0){
            if(rows[0].passhash == passhash){
                callback(rows[0])
            } else {
                callback(null)
            }
        } else {
            callback(null)
        }
    })
}

exports.manualLogin = (name, pass, callback) => {
    connection.query("SELECT * FROM users WHERE name = " + connection.escape(name), (err, rows) => {
        if(rows.length > 0){
            validatePassword(pass, rows[0].passhash, (res) => {
                if(res){
                    callback(null, rows[0])
                } else {
                    callback('invalid-password', null)
                }
            })
        } else {
            callback('user-not-found', null)
        }
    })
}

var validatePassword = (plainPass, hashedPass, callback) => {
    let salt = hashedPass.substr(0, 10)
    let validHash = salt + md5(plainPass + salt)
    
    callback(hashedPass === validHash)
}

var md5 = (str) => {
    return crypto.createHash('md5').update(str).digest('hex')
}

var generateSalt = () => {
	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ'
	var salt = ''
	for (var i = 0; i < 10; i++) {
		var p = Math.floor(Math.random() * set.length)
		salt += set[p]
	}
	return salt
}

var saltAndHash = (pass, callback) => {
	var salt = generateSalt()
	callback(salt + md5(pass + salt))
}