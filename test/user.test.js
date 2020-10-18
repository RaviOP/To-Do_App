const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/User')
const {userOneId,userOne,setupDataBase} = require('./fixtures/db')


beforeEach(setupDataBase)

test('Should SignUp a User', async () => {
    await request(app).post('/users').send({
        name: "Shiwans",
        email: "Shiwans@gmail.com",
        age: 16,
        password: "Shiwans@12345"
    }).expect(201)
})

test('Should Login A User', async () => {
    const response = await request(app).post('/users/login').send(userOne).expect(200)

    const user = await User.findById(response.body.user._id)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not Login Non-Existent User', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: "hello"
    }).expect(400)
})

test('Should get Profile for User', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should Not get profile for unauthenticated User', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for User', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account for unauthenticated User', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should Upload avatar Image',async () => {
    await request(app)
    .post('/users/me/avatar')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .attach('avatar','test/fixtures/profile-pic.jpg')
    .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should Update valid User Fields', async () => {
    await request(app)
    .patch('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send({
        name: "Ravi"
    })
    .expect(200)
    
    const user = await User.findById(userOneId)
    expect(user.name).toBe('Ravi')
})

test('Should Not Update Invalid USer Fields',async () => {
    await request(app)
    .patch('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send({
        location: "Mumbai"
    })
    .expect(400)
})