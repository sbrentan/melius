module.exports = function(req, res, next) {
    if(req.user.role != "admin" && (!req.logged || req.permission != req.params.id)){
        res.status(401).json({status: 401, message: "Unauthorized"});
        return;
    }
    next()
}
