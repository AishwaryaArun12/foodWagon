const mongoose = require('mongoose');
 const itemSchema = mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    images : [{
        type : String,
        required : true,
    },],
    video : {
        type : String,
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
    },
    rating : [{
        rate : {
            type : Number,
        },
        review : {
            type : String
        },
        customer : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'users',
        },
    }]
 })

  const items = mongoose.model('Item',itemSchema);

  
 module.exports = items;