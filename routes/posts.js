const router = require("express").Router()
const Post = require("../models/Post")
const User = require("../models/User")

//create a post
router.post("/", async (req,res)=>{
    const newPost = Post(req.body)
    try{
        const savedPost = await newPost.save()
        res.status(200).json(savedPost)
    }
    catch(err) {
        res.status(500).json(err)
    }
})

//update a post
router.put("/:id", async (req,res)=>{    
    try {
        const post = await Post.findById(req.params.id)

        if (req.body.userId === post.userId) {
            await post.updateOne({$set: req.body})
            res.status(200).json("Post has been updated")
        }
        else {
            return res.status(403).json("You cannot edit this post")
        }
    }
    catch(err) {
        res.status(500).json(err)
    }    
})

//delete a post
router.delete("/:id", async (req,res)=>{    
    try {
        const post = await Post.findById(req.params.id)

        if (req.body.userId === post.userId /*|| req.body.isAdmin*/) {
            await post.deleteOne()
            res.status(200).json("Post has been deleted")
        }
        else {
            return res.status(403).json("You cannot delete this post")
        }
    }
    catch(err) {
        res.status(500).json(err)
    }    
})

//like/dislike a post
router.put("/:id/like", async (req,res)=>{
    try {
        const post = await Post.findById(req.params.id)
        if (post.userId !== req.body.userId) {
            if (!post.likes.includes(req.body.userId)) {
                await post.updateOne({$push: { likes: req.body.userId }})
                return res.status(200).json("You liked this post")
            }
            else {
                await post.updateOne({$pull: { likes: req.body.userId }})
                return res.status(200).json("You unliked this post")
            }
        }
        else {
            return res.status(403).json("You cannot like your own post")
        }
    }
    catch(err) {
        res.status(500).json(err)
    }
})

//get a post
router.get("/:id", async (req,res)=>{    
    try {
        const post = await Post.findById(req.params.id)
        res.status(200).json(post)
    }
    catch(err) {
        res.status(500).json(err)
    }    
})

//get timeline posts
router.get("/timeline/all", async (req,res)=>{
    try {
        const currentUser = await User.findById(req.body.userId)
        console.log("halp")
        const userPosts = await Post.find({ userId: currentUser._id })
        const friendPosts = await Promise.all(
            currentUser.following.map((friendId) => {
                return Post.find({ userId: friendId })
            })
        )
        return res.status(200).json(userPosts.concat(...friendPosts))
    }
    catch(err) {
        res.status(500).json(err)
    }    
})

module.exports = router;