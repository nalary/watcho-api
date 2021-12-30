const router = require('express').Router();
const User = require("../models/User");
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

// register
router.post("/register", async (req, res) => {
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY).toString(),
        isAdmin: req.body.isAdmin
    });

    try {
        const user = await newUser.save();
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }    
});

// login
router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        !user && res.status(401).json("Wrong password or email!");

        const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
        const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
        originalPassword !== req.body.password && res.status(401).json("Wrong password or email!");

        const accessToken = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.SECRET_KEY,
            { expiresIn: "3d" }
        );

        const { password, ...others } = user._doc;
        res.status(200).json({...others, accessToken });
    } catch (err) {
        res.status(500).json(err);
    }
});

// logout
// router.get("/logout", (req, res) => {
//     res.status(200).json({ logout: true });
// });

module.exports = router;