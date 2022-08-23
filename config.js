const { config } = require('dotenv');
config();

module.exports = {
    db: {
        url: process.env.DB_URL
    },

    jwtSecret: {
        st_password: process.env.JWT_SECRET
    }
}