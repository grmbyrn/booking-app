const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('./models/User.js')
const Place = require('./models/Place.js')
const Booking = require('./models/Booking.js')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const app = express()
const imageDownLoader = require('image-downloader')
const multer = require('multer')
const fs = require('fs')

const bcryptSalt = bcrypt.genSaltSync(10)
const jwtSecret = 'eirhgdujbgjsbjrgbej'

app.use(express.json())
app.use(cookieParser())
app.use('/uploads', express.static(__dirname+'/uploads'))
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173'
}))

mongoose.connect(process.env.MONGO_URL)

app.get('/test', (req, res) => {
    res.json('test ok')
})

app.post('/register' , async(req, res) => {
    const {name, email, password} = req.body

    try{
        const userDoc = await User.create({
            name,
            email,
            password: bcrypt.hashSync(password, bcryptSalt)
        })
    
        res.json(userDoc)
    } catch(err){
        res.status(422).json(err)
    }
})

app.post('/login', async (req, res) => {
    const {email, password} = req.body
    const userDoc = await User.findOne({email})
    if(userDoc){
        const passOk = bcrypt.compareSync(password, userDoc.password)
        if(passOk){
            jwt.sign({
                email: userDoc.email,
                id: userDoc._id,
            }, jwtSecret, {}, (err, token) => {
                if(err) throw err
                res.cookie('token', token).json(userDoc)
            })
        } else {
            res.status(422).json('pass not ok')
        }
    } else {
        res.json('not found')
    }
})

app.get('/profile', (req, res) => {
    const {token} = req.cookies
    if(token){
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if(err) throw err
            const {name, email, _id} = await User.findById(userData.id)
            res.json({name, email, _id})
        })
    } else {
        res.json(null)
    }
})

app.post('/logout', (req, res) => {
    res.cookie('token', '').json(true)
})

app.post('/upload-by-link', async (req, res) => {
    const {link} = req.body
    const newName = 'photo' + Date.now() + '.jpg'
    await imageDownLoader.image({
        url: link,
        dest: __dirname + '/uploads/' + newName
    })
    res.json(newName)
})

const photosMiddleware = multer({dest: 'uploads/'})
app.post('/upload', photosMiddleware.array('photos', 100), (req, res) => {
    const uploadedFiles = []
    for (let i = 0; i < req.files.length; i++) {
        const {path, originalname} = req.files[i]
        const parts = originalname.split('.')
        const ext = parts[parts.length - 1]
        const newPath = path + '.' + ext
        fs.renameSync(path, newPath)
        uploadedFiles.push(newPath.replace('uploads/', ''))
    }
    res.json(uploadedFiles)
})

app.post('/places', (req, res) => {
    const {token} = req.cookies
    const {title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price} = req.body
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if(err) throw err
        const placeDoc = await Place.create({
            owner: userData.id,
            title, address, photos: addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price
        })
        res.json(placeDoc)
    })
})

app.get('/user-places', (req, res) => {
    const {token} = req.cookies
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        const {id} = userData
        res.json(await Place.find({owner:id}))
    }
)})

app.get('/places/:id', async(req, res) => {
    const {id} = req.params
    res.json(await Place.findById(id))
})

app.put('/places/:id', async (req, res) => {
    const { token } = req.cookies;
    const { title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price } = req.body;
    const { id } = req.params; // Extract the ID from the URL parameters

    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized' }); // Handle JWT verification error
        }

        const placeDoc = await Place.findById(id); // Find the place by ID
        if (!placeDoc) {
            return res.status(404).json({ error: 'Place not found' }); // Handle place not found
        }

        if (userData.id !== placeDoc.owner.toString()) {
            return res.status(403).json({ error: 'You are not authorized to update this place' }); // Handle unauthorized update
        }

        // Update the place details
        placeDoc.set({
            title,
            address,
            photos: addedPhotos,
            description,
            perks,
            extraInfo,
            checkIn,
            checkOut,
            maxGuests,
            price
        });

        await placeDoc.save();
        res.json({ message: 'Place updated successfully' });
    });
});

app.get('/places', async (req, res) => {
    res.json(await Place.find())
})

app.post('/bookings', (req, res) => {
    const {place, checkIn, checkOut, numberOfGuests, name, mobile, price} = req.body
    Booking.create({
        place, checkIn, checkOut, numberOfGuests, name, mobile, price
    }).then((err, doc) => {
        res.json(doc)
    }).catch((err) => {
        throw err
    })
})

app.listen(4000)