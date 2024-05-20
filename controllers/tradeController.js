const Machinery = require('../models/story');
const ObjectId = require('mongoose').Types.ObjectId;

exports.machineries = (req,res,next) => {
    let machineryCategories = [];
    Machinery.distinct("category", function(error, res){
        machineryCategories = res;
    });
    Machinery.find().sort({"title":1})
    .then(machineryDetails=>{
        res.render('./story/machineries',{machineryDetails,machineryCategories});
    })
    .catch(err=>next(err));
    
}

//Get /stories/new: send html form for creating a new story


//post /stories: create a new story

exports.create =(req,res,next)=>{
   // res.send('created a new form');
   let story = new Machinery(req.body);
   story.author = req.session.user;
   story.status = "Available";
   story.save()
   .then(()=>{
    req.flash("Success", "Trade has been Successfully Created");
    res.redirect('/machineries');
   })
   .catch((err)=>{
    if(err.name === "ValidationError"){
        err.status = 400;
        req.flash("error", err.message);
    }
    next(err);
});
    
};

//Get /machineries: id: send details of machinery identified by id
exports.machinery = (req,res,next)=>{
    //  res.send('send machinery with id');
    let id = req.params.id;
    
    Machinery.findById(id)
    .then(machinery =>{
        //console.log("machinery list",machinery)
        if(machinery){
            let canWatch = true;
            if(machinery.watchList.includes(req.session.user)){
                canWatch = false;
            }
            res.render('./story/machinery',{machinery,canWatch});
        }
        else{
            let err = new Error('cannot find the machinery with the id '+ id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => next(err))
}

exports.edit = (req,res, next)=>{
     //   res.send('send the edit form');
    let id = req.params.id;
    if(ObjectId.isValid(id)){
        if(!id.match(/^[0-9a-fA-F]{24}$/)) {
            let err = new Error('Invalid machinery id');
            err.status = 400;
            return next(err);
        }
    Machinery.findById(id)
    .then(machinery =>{
        if(machinery){
            res.render('./story/edit',{machinery});
        }
        else{
            let err = new Error('cannot find the machinery with the id '+ id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => next(err))
}
    else{
        let error = new Error('The route parameter is not a valid objectid:'+id);
        error.status = 400;
        next(error);
    }

};

exports.update = (req,res, next)=>{
    //res.send('update story with id' + req.params.id);
    let id = req.params.id;
    let machineryDetails = req.body;
    if(ObjectId.isValid(id)){
        if(!id.match(/^[0-9a-fA-F]{24}$/)) {
            let err = new Error('Invalid machinery id');
            err.status = 400;
            return next(err);
        }
    Machinery.findByIdAndUpdate(id, machineryDetails, {useFindAndModify: false, runValidators: true})
    .then(machinery =>{
        if(machinery){
            res.redirect('/machinery/'+id);
        }
        else{
            let err = new Error('cannot find the machinery with the id '+ id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => next(err))
}
    else{
        let error = new Error('The route parameter is not a valid objectid:'+id);
        error.status = 400;
        next(error);
    }
};

exports.delete = (req,res, next)=>{
 //   res.send('delete story with id' + req.params.id);
 let id = req.params.id;
 if(ObjectId.isValid(id)){
     if(!id.match(/^[0-9a-fA-F]{24}$/)) {
         let err = new Error('Invalid machinery id');
         err.status = 400;
         return next(err);
     }
 Machinery.findByIdAndDelete(id, {useFindAndModify: false, runValidators: true})
 .then(machinery =>{
     if(machinery){
        res.redirect('/machineries');
     }
     else{
         let err = new Error('cannot find the machinery with the id '+ id);
         err.status = 404;
         next(err);
     }
 })
 .catch(err => next(err))
    }
 else{
     let error = new Error('The route parameter is not a valid objectid:'+id);
     error.status = 400;
     next(error);
 }

 
};

exports.watchFeature = (req, res, next) => {
    let id = req.params.id;
    let userId = req.session.user
    Machinery
      .findByIdAndUpdate(
        id,
        { $addToSet: {watchList: userId}},
        {useFindAndModify: false, runValidators: true}
      )
      .then(()=>{
        return res.redirect("/users/profile");
      })
      .catch((err)=>{
        next(err);
      });
};

exports.unwatchFeature = (req, res, next) =>{
    let id = req.params.id;
    let userId = req.session.user
    Machinery
      .findByIdAndUpdate(
        id,
        { $pull: {watchList:userId}},
        { useFindAndModify: false, runValidators: true}
      )
      .then(()=>{
        return res.redirect("/users/profile");
      })
      .catch((err)=>{
        next(err);
      });
};

exports.getAvailability = (req, res, next) =>{
    let id = req.params.id;
    let user = req.session
    console.log("getAvailability")
    Promise.all([
        Machinery.findById(id),
        Machinery.find({ author: req.session.user, status: "Available"}),
    ])
    .then((results)=>{
        const [story, machineryDetails] = results;
        if(story){
            res.render("./story/offerTrade",{user,id,machineryDetails});
        }else {
            let err = new Error("Invalid story id");
            err.status = 400;
            req.flash("error",err.message);
            return res.redirect("back");

        }
    })
    .catch((err)=>{
        next(err);
    });
};

exports.makeTradeOffer = (req, res, next) => {
    let id = req.params.id;
    let storyItem = req.body.storyItem;
    Machinery
      .findByIdAndUpdate(
        storyItem,
        {$set: {status: "Pending"}},
        {
            useFindAndModify: false,
            runValidators: true,
        }
      )
      .then((story)=>{
        if(story){

        }else{
            console.log("update failed");
        }
      })
      .catch((err)=>{
        next(err);
      });
      Machinery
       .findByIdAndUpdate(
        id,
        {
            $set: {
                offerItemId: storyItem,
                offerItemOwner: req.session.user,
                status: "Pending",
              },
        },
        {
            useFindAndModify: false,
            runValidators: true,
          }
       )
       .catch((err) => next(err));
    return res.redirect("/users/profile");
};

exports.rejectTradeOffer = (req, res, next) => {
    let storyItem = req.params.storyItemId;
    let itemId = req.params.itemId;
    Machinery
       .findByIdAndUpdate(
        storyItem,
        {
            $set: {
                offerItemId: null,
                offerItemOwner: null,
                status: "Available",
              },
        },
        {
            useFindAndModify: false,
            runValidators: true,
          }
       )
       .catch((err) => next(err));
       Machinery
       .findByIdAndUpdate(
        itemId,
        {
            $set: {
              status: "Available",
              offerItemId: null,
              offerItemOwner: null,
            },
          },
          { useFindAndModify: false, runValidators: true }
        )
        .catch((err) => next(err));
    
      return res.redirect("/users/profile");
};

exports.manageOffer = (req, res, next) => {
    let id = req.params.id;
    Machinery
      .findById(id)
      .populate("offerItemId", "id title category")
      .then((story) => {
        if (story) {
          res.render("./story/viewOffer", { story });
        }
      })
      .catch((err) => next(err));
  };

  exports.acceptTradeOffer = (req, res, next) => {
    console.log("<-----------------acceptTradeOffer--------------->")
    let itemId = req.params.itemId;
    let storyItemId = req.params.tradeItemId;
    Machinery
      .findByIdAndUpdate(itemId, { $set: { status: "Traded" } })
      .then((story) => {
        if (story) {
          itemId = story.offerItemId;
        }
      })
      .catch((err) => next(err));
      Machinery
      .findByIdAndUpdate(storyItemId, {
        $set: {
          status: "Traded",
          offerItemId: itemId,
          offerItemOwner: req.session.user,
        },
      })
      .then((story) => {
        if (story) {
          console.log("success updating second story");
         return res.redirect("/users/profile")
        }
      })
      .catch((err) => next(err));
  };
  