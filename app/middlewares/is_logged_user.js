module.exports = function(req, res, next) {
    console.log("-=============================================================")
    console.log(req.logged)
    console.log(req.permission)
    console.log(req.params.id)
    if(!req.logged || req.permission != req.params.id){
        console.log("lu")
        res.status(401).json({status: 401, message: "Unauthorized"});
        return;
    }
    next()
}
