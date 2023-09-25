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
        blocked : {
            type : Boolean,
            default : false,
        },
        category : [category]
    }]
    
});

menuSchema.path('menu').default([
    { name: 'Ready to eat', blocked : false, category: [] },
    { name: 'Instant cook', blocked : false, category: [] },
]);
const Menu = new mongoose.model('Menu', menuSchema);
module.exports = Menu;