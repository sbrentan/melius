require("dotenv").config()

module.exports = {
    ROOT: "/ui",
    DB_URL: process.env.DB_URL,
    PORT: process.env.PORT,
    SECRET_KEY: process.env.SECRET_KEY,
    SESSION_KEY: process.env.SESSION_KEY
}
