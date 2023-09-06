const mongoose = require('mongoose');
const item = new mongoose.Schema({
    item : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'items',
    }
});
const category = new mongoose.Schema({
    name : {
        type : String,
    },
    status : {
        type : String,
        default : 'Active'
    },
    blocked : {
        type : Boolean,
        default : false
    },
    items : [item]
});

const menuSchema = new mongoose.Schema({
    menu : [{
        name : {
            type : String,
            
        },
        category : [category]
    }]
    
});

menuSchema.path('menu').default([
    { name: 'Ready to eat', category: [] },
    { name: 'Instant cook', category: [] },
]);
const Menu = new mongoose.model('Menu', menuSchema);
module.exports = Menu;