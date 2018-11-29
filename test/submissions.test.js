const fetch = require('node-fetch');
const submissions = require('../v1/submissions').submissions;
const insertSubmissionIntoDatabase = require('../v1/submissions').insertSubmissionIntoDatabase;
const getSubmissionById = require('../v1/submissions').getSubmissionById;
const updateSubmissionInDatabase = require('../v1/submissions').updateSubmissionInDatabase;

const PORT = process.env.PORT || 3000;

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:' + PORT + '/v1/submissions';
 
var validSubmission = {
	"user": 2,
	"task": 2,
	"exam": 1,
	"answer": "This is my answer"
};

var invalidUserSubmission = {
	"user": 0,
	"task": 2,
	"exam": 1,
	"answer": "This is my answer"
};
var invalidTaskSubmission = {
	"user": 2,
	"task": 0,
	"exam": 1,
	"answer": "This is my answer"
};

var invalidExamSubmission = {
	"user": 2,
	"task": 2,
	"exam": 0,
	"answer": "This is my answer"
};

var modifiedSubmissionStudent = {
  "user": 2,
  "task": 2,
  "exam": 1,
  "answer": "This is a question"
}
var modifiedSubmissionTeacher = {
  "user": 2,
  "task": 2,
  "exam": 1,
  "final_mark": 30
}

//helpers method using fetch
function createSubmission(newSubmission){
  return fetch(SERVER_URL,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(newSubmission)
  })
}

function updateSubmission(id,toModify){
  return fetch(SERVER_URL + '/' + id,{
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(toModify)
  })
}


//TEST cases

var server;
beforeAll(function () {
  server = require('../index');
});
afterAll(function () {
  server.close();
});


test('test the creation of a valid new Submission using node-fetch',() =>{
  // expect.assertions(1);
  return createSubmission(validSubmission)
  .then(response => {
    expect(response.status).toBe(201);
    return response.json();
  })
  .then(jsonRes =>{
    expect(jsonRes.user).toEqual(validSubmission.user);
  })});

test('if the user does not exists, the function should return 400', ()=>{

  return createSubmission(invalidUserSubmission)
  .then(response => {
    expect(response.status).toBe(400);
  })
});

test('if the task does not exists, the function should return 400', ()=>{

  return createSubmission(invalidTaskSubmission)
  .then(response => {
    expect(response.status).toBe(400);
  })
});

test('if the exam does not exists, the function should return 400', ()=>{

  return createSubmission(invalidExamSubmission)
  .then(response => {
    expect(response.status).toBe(400);
  })
});

//TESTS FOR insertSubmissionIntoDatabase
test('this test verify that a valid submission is added to the database correctly', ()=>{


  return insertSubmissionIntoDatabase(validSubmission)
  .then(created =>{
    return getSubmissionById(created.id)
    .then(res =>{
      validSubmission.id = res.id;
      expect(res.user).toBe(validSubmission.user);
    })
  })
});

test('if the user is invalid, should return null', ()=>{

  return insertSubmissionIntoDatabase(invalidUserSubmission)
  .then(res =>{
    expect(res).toBeNull();
  })
});

test('if the task is invalid, should return null', ()=>{

  return insertSubmissionIntoDatabase(invalidTaskSubmission)
  .then(res =>{
    expect(res).toBeNull();
  })
});

test('if the exam is invalid, should return null', ()=>{

  return insertSubmissionIntoDatabase(invalidExamSubmission)
  .then(res =>{
    expect(res).toBeNull();
  })
});

//TEST for getSubmissionById

test('if the submission is valid, getting it should get return the submission', ()=>{

  return getSubmissionById(validSubmission.id)
  .then(res =>{
    expect(res.user).toBe(validSubmission.user);
  });
});

test('if the id is null, should return null', ()=>{

  return getSubmissionById(invalidUserSubmission.id)
  .then(res =>{
    expect(res).toBeNull();
  });
});

test('if the id returns no result, should return null', ()=>{

  return getSubmissionById(-1)
  .then(res =>{
    expect(res).toBeNull();
  });
});

//TEST put submission


test('testing a valid update', ()=>{

  return updateSubmission(validSubmission.id, validSubmission)
  .then(res =>{
    expect(res.status).toBe(201);
    return res.json();
  }).then(resJson =>{
    return getSubmissionById(resJson.id);
  }).then(modifiedSubmission =>{
      expect(modifiedSubmission).toHaveProperty('id');
      expect(modifiedSubmission).toHaveProperty('user');
      expect(modifiedSubmission).toHaveProperty('task');
      expect(modifiedSubmission).toHaveProperty('exam');
      expect(modifiedSubmission).toHaveProperty('answer');
  });
});


test('if the submission modifies the exam, should return 409', ()=>{

  return updateSubmission(validSubmission.id, invalidExamSubmission)
  .then(res => {
    expect(res.status).toBe(409);
  });
  
});
test('if the submission modify the task, should return 409', () =>{
  return updateSubmission(validSubmission.id, invalidTaskSubmission)
  .then(res=>{
    expect(res.status).toBe(409);
  });
});

test('if the submission modify the user, should return 409', ()=>{
  return updateSubmission(validSubmission.id, invalidUserSubmission)
  .then(res =>{
    expect(res.status).toBe(409);
  });
});


test('if you,as a student, modify a submission, should get the same submission updated, but with the same final-mark property', ()=>{

  return updateSubmissionInDatabase(validSubmission.id, modifiedSubmissionStudent)
  .then(updated =>{

    return getSubmissionById(updated.id)
    .then(res =>{

      expect(res.id).toEqual(validSubmission.id);
      expect(res.exam).toEqual(validSubmission.exam);
      expect(res.user).toEqual(validSubmission.user);
      expect(res.task).toEqual(validSubmission.task);
      expect(res.answer).toEqual(modifiedSubmissionStudent.answer);
      expect(res.final_mark).toBeNull();
    });
  });
});

test('if you modify the user, it should return null', ()=>{

  return updateSubmissionInDatabase(validSubmission.id, invalidUserSubmission)
  .then(res =>{
    expect(res).toBeNull();
  });
});
test('if you modify the exam, it should return null', ()=>{

  return updateSubmissionInDatabase(validSubmission.id, invalidExamSubmission)
  .then(res =>{
    expect(res).toBeNull();
  });
});

test('if you modify the task, it should return null', ()=>{

  return updateSubmissionInDatabase(validSubmission.id, invalidTaskSubmission)
  .then(res =>{
    expect(res).toBeNull();
  });
});



// test('if you are a student you should not be able to modify the mark', ()=>{

//   return updateSubmissionInDatabase(validSubmission.id, )
// })








