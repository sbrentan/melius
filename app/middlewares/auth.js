module.exports = function(req, res, next) {
    req.logged = false
    console.log(req.query)
    console.log(req.session)
    console.log(req.session.tokens)
    if (req.query.token) {
        req.session.tokens = (req.session.tokens || [])
        for(i=0; i<req.session.tokens.length; i++){
            console.log(req.session.tokens[i].token)
            console.log(req.query.token)
            console.log(req.session.tokens[i].token == req.query.token)
            if(req.session.tokens[i].token == req.query.token){
                req.permission = req.session.tokens[i].id
                req.user = {}
                req.user.id = req.session.tokens[i].id
                req.user.email = req.session.tokens[i].email
                req.user.role = req.session.tokens[i].role
                req.logged = true
                console.log('asdfasdfaSDFASDFASDFASDFASDF')
                next()
                return
            }
        }
        console.log("sciao belo=====================================================")
        res.status(401).json({status: 401, message: "Unauthorized"})
    } else {
        console.log("sciao belo=====================================================")
        res.status(401).json({status: 401, message: "Unauthorized"})
    }
}