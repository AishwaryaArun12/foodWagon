const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const cartItemSchema = new mongoose.Schema({
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required :true
    },
    quantity: {
      type: Number,
      default: 1,
    },
  });
  

const users = new mongoose.model('users',{
    name :{
        type :String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
    },
    address : [{
        type : Object
    }],
    
    orders : [{
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'Orders'
    }],
    otp : {
        type : String
    },
    otpExpiration : {
        type : Date
    },
    cart: [cartItemSchema],

    wishlist : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Item'
    },],
    verified : {
        type : Boolean,
        default : false
    },
    blocked : {
        type : Boolean,
        default : false
    },
    wallet : [{
        amount : {
            type : Number,
        },
        sellerName :{
            type : String,           
        },
        description : {
            type : String
        },
        
        orderDetails :[{
            name : {
                type : String,
            },
            amount : {
                type : Number
            }
        }],
        date : {
            type : Date,
        }
    }],
    walletBalance : {
        type : Number,
        default : 0
    },
    referralCode: {
        type: String,
        default: uuidv4(),
        unique: true, 
      },
    usedCoupons : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Coupons' 
    }],
    image: {
        type : String,
        default : '/img/gallery/defaultImage.svg',
    }
    
})
module.exports = users;