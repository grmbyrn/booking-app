import { useEffect, useState } from "react"
import Perks from '../Perks.jsx'
import PhotosUploader from "../PhotosUploader"
import axios from "axios"
import AccountNav from "../AccountNav.jsx"
import { Navigate, useParams } from "react-router-dom"

const PlacesFormPage = () => {
    const {id} = useParams()
    const [title, setTitle] = useState('')
    const [address, setAddress] = useState('')
    const [addedPhotos, setAddedPhotos] = useState([])
    const [description, setDescription] = useState('')
    const [perks, setPerks] = useState([])
    const [extraInfo, setExtraInfo] = useState('')
    const [checkIn, setCheckIn] = useState('')
    const [checkOut, setCheckOut] = useState('')
    const [maxGuests, setMaxGuests] = useState(1)
    const [price, setPrice] = useState(100)
    const [redirect, setRedirect] = useState(false)

    useEffect(() => {
        if(!id){
            return
        }
        axios.get('/places/'+id).then(response => {
            const {data} = response
            setTitle(data.title)
            setAddress(data.address)
            setAddedPhotos(data.photos)
            setDescription(data.description)
            setPerks(data.perks)
            setExtraInfo(data.extraInfo)
            setCheckIn(data.checkIn)
            setCheckOut(data.checkOut)
            setMaxGuests(data.maxGuests)
            setPrice(data.price)
        })
    }, [id])

    function inputHeader(text){
        return (
            <h2 className="text-2xl mt-4">{text}</h2>
        )
    }

    function inputDescription(text){
        return (
            <p className="text-gray-500 text-sm">{text}</p>
        )
    }
    
    function preInput(header, description){
        return (
            <>
                {inputHeader(header)}
                {inputDescription(description)}
            </>
        )
    }

    async function savePlace(e){
        e.preventDefault()
        const placeData = {title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price}
        try {
            if (id) {
                // Update the place using the correct URL
                await axios.put(`/places/${id}`, placeData, {
                    withCredentials: true // Ensure cookies are sent
                });
            } else {
                // Create a new place
                await axios.post('/places', placeData, {
                    withCredentials: true // Ensure cookies are sent
                });
            }
            setRedirect(true);
        } catch (error) {
            console.error("Error saving place:", error.response ? error.response.data : error.message);
            // Optionally, handle error state (e.g., show an alert or message)
        }
    }

    if(redirect){
        return <Navigate to={'/account/places'} />
    }
  return (
    <div>
        <AccountNav />
        <form onSubmit={savePlace}>
            {preInput('Title', 'Title for this place')}
            <input type='text' value={title} onChange={e => setTitle(e.target.value)} placeholder="title, for example: My lovely apartment" />
            {preInput('Address', 'Address for this place')}
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="address" />
            {preInput('Photos', 'More = better')}

            <PhotosUploader addedPhotos={addedPhotos} onChange={setAddedPhotos} />
            
            {preInput('Description', 'Description of this place')}
            <textarea value={description} onChange={e => setDescription(e.target.value)} />
            {preInput('Perks', 'Select the perks of this place')}
            <Perks selected={perks} onChange={setPerks} />
            
            {preInput('Extra info', 'House rules, etc')}
            <textarea  value={extraInfo} onChange={e => setExtraInfo(e.target.value)} />
            {preInput('Check in & out times', 'Add check in and out times, remember to leave time to clean the room between guests')}
            <div className="grid gap-2 grid-cols-2 mf:grid-cols-4">
                <div>
                    <h3 className="mt-2 -mb-1">Check in time</h3>
                    <input type="text" value={checkIn} onChange={e => setCheckIn(e.target.value)} placeholder="14:00" />
                </div>
                <div>
                    <h3 className="mt-2 -mb-1">Check out time</h3>
                    <input type="text" value={checkOut} onChange={e => setCheckOut(e.target.value)} />
                </div>
                <div>
                    <h3 className="mt-2 -mb-1">Max number of guests</h3>
                    <input type="number" value={maxGuests} onChange={e => setMaxGuests(e.target.value)} />
                </div>
                <div>
                    <h3 className="mt-2 -mb-1">Price per night</h3>
                    <input type="number" value={price} onChange={e => setPrice(e.target.value)} />
                </div>
            </div>
            <button className="primary my-4">Save</button>
        </form>
    </div>
  )
}

export default PlacesFormPage
