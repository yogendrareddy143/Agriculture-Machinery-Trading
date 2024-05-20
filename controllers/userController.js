const model = require('../models/user');
const machinerySchema = require('../models/story');

exports.new = (req, res) => {
    res.render('./user/new');
};

exports.create = (req, res, next) => {
    let user = new model(req.body);
    user.save()
        .then(user => {
            req.flash('success', 'You have successfully registered');
            res.redirect('/users/login')
        })
        .catch(err => {
            if (err.name === 'ValidationError') {
                req.flash('error', err.message);
                return res.redirect('/users/new');
            }

            if (err.code === 11000) {
                req.flash('error', 'Email has been used');
                return res.redirect('/users/new');
            }

            next(err);
        });
};

exports.getUserLogin = (req, res, next) => {

    res.render('./user/login');
}

exports.login = (req, res, next) => {

    let email = req.body.email;
    let password = req.body.password;
    model.findOne({ email: email })
        .then(user => {
            if (!user) {
                console.log('wrong email address');
                req.flash('error', 'wrong email address');
                res.redirect('/users/login');
            } else {
                user.comparePassword(password)
                    .then(result => {
                        if (result) {
                            req.session.user = user._id;
                            req.flash('success', 'Welcome Back,',user.firstName );
                            res.redirect('/users/profile');
                        } else {
                            req.flash('error', 'wrong password');
                            res.redirect('/users/login');
                        }
                    });
            }
        })
        .catch(err => next(err));
};

exports.profile = (req, res, next) => {
    let id = req.session.user;
    Promise.all([model.findById(id), 
        machinerySchema.find({ author: id }),
        machinerySchema.find({watchList: id }).select("title category status"),
        machinerySchema.find({offerItemOwner: id, status: "Pending"})
        .populate("offerItemId", "title imageUrl category status")
        .select("title category status offerItemId")
    ])
        .then(results => {
            console.log("results",results)
            const [user, machineries,watchlist,offers] = results;
            res.render('./user/profile', { user, machineries,watchlist,offers })
        })
        .catch(err => next(err));
};


exports.logout = (req, res, next) => {
    req.session.destroy(err => {
        if (err)
            return next(err);
        else
            res.redirect('/');
    });

};



