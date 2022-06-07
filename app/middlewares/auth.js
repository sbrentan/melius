module.exports = function(req, res, next) {
    req.logged = false
    if (req.query.token) {
        req.session.tokens = (req.session.tokens || [])
        for(i=0; i<req.session.tokens.length; i++){
            if(req.session.tokens[i].token == req.query.token){
                req.permission = req.session.tokens[i].id
                req.user = {}
                req.user.id = req.session.tokens[i].id
                req.user.email = req.session.tokens[i].email
                req.user.role = req.session.tokens[i].role
                req.logged = true
                next()
                return
            }
        }
        res.status(401).json({status: 401, message: "Unauthorized"})
    } else {
        res.status(401).json({status: 401, message: "Unauthorized"})
    }
}