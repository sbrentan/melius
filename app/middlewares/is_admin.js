module.exports = function(req, res, next) {
    if(req.logged){
        if(req.user.role == "admin"){
            next()
            return;
        }
    }
    res.status(401).json({status: 401, message: "Unauthorized"});
}
