const jwt = require("jsonwebtoken")
const { jwtSecret } = require('../config')


// Antes de obtener la ruta va a acceder a la consulta
module.exports = async (req, res, next) => {

    try {
        
        // jwtToken esta dentro del header
        const jwtToken = req.header("token");

        // Si no es el mismo entonces se dice que no esta autorizado
        if(!jwtToken) {
            return res.status(403).json({ msg: "authorization denied" })
        }

        //Verificacion
        const payload = jwt.verify(jwtToken, jwtSecret.st_password);

        req.user = payload.user;
        next();

    } catch (error) {
        console.error(error.message)
        return res.status(401).json({ msg: "Token is not valid" })
    }
}