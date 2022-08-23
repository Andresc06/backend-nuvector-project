const valid = (schema) => async (req, res, next) => {

    // Se obtiene el body donde se encuentra lo que se debe comparar
    const body = req.body;

    try {
        
        // se realiza la validacion
        await schema.validate(body);
        return next();

    } catch (error) {
        return res.status(400).json({ error })
    }
}


module.exports = valid