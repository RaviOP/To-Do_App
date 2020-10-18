const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/Tasks')
const {
    userOneId,
    userOne,
    setupDataBase,
    userTwoId,
    userTwo,
    taskOne,
    taskThree,
    taskTwo } = require('./fixtures/db')

beforeEach(setupDataBase)


test('Should create Task for a user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: "Setup Tasks Test Suite"
        })
        .expect(201)

    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
})

test('Should Get All Task for User', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body.length).toEqual(2)

})

test('Should not delete others users Task', async () => {
    const response = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)

        const task = await Task.findById(taskOne._id)
        expect(task).not.toBeNull()
})

