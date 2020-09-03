const Recipe = require('../models/Recipe')
const File = require('../models/File')
const {date} = require('../../lib/util')

module.exports = {
    async index(req,res){
        let results = await Recipe.all()
        const recipes = results.rows

        //array de promises para pegar imgs de receitas
        const filePromises = recipes.map(recipe => File.getFilesByRecipe(recipe.id))

        await Promise.all(filePromises).then((values) => {

            const files = values.map(file => ({...file[0]}))
            if(files){
                if(typeof files[0] !== 'undefined' && typeof files[0].id !== 'undefined'){
    
                    const files2 = files.map(file => ({
                        ...file,
                        src: `${req.protocol}://${req.headers.host}${file.path.replace('public','')}`
                    }))
                    return res.render('admin/recipes/list', {recipes, files: files2})
                }
            }
            return res.render('admin/recipes/list', {recipes})

        })
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

        results = await File.getFileIds(recipe.id)
        const fileIds = results.rows

        const filesPromises = fileIds.map(id => File.getFiles(id.file_id))
        await Promise.all(filesPromises).then((results) => {

            const files = results.map(file => ({
                ...file,
                src: `${req.protocol}://${req.headers.host}${file.path.replace('public','')}`
            }))
            return res.render('admin/recipes/show',{recipe, files})
        })
    },
    async edit(req,res){
        let results = await Recipe.find(req.params.id)
        const recipe = results.rows[0]

        if(!recipe) return res.send("Recipe not found")

        results = await Recipe.chefOptions()
        const options = results.rows

        results = await File.getFilesByRecipe(req.params.id)
        const fileRows = results

        const files = fileRows.map(file => ({
            ...file,
            src: `${req.protocol}://${req.headers.host}${file.path.replace('public','')}`
        }))


        return res.render('admin/recipes/edit', {chefOptions : options, recipe, files})
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
        for(key of Object.keys(req.body)){
            if( req.body[key] =="" && key != "removed_files" && key != "information"){
                res.send('Please, fill all the fields')
            }
        }
        if(req.files.length != 0){
            const newFilesPromise = req.files.map(file => File.create({...file}, req.body.id))
            let results = await Promise.all(newFilesPromise)

            const fileId = results.map(file => file.rows[0].id)
            const recipeFilePromises = fileId.map(id => File.indentifyFile(id,req.body.id))
            await Promise.all(recipeFilePromises)
        }
        if(req.body.removed_files){
            const removedFiles = req.body.removed_files.split(',')
            const lastIndex = removedFiles.length-1

            removedFiles.splice(lastIndex,1)

            const removedFilesPromise = removedFiles.map(id => File.delete(id))
            await Promise.all(removedFilesPromise)
        }

        let results = await Recipe.update(req.body)
        const recipe = results.rows[0]

        return res.redirect(`/admin/recipes/${req.body.id}`)
    },
    async delete(req,res){
        await Recipe.delete(req.body.id)
        return res.redirect('/admin/recipes')
    }
}