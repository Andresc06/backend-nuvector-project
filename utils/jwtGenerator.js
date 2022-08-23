const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config')

// Generador de JWT
function jwtGenerator(user_id) {

    // en el payload se encuntra el id del user
    const payload = {
        user: user_id
    }

    // se crea el jwt con el payload (user_id), la contraseña secreta y expira el 30 min
    return jwt.sign(payload, jwtSecret.st_password, {expiresIn: '30m'})
}

module.exports = jwtGenerator;