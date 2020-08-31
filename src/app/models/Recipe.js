const db = require('../../config/db')
const { create } = require('browser-sync')
const {date} = require('../../lib/util')
const { off } = require('../../config/db')

module.exports = {
    all(){
        return db.query(`SELECT recipes.*, chefs.name as chef_names FROM recipes 
        LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
        order by chef_names LIMIT 6`)
    },
    create(data){
        const query = `
            INSERT INTO recipes (
                image,
                chef_id,
                title,
                ingredients,
                preparation,
                information,
                created_at
            ) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`

        const values = [
            data.image,
            data.chef,
            data.title,
            data.ingredients,
            data.preparation,
            data.information,
            date(Date.now()).iso
        ]

        return db.query(query,values)
    },
    find(id){
        return db.query(` SELECT recipes.*, chefs.name as chef_name FROM recipes 
            LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
            WHERE recipes.id = $1`,[id])
    },
    findBy(filter){

    },
    update(data){
        const query = `
            UPDATE recipes SET
                image = ($1),
                chef_id = ($2),
                title = ($3),
                ingredients = ($4),
                preparation = ($5),
                information = ($6)
                WHERE id = ($7)`

        const values = [
            data.image,
            data.chef,
            data.title,
            data.ingredients,
            data.preparation,
            data.information,
            data.id
        ]

        return db.query(query,values)
    },
    async delete(id){
        let results = await db.query(`DELETE FROM recipes USING recipe_files WHERE recipes.id = $1 AND recipes.id = recipe_files.recipe_id RETURNING recipes.id`,[id])
        
        const fileId = results.rows[0].id
        results = await db.query(`DELETE FROM files WHERE recipe_id = $1`,[fileId])

        return
    },
    chefOptions(){
        return db.query(`SELECT name, id FROM chefs ORDER BY name ASC`)
    },
    paginate(params){
        const {filter, offset, limit, callback} = params

        let query = ""
        let filterQuery = ""
        let totalQuery = `(SELECT count(*) FROM recipes) AS total`

        if(filter){
            filterQuery = ` WHERE recipes.title ILIKE '%${filter}%'`
            totalQuery = `(SELECT count(*) FROM recipes ${filterQuery}) AS total`
        }

        query = `SELECT recipes.*, ${totalQuery}, chefs.name AS chef_name
            FROM recipes LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
            ${filterQuery}
            LIMIT $1 OFFSET $2`

        return db.query(query,[limit,offset])
    },
    getFileIds(recipeId){
        return db.query(`SELECT file_id FROM recipe_files WHERE recipe_id = $1`,[recipeId])
    },
    async getFiles(id){
        files = await db.query(`SELECT * FROM files WHERE id = $1`,[id])
        return files.rows[0]
    }
}