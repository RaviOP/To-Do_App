const express = require('express')
const Tasks = require('../models/Tasks')
const auth = require('../middleware/auth')
const router = express.Router()


//CREATE TASKS
router.post('/', auth, async (req, res) => {
    const tasks = new Tasks({
        ...req.body,
        user: req.user._id
    })
    try {
        await tasks.save()
        res.status(201).send(tasks)
    } catch (error) {
        res.status(400).send(error)
    }
})

//READ TASKS

// GET /tasks?completed=true/false
// GET /tasks?limit=10&skip=0 --> first set of 10
// GET /tasks?limit=10&skip=20 --> third set of 10
// GET /tasks?sortBy=
router.get('/', auth, async (req, res) => {
    const match = {}
    const sort = {}
    
    if (req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {
        /*
        const tasks = await Tasks.find({user: req.user._id})
        if (!tasks){
            return res.send('There are No Tasks')
        }
        res.status(200).send(tasks)
        */

        //OR
        await req.user.populate({
            path: 'tasks',
            match: match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (error) {
        res.status(500).send(error)
    }
})

//READ TASKS BY ID
router.get('/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        //const tasks = await Tasks.findById(_id)
        const tasks = await Tasks.findOne({ _id, user: req.user._id })
        if (!tasks) {
            return res.send('There are no Tasks')
        }
        res.status(200).send(tasks)
    } catch (error) {
        res.status(500).send(error)
    }
})

//UPDATE TASK
router.patch('/:id',auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })
    if (!isValidOperation) {
        return res.status(400).send({
            Error: 'Invalid Updates'
        })
    }
    try {
        const _id = req.params.id
        const tasks = await Tasks.findOne({_id,user: req.user._id})
        if (!tasks) {
            return res.status(404).send('No Tasks Found')
        }
        updates.forEach((update) => {
            tasks[update] = req.body[update]
        })
        await tasks.save()
        res.send(tasks)
    } catch (error) {
        res.status(400).send(error)
    }
})

//DELETE TASK
router.delete('/:id',auth, async (req, res) => {
    try {
        const tasks = await Tasks.findOneAndDelete({ _id: req.params.id, user: req.user._id })
        if (!tasks) {
            return res.status(404).send('No Tasks Found')
        }
        res.status(200).send(tasks)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router