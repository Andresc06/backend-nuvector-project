const express = require('express');
const app = express();
const cors = require("cors");


//MIDDLEWARE

app.use(express.json()) //acceso a req.body
app.use(cors()) //Interaccion con el backend


//ROUTES

//Registro y Login del usuario
app.use("/authentication", require("./routes/jws.routes"))

//Dashboard
app.use("/dashboard", require("./routes/dashboard.routes"))

app.listen(process.env.PORT || 5000);
console.log("server working", process.env.PORT || 5000);