const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const bcrypt = require("bcryptjs");
const jwtToken = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/config");

router.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ error: "not filled" });
  }
  User.findOne({ email }).then((savedUser) => {
    if (savedUser) {
      return res.status(422).json({ error: "user already exists" });
    }


    bcrypt
      .hash(password, 12)
      .then((hashedPass) => {

        const user = new User({
          email,
          password: hashedPass,
          name,
        });

        user.save()
          .then((user) => {
            return res.json({ msg: "registered successfully" });
          })
          .catch(err=>{
            console.log(err)
          });
       
      })
      .catch(err=>{
        console.log(err)
      });
  });
});

router.post("/signin", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(422).json({ error: "fields required" });
  }
  User.findOne({ email: email }).then((savedUser) => {
    if (!savedUser) {
      return res.status(400).json({ error: "Invalid credential" });
    }
    bcrypt
      .compare(password, savedUser.password)
      .then((doMatch) => {
        if (doMatch) {
          // res.json({
          //   msg: "successfully sign in",
          // });
          const token = jwtToken.sign({ id: savedUser._id }, JWT_SECRET);
          const {_id,name,email}=savedUser
          res.json({ token,user:{_id,name,email} });
        } else {
          return res.status(400).json({ error: "invalid credential" });
        }
      })
      .catch(err=>{
        console.log(err)
      });
    
  });
});
module.exports = router;
