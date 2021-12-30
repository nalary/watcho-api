const router = require('express').Router();
const Movie = require("../models/Movie");
const List = require("../models/List");
const verifyToken = require('../verifyToken');
const { findById } = require('../models/Movie');

// create a movie
router.post("/", verifyToken, async (req, res) => {
    if (req.user.isAdmin) {
        const newMovie = new Movie(req.body);

        try {
            const savedMovie = await newMovie.save();
            res.status(200).json(savedMovie);
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You are not allowed to do it!");
    }   
});


// update movie
router.put("/:id", verifyToken, async (req, res) => {
    if (req.user.isAdmin) {
        try {
            const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, 
                { $set: req.body },
                { new: true }
            );
            res.status(200).json(updatedMovie);
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You are not allowed to do it!");
    }
});


// delete movie
router.delete("/:id", verifyToken, async (req, res) => {
    if (req.user.isAdmin) {
        try {
            // delete movieId in list content
            const lists = await List.find({
                content: { $in: [req.params.id] },
            });
            
            await Promise.all(lists.map(list => {
                const updatedContent = list.content.filter(eachContent => eachContent !== req.params.id);
                return List.findByIdAndUpdate(list._id, { content: updatedContent }, { new: true });
            }));
            
            // delete movie
            await Movie.findByIdAndDelete(req.params.id);
            
            res.status(200).json("Movie has been deleted.");            
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You are not allowed to do it!");
    }
});


// get all genres
router.get("/genres", verifyToken, async (req, res) => {
    const type = req.query.type;
    let genres = [];
    
    try {
        if (type === 'movie')
        {
            const movies = await Movie.find();
            movies.map(movie => {
                if (!genres.includes(movie.genre)) {
                    genres.push(movie.genre);
                }
            });
        } else if (type === 'list')
        {
            const lists = await List.find();
            lists.map(list => {
                if (!genres.includes(list.genre)) {
                    genres.push(list.genre);
                }
            });
        }
        
        res.status(200).json(genres);
    } catch (err) {
        res.status(500).json(err);
    }
});


// get movie
router.get("/find/:id", verifyToken, async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        res.status(200).json(movie);
    } catch (err) {
        res.status(500).json(err);
    }
});


// get a random movie
router.get("/random", verifyToken, async (req, res) => {
    const type = req.query.type;
    let movie;
    try {
        if (type === "series") {
            movie = await Movie.aggregate([
                { $match: { isSeries: true } },
                { $sample: { size: 1 } },
            ]);
        } else {
            movie = await Movie.aggregate([
                { $match: { isSeries: false } },
                { $sample: { size: 1 } },
            ]);
        }       
        res.status(200).json(movie);
    } catch (err) {
        res.status(500).json(err);
    }
});


// get all movies
router.get("/", verifyToken, async (req, res) => {
    if (req.user.isAdmin) {
        try {
            const movies = await Movie.find();
            res.status(200).json(movies.reverse());
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You are not allowed to do it!");
    }
});

module.exports = router;