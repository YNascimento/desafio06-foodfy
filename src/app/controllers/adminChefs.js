const Chef = require('../models/Chef')
const File = require('../models/File')
const {date} = require('../../lib/util')

module.exports = {
    async index(req,res){
        let results = await Chef.all()
        const chefs = results.rows

        return res.render('admin/chefs/list', {chefs})
    },
    create(req,res){
        return res.render('admin/chefs/create')
    },
    async show(req,res){
        let results = await Chef.find(req.params.id)
        const chef = results.rows[0]

        if(!chef) res.send("Chef not found")

        results = await Chef.recipesBy(chef.id)
        const recipes = results.rows

        results = await Chef.totalRecipesByChef(chef.id)
        const total_recipes = results.rows[0]

        return res.render('admin/chefs/show',{chef, recipes, total_recipes})
    },
    async edit(req,res){
        
        let results = await Chef.find(req.params.id)
        const chef = results.rows[0]

        if(!chef) res.send("Chef not found")

        return res.render('admin/chefs/edit',{chef})
    },
    async post(req,res){
        for(key of Object.keys(req.body)){
            if(req.body[key] == ""){
                res.send("Fill all the fields")
            }
        }
        let results = await Chef.create(req.body)
        const chef = results.rows[0]

        return res.redirect(`/admin/chefs/${chef.id}`)
    },
    async put(req,res){
        //check if number of fields on req.body equals number on data.chefs
        if( Object.keys(req.body).length != 3)  return res.send("Fill all the fields")

        results = await Chef.update(req.body)
        let chef = reuslts.rows[0]

        return res.redirect(`/admin/chefs/${req.body.id}`)
    },
    async delete(req,res){
        let results = await Chef.delete(req.body.id)
        return res.redirect('/admin/chefs')
    }
}

/*
exports.index = function(req,res){
    
    Chef.all(function(chefs){
        return res.render('admin/chefs/list', {chefs})
    })
}
exports.create = function(req,res){
    return res.render('admin/chefs/create')
}
exports.show = function(req,res){

    Chef.find(req.params.id,function(chef){
        if(!chef) return res.send("Chef not found")

        Chef.recipesBy(chef.id,function(recipes){

            Chef.totalRecipesByChef(chef.id, function(total_recipes){
                return res.render('admin/chefs/show',{chef, recipes, total_recipes})
            })
        })
    })
}
exports.edit = function(req,res){

    Chef.find(req.params.id,function(chef){
        if(!chef) return res.send("Chef not found")

        return res.render('admin/chefs/edit',{chef})
    })
}
exports.post = function(req,res){

    for(key of Object.keys(req.body)){
        if(req.body[key] == ""){
            res.send("Fill all the fields")
        }
    }
    
    Chef.create(req.body, function(chef){
        return res.redirect(`/admin/chefs/${chef.id}`)
    })
    
}
exports.put = function(req,res){

    //check if number of fields on req.body equals number on data.chefs
    if( Object.keys(req.body).length != 3)  return res.send("Fill all the fields")

    Chef.update(req.body, function(chef){
        return res.redirect(`/admin/chefs/${req.body.id}`)
    })
}
exports.delete = function(req,res){

    Chef.delete(req.body.id,function(){
        return res.redirect('/admin/chefs')
    })
}
*/