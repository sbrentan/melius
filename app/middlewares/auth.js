module.exports = function(req, res, next) {
    req.logged = false
    if (req.body.token) {
        req.session.tokens = (req.session.tokens || [])
        for(i=0; i<req.session.tokens.length; i++){
            if(req.session.tokens[i].token == req.body.token){
                req.permission = req.session.tokens[i].id
                req.user = {}
                req.user.id = req.session.tokens[i].id
                req.user.email = req.session.tokens[i].email
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