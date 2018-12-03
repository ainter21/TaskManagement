const express = require('express');
const bodyParser = require('body-parser');
const classes = express.Router();
const pg = require('pg');

const config = require('../db_config');
const pool = new pg.Pool(config);

classes.use(bodyParser.json());

classes.get('/', (req, res) => res.status(200).send('Hello World!'));

classes.post('/', async(req, res) => {

    //console.log('sono nella post');
    //console.log('req.body' + req.body);
	var result = await insertClassIntoDatabase(req.body);
    //console.log(result);
	if (result) 
	{
        //console.log('class post if result: '+ result)
		var resultJson = JSON.parse(JSON.stringify(result));
		res.status(201).send(resultJson);
	}
	else
	{
		res.status(404).end();
	}
}); 

classes.get('/:id', async (req, res) =>{
    //console.log('sono in classes.get e id: ' + req.params.id);
    
    let results = await getClassById(req.params.id);
    
    //console.log('classes.get results: ' +results);

    if(results)
    {
        var resultJson = JSON.parse(JSON.stringify(results));
        res.status(200).send(resultJson);
    }
    else
    {
        res.status(404).end();
    }
});

classes.put('/:id', async (req, res) => {

    //console.log('sono nella put!');
    const id = req.params.id;
    //console.log('id: '+id);
    const toModify = req.body;
    //console.log('toModify: ' + toModify)
    if(!id)
    {
        res.status(400).end();
    }
    var result = await updateClassInDatabase(id, toModify);
    if(result)
    {
        var resultJson = JSON.parse(JSON.stringify(result));
        await console.log(resultJson + '\n\n\n\n');
        res.status(201).send(resultJson);
    }
    else
    {
        res.status(409).end();
    }
});


async function insertClassIntoDatabase (classe){
    
    //check prof exists into database
    let isUser = await getUserById(classe.prof);
    //console.log('isProf: ' +isUser)
    if(!isUser)
    {
        return null;
    }

    // insert class into database
    let queryText = 'INSERT INTO "classe" ("name", "prof", "description") VALUES ($1, $2, $3) RETURNING *';
    let queryParam = [classe.name, classe.prof, classe.description, classe.students, classe.assistants];

    let insertClass;
    let res = await pool.query(queryText, queryParam);

    if(res)
    {
        insertClass = JSON.parse(JSON.stringify(res.rows[0]));
    }
    else{
        return null;
    }


    // insert every assistant into database table "permissions"
    // put a new param into the json called assistantList
    // insert every students into database table "permissions"
    // put a new param into the json called studentsList

    // return the class with the id
    return insertClass;
} 

//funzione di appoggio
async function getUserById(id){
    
    //console.log("sono in GETUSER e id:"+id);
    if(!id)
    {
        return null;
    }
    else
    {
        const queryText = 'SELECT * FROM "user" WHERE id=$1';

        let queryParams = [id];
        let result = await pool.query(queryText, queryParams);
        
        if(result.rowCount != 0)
        {
            return result.rows[0];
        }
        else
        {
            return null;
        }
    }
}

async function getClassById(id){

    //console.log('sono in getClassById e id: ' +id)

    if(!id)
    {
        return null;
    }
    else
    {
        // select class from table "class"
        let queryText = 'SELECT * FROM "classe" WHERE id=$1';
        let queryParams = [id];
        let result = await pool.query(queryText, queryParams);
		var classe; //Variabile chiamata "classe" perchè la parola "class" è riservata
		if(result.rowCount != 0)
        {
            classe = JSON.parse(JSON.stringify(result.rows[0]));
        }
        else
        {
            return null;
        }

        var students = getStudents(id);
        console.log('students: '+ JSON.stringify(students));
        for (var student in students )
        {
            classe.students[student] = students[student];
        }

        var assistants = getAssistants(id);
        console.log('assistants: '+ assistants);
        for (var assistant in assistants)
        {
            classe.assistants[assistant] = assistants[assistant];
        }

        console.log('classe: ' + JSON.stringify(classe));
        return classe;
    }
}

async function getStudents(id){

    if (!id)
    {
        return null;
    }
    else
    {
        // select students for that class from table "permissions"
        queryText = 'SELECT "user" FROM "ruoli" WHERE classe=$1 AND permesso=2';
        let studentsList = []; // this variable is used to store tasks which are in exam
        queryParams = [id]
        result = await pool.query(queryText, queryParams);
        if(result.rowCount != 0)
        {
            for (var i = 0; i < result.rowCount; i++)
            {
                studentsList.push(result.rows[i]);
            }
        }

        return studentsList;
    }
    
}


async function getAssistants(id){

    if (!id)
    {
        return null;
    }
    else
    {
        queryText = 'SELECT "user" FROM "ruoli" WHERE classe=$1 AND permesso=1';
        let assistantsList = [];
        queryParams = [id] 
        result = await pool.query(queryText, queryParams);
        if(result.rowCount != 0)
        {
            for (var i = 0; i < result.rowCount; i++)
            {
                assistantsList.push(result.rows[i]);
            }
        }
        // add the list of assistants to class variable
        //utenti.assistants = assistantsList;
        return assistantsList;
    }

}
async function updateClassInDatabase(id, toModify){

    id = Number.parseInt(id);

    //console.log('sono in updateClass: toModify: ' + toModify);
    //console.log('sono in updateClass: id: ' + id);

    if(!id && !toModify)
    {
        //console.log('sono in not id e not toModify')
        return null;
    }
    else
    {
        //console.log('sono in else')
        var isClass = await getClassById(id);

        if(!isClass)
        {
            //console.log('sono in not isClass')
            return null;
        }
        else
        {
            //console.log('sono in else 2')

        	if(isClass.prof != toModify.prof)
        	{
                //console.log('sono in prof')
                return null;
			}

            else 
            {
                //console.log('sono in else!!!!!')
            	//console.log(id);
	            var queryText = 'UPDATE "classe" SET "name"=$1, "description"=$2 WHERE "id"=$3 RETURNING *';
	            var queryParams = [toModify.name, toModify.description, id];
	            var result = await pool.query(queryText,queryParams);
	            //console.log(result);
	            if(result.rowCount != 0)
	            {
	                return result.rows[0];
	            }
	            else
	            {
	                return null;
	            }
	        }
        }
    }
}

module.exports = {
    classes: classes,
    insertClassIntoDatabase: insertClassIntoDatabase,
    getClassById: getClassById,
    updateClassInDatabase: updateClassInDatabase
}