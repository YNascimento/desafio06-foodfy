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

        results = await Recipe.getFileIds(recipe.id)
        const fileIds = results.rows

        // results = await Recipe.getFiles(fileIds[0].file_id)
        // console.log('teste0 ', results.rows)

        // results = await Recipe.getFiles(fileIds[1].file_id)
        // console.log('teste1 ', results.rows)

        const filesPromises = fileIds.map(id => Recipe.getFiles(id.file_id))
        console.log('file Promises ',filesPromises)
        await Promise.all(filesPromises).then((results) => {
            console.log('dentro do then', results)

            const files = results.map(file => ({
                ...file,
                src: `${req.protocol}://${req.headers.host}${file.path.replace('public','')}`
            }))
            console.log('dentro do then2', files)

            return res.render('admin/recipes/show',{recipe, files})
        })
        // console.log('file ',file)

        // const files = fileResults.rows.map(file => ({
        //     ...file,
        //     src: `${req.protocol}://${req.headers.host}${file.path.replace('public','')}`
        // }))
        // return res.render('admin/recipes/show',{recipe, file})
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

        //insert recipes at recipe table
        let results = await Recipe.create(req.body)
        const recipe = results.rows[0]
        const recipeId = recipe.id

        //array de promises para insert de files
        const filePromises = req.files.map(file => File.create({...file},recipeId))
        results = await Promise.all(filePromises)

        //array de promises para insert de relação file->recipe
        const fileId = await results.map(file => file.rows[0].id)
        const recipeFilePromises = fileId.map(id => File.indentifyFile(id,recipeId))
        await Promise.all(recipeFilePromises)

        return res.redirect(`/admin/recipes/${recipeId}`)
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