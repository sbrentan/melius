module.exports = function(req, res, next) {
    if(req.logged){
        console.log("is logged")
        if(req.user.role == "admin"){
            console.log("is admin")
            next()
            return;
        }
    }
    console.log("is not admin")
    res.status(401).json({status: 401, message: "Unauthorized"});
}
