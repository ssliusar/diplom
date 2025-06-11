const router = require('express').Router();
const { question } = require('../db');

router.get('/getQuestions',  async (req, res) => {
    try {

        const getQuestion = await question.findAll();
        return res.status(200).json(getQuestion);

    } catch (e) {
        console.error(e)
        res.status(500).send();
    }
})

module.exports = router;
