const db = require('../../config/db')
const fs = require('fs')

module.exports = {
    async create({filename, path}, recipeId){
        // console.log('dentro do File.create ',filename, path, recipeId)
        const query = `
        INSERT INTO files (
            name,
            path,
            recipe_id
        ) VALUES ($1, $2, $3)
        RETURNING id`

        const values = [
            filename,
            path,
            recipeId
        ]

        return await db.query(query,values)
    },
    async delete(id){
        try {
            const result = await db.query('SELECT * FROM files WHERE id = $1',[id])
            const file = result.rows[0]
        
            //delete arquivo do caminho enviado
            fs.unlinkSync(file.path)

            return db.query(`DELETE FROM files WHERE id = $1`,[id])
        }
        catch(err){
            console.error(err)
        }        
    },
    async indentifyFile(id,recipeId){
        const query = `
        INSERT INTO recipe_files (
            file_id,
            recipe_id
        ) VALUES ($1, $2)
        RETURNING id`

        const values = [
            id,
            recipeId,
        ]

        return await db.query(query,values)
    }
}