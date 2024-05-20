//require modules
const express = require('express');
const morgan = require('morgan');
const storyRoutes = require('./routes/storyRoutes');
const userRoutes = require('./routes/userRoutes');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
//create app
const app = express();

//configure app
const port = 3000;
const host = 'localhost';
app.set('view engine', 'ejs');

mongoose.connect('mongodb://127.0.0.1:27017/agriculturedb', 
                {useNewUrlParser: true, 
                useUnifiedTopology: true})
.then(() => {
    // port 
    app.listen(port, host, () => {
        console.log('Server is running on port', port);
    });
})
.catch(err=>console.log(err.message));

app.use(
    session({
        secret: "sjdbbdvjsbvjashfbdhrfhiu",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({mongoUrl: 'mongodb://127.0.0.1:27017/agriculturedb'}),
        cookie: {maxAge: 60*60*1000}
        })
);
app.use(flash());
app.use((req, res, next) => {
    //console.log(req.session);
    res.locals.user = req.session.user||null;
    res.locals.firstName = req.session.firstName||null;
    res.locals.lastName = req.session.lastName||null;
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});

//mount middleware
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}))
app.use(morgan('tiny'));
app.use(methodOverride('_method'));
//set up routes
app.get('/',(req,res)=>{
    res.render('index');
})

app.use('/', storyRoutes);
app.use('/users',userRoutes);

app.use((req, res, next)=>{
    let err = new Error('The server cannot locate '+ req.url);
    err.status = 404;
    console.log("err",err);
    next(err);
})
app.use((err, req, res, next)=>{
    if(!err.status){
        console.log("err",err);
        err.status = 500;
        err.message = ("Internal Server Error");
    }

    res.status(err.status);
    res.render('error', {error: err});
})