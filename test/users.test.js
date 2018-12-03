const fetch = require ('node-fetch');
const PORT = process.env.PORT || 3000;
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:' + PORT;
var server;

const getTasks = require('../v1/users').getTasks;
const getExams = require('../v1/users').getExams;
const getUserByID = require('../v1/users').getUserById;
const deleteAll = require('../v1/users').deleteAllUsers;
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

beforeAll(function () {
   server = require('../index');
});
afterAll(function () {
   server.close();
});

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
 }

//--------------------------------------------
//							TESTS
//--------------------------------------------

//POST USER
//#########################

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
		updateUserDB(exampleUserID, {'name': 'francesco','surname': 'da dalt','email': 'francescodadalt@hotmail.it','password': 'lol'});
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

test('get valid exam, 200',()=>{
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

test('get valid task, 200',()=>{
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
test('get invalid exam, NULL',()=>{
  return getExams(16)
  .then(res =>{return res.json()})
    .then(jres =>{
      expect(jres).toEqual({});
    })
});


test('get invalid task, NULL',()=>{
  return getTasks(16)
  .then(res =>{return res.json()})
    .then(jres =>{
      expect(jres).toEqual({});
    })
});

//PUT USER
//#########################

describe('PUT USER TESTS', () => {
	beforeAll(() => {
		deleteAll();
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
		return updateUser(null, putUser)
			.then(putResponse => {expect(putResponse.status).toBe(400)});
	});

	test('PUT user with second parameter null', () => {
		return updateUserDB(exampleUserID, null)
			.then(putResponse => {expect(putResponse).toBeNull()});
	});
	
	test('PUT user with wrond id', () => {
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

test('get valid exam, 200',()=>{
    return getExams(validexam.creator)
    .then(res=>{
      expect(res).toBe(200);
      return res.json();
    })
    .then(jres => {
      expect(typeof getResponseJson).toEqual('object');
			expect(jres).toHaveProperty('id');
			expect(jres).toHaveProperty('creator');
			expect(jres).toHaveProperty('deadline');
			expect(jres).toHaveProperty('mark');

      expect(jres.id).toEqual('number');
      expect(jres.creator).toEqual('string');
      expect(jres.deadline).toEqual('number');
      expect(jres.mark).toEqual('number');
    })
});

test('get valid task, 200',()=>{
    return getTasks(validtask.creator)
    .then(res=>{
      expect(res).toBe(200);
      return res.json();
    })
    .then(jres=>{
      expect(typeof jres).toEqual('object');
			expect(jres).toHaveProperty('id');
			expect(jres).toHaveProperty('creator');
			expect(jres).toHaveProperty('task_type');
			expect(jres).toHaveProperty('question');
			expect(jres).toHaveProperty('mark');
      expect(jres).toHaveProperty('mark');

      expect(jres.id).toEqual('number')
      expect(jres.creator).toEqual('number')
      expect(jres.task_type).toEqual('string')
      expect(jres.question).toEqual('string')
      expect(jres.mark).toEqual('string')

  })
});

test('get invalid exam, NULL',()=>{
    return getExams(invalidid)
    .then(res =>{
      expect(res).toBeNull();
    })
});

test('get invalid task, NULL',()=>{
    return getTasks(invalidid)
    .then(res=>{
      expect(res).toBeNull();
  })
});
