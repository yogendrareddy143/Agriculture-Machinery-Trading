const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const machinerySchema = new Schema({
    category: { type: String, required: [true, 'category is required'] },
    title: { type: String, required: [true, 'Title is required'] },
    content: {
        type: String, required: [true, 'Details is required'],
        minLength: [10, 'Atleast 10 characters is required for details']
    },
    imageUrl: { type: String, required: [true, 'Image is required'] },
    author: {type: Schema.Types.ObjectId, ref: 'User'},
    status:{
        type: String,
        enum: ["Available","Traded","Pending"],
        required: [true, "Status has to be mentioned"],
    },
    watchList: [{type: Schema.Types.ObjectId,ref: "User"}],
    offerItemId: {type: Schema.Types.ObjectId,ref: "Machinery"},
    offerItemOwner: {type: Schema.Types.ObjectId, ref: "User"}
},
    { timestamps: true }
);

module.exports = mongoose.model('Machinery', machinerySchema);