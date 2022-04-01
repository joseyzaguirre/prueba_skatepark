const { get } = require('http')
const { Pool } = require('pg')

const pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'skatepark',
    password: '1234',
    max: 12,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
})

async function registerUser(email, nombre, password, experiencia, especialidad, foto) {
    const client = await pool.connect()

    await client.query({
        text: 'insert into skaters (email, nombre, password, anos_experiencia, especialidad, foto) values ($1, $2, $3, $4, $5, $6)',
        values: [email, nombre, password, experiencia, especialidad, foto]
    })

    client.release()
}

async function setAuth(id, auth) {
    const client = await pool.connect()

    await client.query({
        text: 'update skaters set estado=$2 where id=$1',
        values: [Number(id), auth]
    })

    client.release()
}

async function getUser(email) {
    const client = await pool.connect()

    const res = await client.query({
        text: 'select * from skaters where email=$1',
        values: [email]
    })

    client.release()

    if (res.rows.length < 1) {
        return undefined
    }

    return res.rows[0]
}

async function getUsers() {
    const client = await pool.connect()

    const res = await client.query('select * from skaters order by id')

    client.release()

    return res.rows
}

async function editUser (nombre, password, experiencia, especialidad, id) {
    const client = await pool.connect()

    await client.query({
        text: "update skaters set nombre=$1, password=$2, anos_experiencia=$3, especialidad=$4 where id=$5",
        values: [nombre, password, experiencia, especialidad, id]
    })

    client.release()
}

async function deleteUser (id) {
    const client = await pool.connect()

    await client.query({
        text: "delete from skaters where id=$1",
        values: [id]
    })

    client.release()
}

async function newId() {
    const client = await pool.connect()

    const res = await client.query('select max(id) from skaters')

    client.release()

    if (res.rows[0].max == null) {
        return 1
    }

    return (res.rows[0].max + 1) 
}

module.exports = { registerUser, getUser, getUsers, editUser, deleteUser, newId, setAuth }