const express = require('express')

const router = express.Router()

const { registerUser, getUser, getUsers, newId } = require('../db.js')

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
    
    if (errors.length > 0) {
        return res.render('login.html', { errors })
    }

    if (success.length > 0) {
        return res.render('login.html', { success })
    }
    res.render('login.html')
})

router.get('/registro', loggedRoutes, (req, res) => {
    const errors = req.flash('errors')

    if (errors.length > 0) {
        return res.render('registro.html', { errors })
    }

    res.render('registro.html')
})

router.get('/admin', protected_routes, (req, res) => {
    const user = req.session.user
    res.render('admin.html', { user })
})

router.get('/datos', protected_routes, (req, res) => {
    const user = req.session.user
    res.render('datos.html', { user })
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

    await registerUser(email, nombre, password, experiencia, especialidad, rutaImagen)
    res.redirect('/login')
})

router.post('/login', async (req, res) => {
    email = req.body.email
    password = req.body.password
    const user = await getUser(email)

    if (user == undefined) {
        req.flash('errors', 'Usuario no registrado')
        return res.redirect('/login')
    }

    if (password != user.password) {
        req.flash('errors', 'Contraseña incorrecta')
        return res.redirect('/login')
    }
    req.session.user = user
    res.redirect('/')
})



module.exports = router