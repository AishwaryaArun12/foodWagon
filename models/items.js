const mongoose = require('mongoose');
 const itemSchema = mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    images : [{
        type : Buffer,
        required : true,
    },],
    video : {
        type : Buffer,
    },
    description : {
        type : String,
         required :true
    },
    discount : {
        type : Number,
    },
    price : {
        type : Number,
        required : true
    },
    qty : {
        type : String,
        required : true
    },
    
    stock : {
        type : Number,
        required : true
    },
    blocked : {
        type : Boolean,
        default : false
    },
    special : {
        type : Boolean,
        default : false
    },
    seller : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'sellers',
    },
    foodType : {
        type : String,
        required : true
    },
    category : {
        type : String,
        required : true
    }
 })

  const items = mongoose.model('Item',itemSchema);

  
 module.exports = items;