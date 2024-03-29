const express = require('express')
const bcrypt = require('bcrypt')

const router = express.Router()

const { registerUser, getUser, getUsers, editUser, newId, setAuth, deleteUser } = require('../db.js')

function protected_routes (req, res, next) {
    
    if (!req.session.user) {
        req.flash('errors', 'Ruta protegida. Necesitas iniciar sesión para poder acceder')
        return res.redirect('/login')
    }

    next()
}

function loggedRoutes (req, res, next) {

    if (req.session.user) {
        req.flash('errors', 'Ya iniciaste sesión, debes hacer logout para poder acceder a dicha ruta')
        return res.redirect('/')
    }

    next()
}

router.get('/', async (req, res) => {
    const users = await getUsers()
    const user = req.session.user
    const errors = req.flash('errors')
    res.render('index.html', { users, user, errors } )
});

router.get('/login', loggedRoutes, (req, res) => {
    const success = req.flash('success')
    const errors = req.flash('errors')
    
    res.render('login.html', { errors, success })
})

router.get('/registro', loggedRoutes, (req, res) => {
    const errors = req.flash('errors')
    const success = req.flash('success')

    res.render('registro.html', { errors, success })
})

router.get('/admin', protected_routes, async (req, res) => {
    const users = await getUsers()
    const user = req.session.user
    res.render('admin.html', { users, user })
})

router.get('/datos', protected_routes, (req, res) => {
    const user = req.session.user
    const errors = req.flash('errors')
    res.render('datos.html', { user, errors })
})

router.get('/logout', (req, res) => {
    req.session.user = undefined
    res.redirect('/')
})

router.post('/registro', async (req, res) => {

    const email = req.body.email
    const nombre = req.body.nombre
    const password = req.body.password
    const password2 = req.body.password2
    const experiencia = req.body.experiencia
    const especialidad = req.body.especialidad

    let usuarioId = await newId();
    usuarioId = usuarioId.toString();

    const imagen = req.files.img
    const extension = imagen.name.split('.')[1]

    if (password != password2 ) {
        req.flash('errors', 'las contraseñas deben ser iguales')
        return res.redirect('/registro')
    }

    let user = await getUser(email)

    if (user) {
        req.flash('errors', 'El email insertado ya se encuentra registrado')
        return res.redirect('/registro')
    }

    if ((extension != 'jpg' && extension != 'jpeg' && extension != 'png') || imagen.size > 5242880) {
        req.flash('errors', 'Imagen inválida: Recuerda que sólo se permiten imágenes jpg, jpeg o png y ésta no debe superar de tamaño los 5mb')
        return res.redirect('/registro')
    }

    req.flash('success', 'Te has registrado exitosamente, ya puedes iniciar sesión')
    
    const rutaImagen = `imgs/AvatarUsuario${usuarioId}.${extension}`
    await imagen.mv(`static/${rutaImagen}`)

    const encryptedPass = await bcrypt.hash(password, 10)

    await registerUser(email, nombre, encryptedPass, experiencia, especialidad, rutaImagen)
    res.redirect('/login')
})

router.post('/editarPerfil', async (req, res) => {
    const id = req.session.user.id
    const nombre = req.body.nombre
    const password = req.body.password
    const password2 = req.body.password2
    const experiencia = req.body.experiencia
    const especialidad = req.body.especialidad

    if (password != password2) {
        req.flash('errors', 'Las contraseñas deben ser iguales')
        return res.redirect('/datos')
    }

    const encryptedPass = await bcrypt.hash(password, 10)
    
    req.flash('success', 'Has modificado tus datos exitosamente, por favor inicia sesión nuevamente')
    await editUser(nombre, encryptedPass, experiencia, especialidad, id)
    req.session.user = undefined


    res.redirect('/login')
})

router.post('/deleteUser', async (req, res) => {
    const id = req.session.user.id
    await deleteUser(id)
    req.flash('success', 'Cuenta eliminada exitosamente, puedes crearte una cuenta nueva cuando desees')
    req.session.user = undefined
    res.redirect('/registro')
})

router.post('/login', async (req, res) => {
    email = req.body.email
    password = req.body.password
    const user = await getUser(email)

    if (user == undefined) {
        req.flash('errors', 'Usuario no registrado')
        return res.redirect('/login')
    }

    const passCheck = await bcrypt.compare(password, user.password)

    if ( !passCheck ) {
        req.flash('errors', 'Contraseña incorrecta')
        return res.redirect('/login')
    }
    req.session.user = user
    res.redirect('/')
})

router.put('/users/:id', async (req, res) => {
    const id = req.params.id
    const auth = req.body.auth
    await setAuth(id, auth)

    res.send('okeeeei')
})



module.exports = router