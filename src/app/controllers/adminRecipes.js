const Recipe = require('../models/Recipe')
const File = require('../models/File')
const {date} = require('../../lib/util')

module.exports = {
    async index(req,res){
        let results = await Recipe.all()
        const recipes = results.rows

        // if(!recipes) return res.send("recipes not found")
        return res.render('admin/recipes/list', {recipes})
    },
    async create(req,res){
        let results = await Recipe.chefOptions()
        const options = results.rows

        return res.render('admin/recipes/create', {chefOptions : options})
    },
    async show(req,res){
        let results = await Recipe.find(req.params.id)
        const recipe = results.rows[0]

        if(!recipe) return res.send("Recipe not found")

        return res.render('admin/recipes/show',{recipe})
    },
    async edit(req,res){
        let results = await Recipe.find(req.params.id)
        const recipe = results.rows[0]

        if(!recipe) return res.send("Recipe not found")

        results = await Recipe.chefOptions()
        const options = results.rows

        return res.render('admin/recipes/edit', {chefOptions : options, recipe})
    },
    async post(req,res){
        
        for(key of Object.keys(req.body)){
            if(req.body[key] == "" && key != "information"){
                res.send(req.body)
            }
        }
        
        if(req.files.length == 0)
            return res.send('Upload at least one image')

        let results = await Recipe.create(req.body)
        const recipe = results.rows[0]

        console.log('req files',req.files)
        //array de promises
        const filePromises = req.files.map(file => File.create({...file}))
        console.log('file promises' ,filePromises)

        await Promise.all(filePromises)
        console.log('after promise.all')

        return res.redirect(`/admin/recipes/${recipe.id}`)
    },
    async put(req,res){
        
        //check if number of fields on req.body equals number on data.recipes
        if( Object.keys(req.body).length != 7)  return res.send(req.body)

        let results = await Recipe.update(req.body)
        const recipe = results.rows[0]

        return res.redirect(`/admin/recipes/${req.body.id}`)
    },
    async delete(req,res){
        await Recipe.delete(req.body.id)
        return res.redirect('/admin/recipes')
    }
}

/*
exports.index = function(req,res){
    
    Recipe.all(function(recipes){
        return res.render('admin/recipes/list', {recipes})
    })
}
exports.create = function(req,res){

    // return res.render('admin/recipes/create')
    Recipe.chefOptions(function(options){
        return res.render('admin/recipes/create', {chefOptions : options})
    })
}
exports.show = function(req,res){

    Recipe.find(req.params.id,function(recipe){
        if(!recipe) return res.send("Recipe not found")

        return res.render('admin/recipes/show',{recipe})
    })
}
exports.edit = function(req,res){

    Recipe.find(req.params.id,function(recipe){
        if(!recipe) return res.send("Recipe not found")

        chefOptions(function(options){
            return res.render('admin/recipes/edit', {chefOptions : options, recipe})
        })
    })
}
exports.post = function(req,res){

    for(key of Object.keys(req.body)){
        if(req.body[key] == "" && key != "information"){
            res.send(req.body)
        }
    }
    
    Recipe.create(req.body, function(recipe){
        return res.redirect(`/admin/recipes/${recipe.id}`)
    })
    
}
exports.put = function(req,res){
    
    //check if number of fields on req.body equals number on data.recipes
    if( Object.keys(req.body).length != 7)  return res.send(req.body)

    Recipe.update(req.body, function(recipe){
        return res.redirect(`/admin/recipes/${req.body.id}`)
    })
}
exports.delete = function(req,res){

    Recipe.delete(req.body.id,function(){
        return res.redirect('/admin/recipes')
    })
}
*/
