const express = require('express');
const request = require('request');
const config = require('config');
const { check, validationResult, body } = require('express-validator');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// get logged in user Profile
router.get('/', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate(
            'user',
            ['name', 'avatar']
        );

        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }

        res.json(profile);
    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
    }
});

router.post('/', [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { company, website, location, status, skills, bio, githubusername, youtube, twitter, facebook, instagram, linkedin } = req.body;

    console.log(status);

    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
        profileFields.skills = skills.split(',').map(s => s.trim())
    }

    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try {
        let profile = await Profile.findOne({ user: req.user.id });

        // update
        if (profile) {
            await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true });
        }

        //create
        profile = new Profile(
            profileFields
        )

        await profile.save();

        res.json(profile);
    } catch (error) {
        console.log(error);
        res.status(500).json('Server Error');
    }
})


// get all Profiles
router.get('/all', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (error) {
        console.log(error);
        res.status(500).json('Server Error');
    }
});

// get Profile by User ID
router.get('/user/:userId', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.userId }).populate('user', ['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({ msg: 'Profile not found' })
        }

        res.json(profile);

    } catch (error) {
        console.log(error);
        if (error.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'Profile not found' })
        }

        res.status(500).json('Server Error');
    }
})

// Delete Profile and User
router.delete('/', auth, async (req, res) => {
    try {
        await Profile.findOneAndRemove({ user: req.user.id });
        await User.findByIdAndRemove(req.user.id);

        res.json({ msg: 'Profile and User deleted successfully' })
    } catch (error) {
        console.log(error);
        res.status(400).json('Server Error')
    }
})

// Add Experience to Profile
router.put('/experience', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'rom is required').not().isEmpty(),
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { title, company, location, from, to, current, description } = req.body;
    const profileExperience = { title, company, location, from, to, current, description }

    try {
        const profile = await Profile.findOne({ user: req.user.id });

        if (!profile) {
            res.status(400).json({ msg: 'No Profile found for this user' })
        }

        profile.experience.unshift(profileExperience);
        await profile.save();
    } catch (error) {
        console.log(error);
        res.status(400).json('Server Error')
    }
})

module.exports = router;

// Delete Experience
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        if (!profile) {
            return res.status(400).res({ msg: 'No Profile found' })
        }

        const education = profile.experience.reduce((arr, e) => {
            return e.id !== req.params.exp_id ? [...arr, e] : arr
        }, []);

        profile.experience = education;
        await profile.save();
        res.status(200).json(profile);
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: 'Server Error' });
    }
})

// Add Education
router.put('/education', [auth, [
    check('school', 'School is required'),
    check('degree', 'Degree is required'),
    check('fieldOfStudy', 'FieldOfStudy is required'),
    check('from', 'From is required'),
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { school, degree, fieldofstudy, from, to, current, description } = req.body;

    const education = { school, degree, fieldofstudy, from, to, current, description };

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            return res.status(400).json({ msg: 'Profile not found' })
        }
        if (profile.education?.length) {
            profile.education.unshift(education);
        } else {
            profile.education = [education];
        }
        await profile.save();
        res.status(200).json(profile);
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: 'Server Error' });
    }
})

// Delete Education
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        if (!profile) {
            return res.status(400).res({ msg: 'No Profile found' })
        }

        const education = profile.education.reduce((arr, e) => {
            return e.id !== req.params.edu_id ? [...arr, e] : arr
        }, []);

        profile.education = education;
        await profile.save();
        res.status(200).json(profile);
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: 'Server Error' });
    }
})


// Get Github Profile
router.get('/github/:user_name', (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.user_name}/repos?per_page:5&sort=created:asc
        &client_id:${config.get('githubClientId')}&client_secret:${config.get('githubSecret')}`,
            method: 'GET',
            headers: { 'user-agent': 'node.js' }
        };

        request(options, (err, response, body) => {
            if (err) {
                console.log(err)
                return res.status(400).json({ errors: err })
            };

            if (!response.statusCode === 200) {
                return res.status(400).json({ msg: 'No Github profile found' });
            }

            res.status(200).json(JSON.parse(body))
        })
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: 'Server Error' });
    }
})