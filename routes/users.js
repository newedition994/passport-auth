const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const User = require('../models/User')


// Login page
router.get('/login', (req, res) => res.render('login'));

// Sign Up page
router.get('/register', (req, res) => res.render('register'));

// Sign Up Handle
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;

    let errors = [];

    // Required fields
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    // Check passwords match
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' })
    }

    // Check password characters
    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' })
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        })
    } else {
        // Validation passed
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    // User taken
                    errors.push({ msg: 'Email already used' })
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    })
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password
                    })
                    // Hash Password
                    bcrypt.genSalt(10, (err, salt) =>
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;

                            newUser.password = hash;

                            // Save
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'You are now logged in')
                                    res.redirect('/users/login')
                                })
                                .catch(err => console.log(err));
                        }))
                }
            })
    }
});

module.exports = router;