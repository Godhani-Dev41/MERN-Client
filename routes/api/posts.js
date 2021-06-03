const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/post');

// Create Post
router.post('/', [auth, [
    check('text', 'Post text is required')
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id).select('-password');
        const { text } = req.body;
        const post = new Post({
            user: req.user.id,
            text: text,
            name: user.name,
            avatar: user.avatar
        });
        await post.save();
        res.status(200).json(post);
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: 'Server Error' })
    }
})

// Get All Posts
router.get('/all', async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });
        res.status(200).json(posts);
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: 'Server Error' })
    }
})

// Get Post by post Id
router.get('/:post_id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);
        if (!post) {
            return res.status(400).json({ msg: 'No Post found' });
        }

        res.status(200).json(post);
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: 'Server Error' })
    }
})

// Delete Post by Id
router.delete('/:post_id', async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.post_id);
        res.status(200).json({ msg: 'Post deleted successfully' });
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: 'Server Error' })
    }
})

// Like Post
router.put('/like/:post_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);

        const isAlreadyLiked = post.likes.some(like => like.user == req.user.id);
        if (isAlreadyLiked) {
            return res.status(400).json({ msg: 'Post already liked by User' });
        }

        post.likes.unshift({ user: req.user.id });
        await post.save();
        res.status(200).json(post);
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: 'Server Error' })
    }
})

// Unlike Post
router.put('/unlike/:post_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);

        const isNotAlreadyLiked = !post.likes.some(like => like.user == req.user.id);
        if (isNotAlreadyLiked) {
            return res.status(400).json({ msg: 'Post is not yet been liked' });
        }

        const newLikes = post.likes.reduce((arr, like) => {
            return like.user == req.user.id ? arr : [...arr, like]
        }, [])

        post.likes = newLikes;
        await post.save();
        res.status(200).json(post);
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: 'Server Error' })
    }
})

// Add Comment
router.put('/comment/:post_id', [auth, [
    check('text', 'Text is required')
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const post = await Post.findById(req.params.post_id).populate('user', ['name', 'avatar']);
        const comment = {
            user: req.user.id,
            text: req.body.text,
            name: post.name,
            avatar: post.avatar
        }
        post.comments.unshift(comment);
        await post.save();
        res.status(400).json(post)
    } catch (error) {
        console.log(errors);
        res.status(400).json('Server Error')
    }
})

// Delete Comment
router.delete('/comment/:post_id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);
        const comment = post?.comments.some(comment => comment.id == req.params.comment_id);

        if (!post) {
            return res.status(400).json({ msg: 'Post is not found' })
        }

        if (!comment) {
            return res.status(400).json({ msg: 'Comment is not found' })
        }

        const newComments = post.comments.reduce((arr, comment) => {
            return comment.id == req.params.comment_id ? arr : [...arr, comment]
        }, []);
        post.comments = newComments;
        await post.save();
        res.status(200).json(post);
    } catch (error) {
        console.log(error);
        res.status(400).json('Server Error')
    }
})

module.exports = router;