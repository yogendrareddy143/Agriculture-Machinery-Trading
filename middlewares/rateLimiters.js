const rateLimit = require('express-rate-limit');

exports.logInLimiter= rateLimit({
    windowMs:60*1000,//1 Minute window
    max:5,
    // message:"Too Many login requests. Try again later"
    handler:(req,res,next)=>{
        let err =new Error('Too Many login requests. Try again later');
        err.status=429;
        return next(err);
    }
})