const model = require('../models/story');

exports.index = (req,res) => {
    res.render('./story/index');
}



exports.newMachinery = (req,res) =>{
    res.render('./story/newMachinery');
}