const mongoose = require('mongoose');
const orders = new mongoose.model('orders',{
    item : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'items',
        required : true
    },
    seller : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'sellers',
        required : true
    },
    ordered_on : {
        type : Date,
    },
    amount :{
        type : Number
    },
    payment_mode : {
        type : String,
        required :true
    },
    status : {
        type : String
    },
    delivery_staff : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'delivery_staffs'
    },
    accepted_on : {
        type : Date
    },
    cancelled_on : {
        type : Date
    },
    delivered_on : {
        type : Date
    },
    shipped_on : { 
        type : Date
    },
    customer : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'users',
        required : true
    },
    timestamps : true
});
module.exports = orders;