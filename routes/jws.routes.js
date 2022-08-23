const { Router } = require("express");
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utils/jwtGenerator");
const valid = require("../middleware/validInfo")
const { registerSchema, loginSchema } = require("../validation/userValidation")
const authorization = require("../middleware/authorization")

const router = Router();

// REGISTER ROUTE

router.post("/register", valid(registerSchema), async (req, res) => {
    try {

        // 1 destructural el req.body (name, email, password)

        const { name, email, password } = req.body;
        
        // 2 Chequear si el usuario existe

        const user = await pool.query("SELECT * FROM users WHERE email = $1", [
            email
        ])

        if(user.rows.length !== 0) {
            return res.status(401).json("User already exists");
        }

        // 3. Bcrypt la contraseña del usuario

        // saltRound es aproximadamente el esfuerzo que hace bcrypt
        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);

        const bcryptPassword = await bcrypt.hash(password, salt);

        // 4 Ingresar los datos del user en la DB

        const newUser = await pool.query("INSERT INTO users (name, email, secret_password) VALUES ($1, $2, $3) RETURNING *", [
            name,
            email,
            bcryptPassword
        ])

        // 5 Generar el JWT

        const token = jwtGenerator(newUser.rows[0].code_uid)

        res.json({ token });

    } catch (err) {
        console.error(err.message);
        res.status(500).json('server error');
    }
})


// RUTA DE LOGIN

router.post("/login", valid(loginSchema), async (req, res) => {
    try {
        
        // 1 Destructurar req.body

        const {email, password} = req.body;

        // 2 Chequear si el user no existe

        const user = await pool.query("SELECT * FROM users WHERE email = $1", [
            email
        ]);

        if (user.rows.length === 0) {
            return res.status(401).json('Password or email is incorrect')
        }

        // 3 Chequear si la contraseña es la misma que la de DB

        const validPassword = await bcrypt.compare(password, user.rows[0].secret_password);

        if (!validPassword) {
            return res.status(401).json('Password or email is incorrect')
        }

        // 4 Darle el token al usuario

        const token = jwtGenerator(user.rows[0].code_uid);

        res.json({ token });

    } catch (error) {
        console.error(error.message);
    }
});


// DASHBOARD
router.get("/verify", authorization, async(req, res) => {

    try {
        
        res.json(true);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
}) 

module.exports = router;