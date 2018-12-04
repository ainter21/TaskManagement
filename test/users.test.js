const fetch = require ('node-fetch');
const PORT = process.env.PORT || 3000;
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:' + PORT;
const root = SERVER_URL;
var server;

const getUserByID = require('../v1/users').getUserById;
const deleteAll = require('../v1/users').deleteAllUsers;
const insertUserWID = require('../v1/users').postUserWithID;
const updateUserDB = require('../v1/users').updateUserInDatabase;

const exampleUser = {'name': 'Mario','surname': 'Rossi','email': 'mario.rossi@gmail.com','password': 'password'};
const exampleUser2 = {'name': 'Marione','surname': 'Razzi','email': 'marione.razzi@gmail.com','password': 'a'};
const exampleUser3 = {'name': 'Darione','surname': 'Rassi','email': 'darione.rassi@gmail.com','password': 'b'};
const exampleUser4 = {'name': 'One','surname': 'Time','email': 'one.time@gmail.com','password': 'c'};
const wrongUser = {'name': null,'surname': 'Time','email': 'one.time@gmail.com','password': 'c'};
const wrongUser2 = {'name': 'One','surname': null,'email': 'one.time@gmail.com','password': 'c'};
const wrongUser3 = {'name': 'One','surname': 'Time','email': null,'password': 'c'};
const wrongUser4 = {'name': 'One','surname': 'Time','email': 'one.time@gmail.com','password': null};
const wrongUser5 = {'name': 'One','surname': 'Time','email': 'one.time@gmail.com','password': 'azz'};
const putUser = {'name': 'francesco','surname': 'da dalt','email': 'francescodadalt@hotmail.it','password': 'abba'};
const exampleUserID = 1;

const validtask={
  id: 1,
  creator:1,
  task_type: 1,
  question: "blablabla",
  example: "blablabla",
  mark: 30
};
const validexam={
  id: 1,
  creator: 1,
  deadline: 550,
  mark: 30
};

var invalidid=-1;

//--------------------------------------------
//					HELPER FUNCTIONS
//--------------------------------------------

const postUser = function(newUser){
   return fetch(SERVER_URL + '/v1/users', {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'Accept': 'application/json'
      },
      body: JSON.stringify(newUser)
   });
}

const getUser = function(userID){
	return fetch(SERVER_URL + '/v1/users/' + userID, {
		method: 'GET',
		headers: {
			'Accept': 'application/json'
		}
	});
};

const getExams = function(userID){
  return fetch(root + '/v1/users/' + userID +'/exams', {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });
};

const getTasks = function(userID){
  return fetch(root + '/v1/users/' + userID +'/tasks', {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });
};

const updateUser = function(id, toModify){
	return fetch(SERVER_URL + '/v1/users/' + id,{
		method: 'PUT',
		headers: {
		 'Content-Type': 'application/json',
		 'Accept': 'application/json'
		},
		body: JSON.stringify(toModify)
	});
};

const getUsersList = function(){
	return fetch(SERVER_URL + '/v1/users', {
		method: 'GET',
		headers: {
			'Accept': 'application/json'
		}
	})
};

 const deleteUser = function(userID){
   return fetch(root + '/v1/users/' + userID, {
     method: 'DELETE',
     headers: {
       'Accept': 'application/json'
     }
   });
 };
//--------------------------------------------
//							TESTS
//--------------------------------------------

//POST USER
//#########################


test('delete valid user',()=>{
    return deleteUser(2)
    .then(res=>{
      expect(res.status).toBe(204);
  })
});


test('delete invalid user',()=>{
    return deleteUser(invalidid)
    .then(res=>{
      expect(res.status).toBe(404);
  })
});


describe('POST USER TESTS', () => {
	beforeAll(() => {
		deleteAll();
	});
	afterAll(() => {
		deleteAll();
	});

	test('POST user response', () => {
		return postUser(exampleUser4)
			.then(postResponse => {expect(postResponse.status).toBe(201)});
	});

	test('POST and get response', () => {
		return postUser(exampleUser)
			.then(postResponse => { return postResponse.json(); })
			.then(postResponseJson => {
				exampleUser.id = postResponseJson.id;
				return getUser(exampleUser.id);
			})
			.then(getResponse => {return getResponse.json();})
			.then(jsonResponse => {expect(jsonResponse).toEqual(exampleUser)});
	});

	test('POST user with wrong name', () => {
		return postUser(wrongUser)
			.then(postResponse => {expect(postResponse.status).toBe(400)});
	});

	test('POST user with wrong surname', () => {
		return postUser(wrongUser2)
			.then(postResponse => {expect(postResponse.status).toBe(400)});
	});

	test('POST user with wrong email', () => {
		return postUser(wrongUser3)
			.then(postResponse => {expect(postResponse.status).toBe(400)});
	});


	test('POST user with wrong password', () => {
		return postUser(wrongUser4)
			.then(postResponse => {expect(postResponse.status).toBe(400)});
	});


	test('POST user with email already in db', () => {
		return postUser(wrongUser5)
			.then(postResponse => {expect(postResponse.status).toBe(400)});
	});
});

//GET USER
//#########################

describe('GET USER TESTS', () => {
	beforeAll(() => {
		deleteAll();
		insertUserWID(initUser);
	});

	test('GET user response', () => {
		return getUser(exampleUserID)
			.then(getResponse => {expect(getResponse.status).toBe(200)});
	});

	test('GET user response if not found', () => {
		return getUser(0)
			.then(getResponse => {expect(getResponse.status).toBe(400)});
	});

	test('GET user response body if found', () => {
		return getUser(exampleUserID)
			.then(getResponse => {return getResponse.json()})
			.then(getResponseJson => {
				//Object schema
				expect(typeof getResponseJson).toEqual('object');
				expect(getResponseJson).toHaveProperty('id');
				expect(getResponseJson).toHaveProperty('name');
				expect(getResponseJson).toHaveProperty('surname');
				expect(getResponseJson).toHaveProperty('email');
				expect(getResponseJson).toHaveProperty('password');
				//Keys types
				expect(typeof getResponseJson.id).toEqual('number')
				expect(typeof getResponseJson.name).toEqual('string');
				expect(typeof getResponseJson.surname).toEqual('string');
				expect(typeof getResponseJson.email).toEqual('string');
				expect(typeof getResponseJson.password).toEqual('string');
				//Object values
				expect(getResponseJson).toMatchObject({
						'id': 1,
						'name': 'francesco',
						'surname': 'da dalt',
						'email': 'francescodadalt@hotmail.it',
						'password': 'lol'
				});
		});
	});
});

// GET USERS
//#########################

describe('GET USERS', () => {

	test('GET users response status if correct', () => {
		return getUsersList()
			.then(getResponse => {expect(getResponse.status).toBe(200)});
	});

	test('GET users response body if correct', () => { //TEST MOLTO PESANTE CON LISTA LUNGA
		return postUser(exampleUser2)
			.then(postResponse2 => {
				return postUser(exampleUser3);
			})
			.then(postResponse3 => {
				return getUsersList();
			})
			.then(getResponse => {return getResponse.json()})
			.then(getResponseJson => {

				let addedIDs = [];
				getResponseJson.forEach(user => {
					expect(typeof user).toEqual('object');
					expect(user).toHaveProperty('id');
					expect(user).toHaveProperty('name');
					expect(user).toHaveProperty('surname');
					expect(user).toHaveProperty('email');
					expect(user).toHaveProperty('password');
					//Keys types
					expect(typeof user.id).toEqual('number');
					expect(typeof user.name).toEqual('string');
					expect(typeof user.surname).toEqual('string');
					expect(typeof user.email).toEqual('string');
					expect(typeof user.password).toEqual('string');
					//For testing
					if(user.id !== 1)
						addedIDs.push(user.id);
				});
				//PROBLEMA CON ID
				exampleUser2.id = addedIDs[0];
				expect(getResponseJson).toContainEqual(exampleUser2);
				exampleUser3.id = addedIDs[1];
				expect(getResponseJson).toContainEqual(exampleUser3);
			});
	});

	describe('--> To test the empty list', () => {
		beforeEach(() => {
			deleteAll();
		});
		afterEach(() => {
			deleteAll();
			insertUserWID(initUser);
		});
		test('GET users response body if there are no users inside the table', () => {
			return getUsersList()
				.then(getResponse => {return getResponse.json()})
				.then(getResponseJson => {
					expect(getResponseJson).toEqual({});
				});
		});
	});

});

//PUT USER
//#########################

describe('PUT USER TESTS', () => {
	beforeAll(() => {
		deleteAll();
		insertUserWID(initUser);
	});
	afterAll(() => {
		deleteAll();
		insertUserWID(initUser);
	});

	test('PUT user with less than two parameters', () => {
		return updateUserDB(exampleUserID)
			.then(putResponse => {expect(putResponse).toBeNull()});
	});

	test('PUT user with more than two parameters', () => {
		return updateUserDB(exampleUserID,putUser,putUser)
			.then(putResponse => {expect(putResponse).toBeNull()});
	});

	test('PUT user with first parameter null', () => {
		return updateUserDB(null, putUser)
			.then(putResponse => {expect(putResponse).toBeNull()});
	});

	test('PUT user with second parameter null', () => {
		return updateUserDB(exampleUserID, null)
			.then(putResponse => {expect(putResponse).toBeNull()});
	});
	
	test('PUT user with wrong id', () => {
		return updateUser(0, putUser)
			.then(putResponse => {expect(putResponse.status).toBe(400)});
	});

	test('PUT user with null name', () => {
		return updateUser(exampleUserID, wrongUser)
			.then(putResponse => {expect(putResponse.status).toBe(409)});
	});

	test('PUT user with null surname', () => {
		return updateUser(exampleUserID, wrongUser2)
			.then(putResponse => {expect(putResponse.status).toBe(409)});
	});

	test('PUT user with null email', () => {
		return updateUser(exampleUserID, wrongUser3)
			.then(putResponse => {expect(putResponse.status).toBe(409)});
	});

	test('PUT user with null password', () => {
		return updateUser(exampleUserID, wrongUser4)
			.then(putResponse => {expect(putResponse.status).toBe(409)});
	});

	test('PUT user response status and body correct', () => {
		return updateUser(exampleUserID, putUser)
			.then(putResponse => {
				expect(putResponse.status).toBe(200);
				return putResponse.json()})
			.then(putJson => {return getUserByID(putJson.id)})
			.then(putResponseJSON => {
				//Object schema
				expect(typeof putResponseJSON).toEqual('object');
				expect(putResponseJSON).toHaveProperty('id');
				expect(putResponseJSON).toHaveProperty('name');
				expect(putResponseJSON).toHaveProperty('surname');
				expect(putResponseJSON).toHaveProperty('email');
				expect(putResponseJSON).toHaveProperty('password');
				//Keys types
				expect(typeof putResponseJSON.id).toEqual('number')
				expect(typeof putResponseJSON.name).toEqual('string');
				expect(typeof putResponseJSON.surname).toEqual('string');
				expect(typeof putResponseJSON.email).toEqual('string');
				expect(typeof putResponseJSON.password).toEqual('string');
				//Object values
				expect(putResponseJSON).toEqual({
						'id': 1,
						'name': 'francesco',
						'surname': 'da dalt',
						'email': 'francescodadalt@hotmail.it',
						'password': 'abba'
				});
			});
	});
});

test('GET list of exams of a valid user id',()=>{
	return getExams(validexam.creator)
	.then(res=>{return res.json();})
	.then(jres => {
		var dim = Object.keys(jres).length;
		for(var i=0;i<dim;i++){
			expect(typeof jres[i]).toEqual('object');
			expect(jres[i]).toHaveProperty('id');
			expect(jres[i]).toHaveProperty('creator');
			expect(jres[i]).toHaveProperty('deadline');
			expect(jres[i]).toHaveProperty('mark');

			expect(typeof jres[i].id).toEqual('number');
			expect(typeof jres[i].creator).toEqual('number');
			expect(typeof jres[i].deadline).toEqual('number');
			expect(typeof jres[i].mark).toEqual('number');

		}
	})
});

test('GET list of tasks of a valid user id',()=>{
	return getTasks(validtask.creator)
	.then(res=>{return res.json();})
	.then(jres=>{
		var dim = Object.keys(jres).length;
		for(var i=0;i<dim;i++) {
			expect(jres[i]).toHaveProperty('id');
			expect(jres[i]).toHaveProperty('creator');
			expect(jres[i]).toHaveProperty('task_type');
			expect(jres[i]).toHaveProperty('question');
			expect(jres[i]).toHaveProperty('mark');
			expect(jres[i]).toHaveProperty('mark');

			expect(typeof jres[i].id).toEqual('number')
			expect(typeof jres[i].creator).toEqual('number')
			expect(typeof jres[i].task_type).toEqual('number')
			expect(typeof jres[i].question).toEqual('string')
			expect(typeof jres[i].mark).toEqual('number')
		}
	})
});

test('GET list of exams of a not valid user id',()=>{
	return getExams(16)
	.then(res =>{return res.json()})
	.then(jres =>{
		expect(jres).toEqual({});
	})
});

test('GET list of tasks of a not valid user id',()=>{
return getTasks(16)
.then(res =>{return res.json()})
	.then(jres =>{
		expect(jres).toEqual({});
	})
});
