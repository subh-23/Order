const express = require('express')
const app = express()
const mongoose = require('mongoose')
//dotenv
require('dotenv').config()
const PORT = process.env.PORT
const MONGO_URI = process.env.MONGO_URI
//login libraries
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const initializePassport = require('./passport-config')
//importing mongoSchema
const Users = require('./model/users')
const Product = require('./model/product')
//importing roles
const ROLE = require('./roles')
//auth each role
const { authRole } = require('./roleAuth')

//mongodb connection
//MongoDB connection
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true, useUnifiedTopology: true
}, () => console.log(`Database is connected to ${MONGO_URI}`))

//initialixing passport
initializePassport(passport)

//middlewares
// app.use(express.json())
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }))

//login middlewares
app.use(flash())
app.use(session({
    secret: "Secret",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


//registration and login forms
//for rendering register form
app.get('/register', checkNotAuthenticated, (req, res) => {
    // res.send("Welcome to register")
    res.render('register.ejs')
})
//for rendering login form 
app.get('/login', checkNotAuthenticated, (req, res) => {
    // res.send("welcome to login")
    res.render('login.ejs')
})
//for registration 
app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = await Users.findOne({ username: req.body.username })
        if (user) return res.status(400).send("User Already Exists")
        await Users.create({
            name: req.body.name,
            username: req.body.username,
            password: hashedPassword,
            role: req.body.role
        })
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
    // console.log(users)
})
//for authenticate and login
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: `/`,
    failureRedirect: '/login',
    failureFlash: true
}))
//for logout
app.delete('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});




//routes
app.get('/', checkAuthenticated, (req, res) => {
    res.render('index');
})
app.get('/customer', checkAuthenticated, authRole(ROLE.CUSTOMER), (req, res) => {
    res.render('customer')
})
app.get('/admin', checkAuthenticated, authRole(ROLE.ADMIN), async (req, res) => {
    const products = await Product.find();
    res.render("admin", { products: products })
})
// admin is adding products
app.post('/admin', checkAuthenticated, authRole(ROLE.ADMIN), async (req, res) => {
    try {
        const product = await Product.findOne({ title: req.body.title })
        if (product) return res.status(400).send("Product Already Exists")
        await Product.create({
            title: req.body.title,
            price: req.body.price,
            product_type: req.body.product_type
        })
        res.status(201).redirect('/admin')
    } catch (error) {
        res.status(401).send("Error")
    }
})
app.get('/admin/:id', checkAuthenticated, authRole(ROLE.ADMIN), async (req, res) => {
    const id = req.params.id
    try {
        const product = await Product.findById(id);
        if (product == null) {
            res.status(404).send({ message: "Product is not present in the list" })
        }
        else {
            await Product.findByIdAndDelete(id)
            res.status(200).redirect('/admin')
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})
app.get('/driver', checkAuthenticated, authRole(ROLE.DRIVER), (req, res) => {
    res.render("driver")
})



//security wall
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

app.listen(PORT, () => console.log(`server is listening on port ${PORT}`))