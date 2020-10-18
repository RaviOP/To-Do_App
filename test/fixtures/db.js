const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/User')
const Task = require('../../src/models/Tasks')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: "Prem",
    age: 15,
    email: "Prem@gmail.com",
    password: "Prem@12345",
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
}

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
    _id: userTwoId,
    name: "Ravi",
    age: 19,
    email: "Ravi@gmail.com",
    password: "Ravi@12345",
    tokens: [{
        token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }]
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: "First Task",
    completed: false,
    user: userOneId
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: "Second Task",
    completed: true,
    user: userOneId
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: "Three Task",
    completed: true,
    user: userTwoId
}

const setupDataBase = async () => {
    await User.deleteMany()
    await Task.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

module.exports = {
    setupDataBase,
    userOne,
    userOneId,
    userTwoId,
    userTwo,
    taskOne,
    taskTwo,
    taskThree
}