const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Post = mongoose.model("Post");
const auth = require("../middleware/auth");


router.get('/allpost',auth,(req,res)=>{
  Post.find()
  .populate("postedBy","_id name")
  .populate("comments.postedBy","_id name")
  .then(posts=>{
    res.json({posts})
  })
  .catch(err=>{
    res.status(400).json({error:"error"})
  })
  
})
//createpost
router.post("/createpost", auth, (req, res) => {
  const { title, body,url } = req.body;
  if (!title || !body || !url) {
    return res.status(422).json({ error: "please add all the fields" });
  }
  //req.user.password = undefined
  console.log(req.user)
  const post = new Post({
    title,
    body,
    photo:url,
    postedBy: req.user
  });
  post
    .save()
    .then((result) => {
      console.log(result)
      res.json({ post: result });
    })
    .catch(err=>{
      console.error(err)
    });
  }
);

router.get('/mypost',auth,(req,res)=>{
  Post.find({postedBy:req.user._id})
  .populate("postedBy","_id name")
  .then(mypost=>{
    res.json({mypost})
  }).catch(err=>{
    console.error(err)
  })
})

router.put('/like',auth,(req,res)=>{
  Post.findByIdAndUpdate(req.body.postId,{
    $push:{likes:req.user._id}
  },{
    new:true
  }).exec((err,result)=>{
    if(err){
      return res.status(422).json({error:err})
    }else{
      res.json(result)
    }
  })
  
  
})

router.put('/unlike',auth,(req,res)=>{
  Post.findByIdAndUpdate(req.body.postId,{
    $pull:{likes:req.user._id}
  },{
    new:true
  }).exec((err,result)=>{
    if(err){
      return res.status(422).json({error:err})
    }else{
      res.json(result)
    }
  })
  
  
})
router.put('/comment',auth,(req,res)=>{
  const comment={
    text:req.body.text,
    postedBy:req.user._id
  }
  Post.findByIdAndUpdate(req.body.postId,{
    $push:{comments:comment}
  },{
    new:true
  }).populate('comments.postedBy',"_id name")
  .populate('postedBy',"_id name")
  
  .exec((err,result)=>{
    if(err){
      return res.status(422).json({error:err})
    }else{
      res.json(result)
    }
  })
  
  
})
router.delete('/deletepost/:postId',auth,(req,res)=>{
  Post.findOne({_id:req.params.postId})
  .populate("postedBy","_id")
  .exec((err,post)=>{
    if(err|| !post){
      return res.status(422).json({error:"eroor"})
    }
    if(post.postedBy._id.toString()=== req.user._id.toString()){
      post.remove()
      .then(result=>{
        res.json(result)
      }).catch(err=>{
        console.log(err)
      })
    }
  })
})

module.exports = router;
