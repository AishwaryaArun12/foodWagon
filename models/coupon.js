const mongoose = require('mongoose');
const coupons = new mongoose.model('Coupons',{
    name : {
        type : String,
        required : true
    },
    
    couponCode : {
        type : String,
        required : true
    },
    active : {
        type : Boolean,
        default : true
    },
    validTill :{
        type : Date,
        required : true
    },
    min : {
        type : Number,
        required : true,
    },
    discount : {
        type : Number,
        required : true,
    },
    max : {
        type : Number,
        required : true
    }
});

module.exports = coupons;