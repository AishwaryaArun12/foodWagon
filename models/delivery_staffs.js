const mongoose = require('mongoose');
const deliveryboys = new mongoose.model('deliveryboys',{
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    location : {
        type : String,
        required : true
    },
    active : {
        type : Boolean,
        default : true
    }
});

module.exports = deliveryboys;