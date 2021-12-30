const router = require('express').Router();
const List = require("../models/List");
const verifyToken = require('../verifyToken');

// create a list
router.post("/", verifyToken, async (req, res) => {
    if (req.user.isAdmin) {
        const newList = new List(req.body);

        try {
            const savedList = await newList.save();
            res.status(200).json(savedList);
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You are not allowed to do it!");
    }   
});

// update list
router.put("/:id", verifyToken, async (req, res) => {
    if (req.user.isAdmin) {
        try {
            const updatedList = await List.findByIdAndUpdate(req.params.id, 
                { $set: req.body },
                { new: true }
            );
            res.status(200).json(updatedList);
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You are not allowed to do it!");
    }
});

// delete list
router.delete("/:id", verifyToken, async (req, res) => {
    if (req.user.isAdmin) {
        try {
            await List.findByIdAndDelete(req.params.id);
            res.status(200).json("List has been deleted.");
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You are not allowed to do it!");
    }
});

// get specific lists
router.get("/", verifyToken, async (req, res) => {
    const typeQuery = req.query.type;
    const genreQuery = req.query.genre;
    let lists = [];
    try {
        if (typeQuery === "series") {
            if (genreQuery) {   // 1. type series & genre O
                lists = await List.aggregate([
                    { $match: { 
                        isSeries: true,
                        genre: genreQuery
                    } },
                    { $sample: { size: 10 } }
                ]);
            } else {    // 2. type series & genre X
                lists = await List.aggregate([
                    { $match: { isSeries: true } },
                    { $sample: { size: 10 } }
                ]);
            }        
        } else if (typeQuery === "movies")  {
            if (genreQuery) {   // 3. type movies & genre O
                lists = await List.aggregate([
                    { $match: { 
                        isSeries: false,
                        genre: genreQuery
                    } },
                    { $sample: { size: 10 } }
                ]);
            } else {    // 4. type movies & genre X
                lists = await List.aggregate([
                    { $match: { isSeries: false } },
                    { $sample: { size: 10 } }
                ]);
            }  
        }else {
            if (genreQuery) {   // 5. type X & genre O
                lists = await List.aggregate([
                    { $match: { genre: genreQuery } },
                    { $sample: { size: 10 } }
                ]);
            } else {    // 6. type X & genre X    
                lists = await List.aggregate([
                    { $sample: { size: 10 } }
                ]);
            }            
        }     
        res.status(200).json(lists);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;