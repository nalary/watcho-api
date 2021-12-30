const router = require('express').Router();
const User = require("../models/User");
const CryptoJS = require('crypto-js');
const verifyToken = require('../verifyToken');

// update user
router.put("/:id", verifyToken, async (req, res) => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
        if (req.body.password) {
            req.body.password = CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY).toString();
        }

        try {
            const updatedUser = await User.findByIdAndUpdate(req.params.id, 
                { $set: req.body },
                { new: true }
            );
            res.status(200).json(updatedUser);
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You can update only your account!");
    }
});

// delete user
router.delete("/:id", verifyToken, async (req, res) => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
        try {
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json("User has been deleted.");
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You can delete only your account!");
    }
});

// get user
router.get("/find/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        const { password, ...others } = user._doc;
        res.status(200).json(others);
    } catch (err) {
        res.status(500).json(err);
    }
});

// get all users
router.get("/", verifyToken, async (req, res) => {
    const query = req.query.new;
    if (req.user.isAdmin) {
        try {
            const users = query ? await User.find().sort({ _id: -1 }).limit(5) : await User.find();

            const infoOnly = users.map(user => {
                const {password, ...others} = user._doc;
                return others;
            });
            res.status(200).json(infoOnly);
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You are not allowed to get all users!");
    }
});

// get user stats
router.get("/stats", verifyToken, async (req, res) => {
    if (req.user.isAdmin) {
        // const today = new Date();
        // const lastYear = today.setFullYear(today.setFullYear() - 1);

        try {
            const data = await User.aggregate([
                {
                    $project: {
                        month: { $month: "$createdAt" }
                    }
                }, 
                {
                    $group: {
                        _id: "$month",
                        total: { $sum: 1 }
                    }
                }
            ]);
            res.status(200).json(data);
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You are not allowed to do it!");
    }
});

module.exports = router;