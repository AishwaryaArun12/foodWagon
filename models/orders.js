const mongoose = require('mongoose');
const orders = new mongoose.model('Orders',{
    items : [
        {
            itemId :{
                type : mongoose.Schema.Types.ObjectId,
                ref : 'items',
                required : true
            },
            qty : {
                type : Number,
                required : true
            },
            status : {
                type : String,
                default : 'Pending'
            },
            reason : {
                type : String,
                default : ''
            },
            amount : {
                type : Number,
                required : true
            }
        }
    ],
    status: {
        type : String,
        default : 'Pending'
    },
    reason : {
        type : String,
        default : ''
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
    couponId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'coupons'
    },
    couponDiscount : {
        type : Number
    },
    paymentStatus : {
        type : String,
        default : "Pending"
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
    address : {
        type : Object
    },
    customer : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'users',
        required : true
    },
    seller : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'sellers',
        required : true
    },
    // timestamps : true
});
module.exports = orders;