const express = require('express')

const router = express.Router()

const { registerUser, getUserEmail, newId } = require('../db.js')

router.get('/', (req, res) => {

    res.render('index.html')
});

router.get('/login', (req, res) => {

    res.render('login.html')
})

router.get('/registro', (req, res) => {

    res.render('registro.html')
})

router.post('/registro', async (req, res) => {

    const email = req.body.email
    const nombre = req.body.nombre
    const password = req.body.password
    const password2 = req.body.password2
    const experiencia = req.body.experiencia
    const especialidad = req.body.especialidad

    const imagen = req.files.img
    const extension = imagen.name.split('.')[1]

    let usuarioId = await newId();
    usuarioId = usuarioId.toString();

    if (password != password2 ) {
        return res.send('Las contraseñas no coinciden')
    }

    let user = await getUserEmail(email)

    if (user) {
        return res.send('Un usuario con éste email ya se encuentra registrado')
    }

    if ((extension != 'jpg' && extension != 'jpeg' && extension != 'png') || imagen.size > 5242880) {
        return res.send('formato de imagen inválido o imagen excede el peso límite: Recuerda que sólo se permiten imágenes en formato jpg, jpeg o png que no superen los 5mb')
    }
    
    const rutaImagen = `imgs/AvatarUsuario${usuarioId}.${extension}`
    await imagen.mv(`static/${rutaImagen}`)

    await registerUser(email, nombre, password, experiencia, especialidad, rutaImagen)
    res.send('holiiiii')
})



module.exports = router