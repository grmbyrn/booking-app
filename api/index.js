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
const {S3Client, PutObjectCommand} = require('@aws-sdk/client-s3')
const fs = require('fs')
const multer = require('multer')
const mime = require('mime-types')

const bcryptSalt = bcrypt.genSaltSync(10)
const jwtSecret = process.env.JWT_SECRET
const bucket = 'graeme-booking-app'

app.use(express.json())
app.use(cookieParser())
app.use('/uploads', express.static(__dirname+'/uploads'))
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5174',
  }));

async function uploadToS3(path, originalFileName, mimeType) {
    const client = new S3Client({
        region: 'eu-north-1',
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
        }
    })
    const parts = originalFileName.split('.')
    const ext = parts[parts.length - 1]
    const newFilename = Date.now() + '.' + ext
    const data = await client.send(new PutObjectCommand({
        Bucket: bucket,
        Body: fs.readFileSync(path),
        Key: newFilename,
        ContentType: mimeType,
        ACL: 'public-read'
    }))
    return `https://${bucket}.s3.amazonaws.com/${newFilename}`
}

function getUserDataFromReq(req){
    return new Promise((resolve, reject) => {
        jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
            if(err) throw err
            resolve(userData)
        })
    })
}

app.get('/api/test', (req, res) => {
    mongoose.connect(process.env.MONGO_URL)
    res.json('test ok')
})

app.post('/api/register' , async(req, res) => {
    mongoose.connect(process.env.MONGO_URL)
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

app.post('/api/login', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL)
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

app.get('/api/profile', (req, res) => {
    mongoose.connect(process.env.MONGO_URL)
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

app.post('/api/logout', (req, res) => {
    res.cookie('token', '').json(true)
})

app.post('/api/upload-by-link', async (req, res) => {
    const {link} = req.body
    const newName = 'photo' + Date.now() + '.jpg'
    await imageDownLoader.image({
        url: link,
        dest: '/tmp/' + newName
    })
    const url = await uploadToS3('/tmp/' + newName, newName, mime.lookup('/tmp/' + newName))
    res.json(url)
})

const photosMiddleware = multer({dest: '/tmp'})
app.post('/api/upload', photosMiddleware.array('photos', 100), async (req, res) => {
    const uploadedFiles = []
    for (let i = 0; i < req.files.length; i++) {
        const {path, originalname, mimetype} = req.files[i]
        const url = await uploadToS3(path, originalname, mimetype)
        uploadedFiles.push(url)
    }
    res.json(uploadedFiles)
})

app.post('/api/places', (req, res) => {
    mongoose.connect(process.env.MONGO_URL)
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

app.get('/api/user-places', (req, res) => {
    mongoose.connect(process.env.MONGO_URL)
    const {token} = req.cookies
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        const {id} = userData
        res.json(await Place.find({owner:id}))
    }
)})

app.get('/api/places/:id', async(req, res) => {
    mongoose.connect(process.env.MONGO_URL)
    const {id} = req.params
    res.json(await Place.findById(id))
})

app.put('/api/places/:id', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL)
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

app.get('/api/places', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL)
    res.json(await Place.find())
})

app.post('/api/bookings', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL)
    try {
        const userData = await getUserDataFromReq(req); // Ensure this function works and returns the user data
        const { place, checkIn, checkOut, numberOfGuests, name, mobile, price } = req.body;
        
        // Create the booking
        const booking = await Booking.create({
            place, checkIn, checkOut, numberOfGuests, name, mobile, price, user: userData.id
        });

        // Send the booking document as response
        res.json(booking);

    } catch (error) {
        // Handle any errors during the booking creation
        console.error('Error creating booking:', error);
        res.status(500).json({ error: 'Booking failed' });
    }
});


app.get('/api/bookings', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL)
    const userData = await getUserDataFromReq(req)
    res.json(await Booking.find({user:userData.id}).populate('place'))
})

app.listen(4000)