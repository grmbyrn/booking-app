import { useState } from "react"
import {differenceInCalendarDays} from "date-fns";
import PropTypes from 'prop-types';
import axios from "axios";
import { Navigate } from "react-router-dom";

const BookingWidget = ({place}) => {
    const [checkIn, setCheckIn] = useState('')
    const [checkOut, setCheckOut] = useState('')
    const [numberOfGuests, setNumberOfGuests] = useState(1)
    const [name, setName] = useState('')
    const [mobile, setMobile] = useState('')
    const [redirect, setRedirect] = useState('')

    let numberOfNights = 0

    if(checkIn && checkOut){
        numberOfNights = differenceInCalendarDays(new Date(checkOut), new Date(checkIn))
    }

    async function bookThisPlace(){
        const response = await axios.post('/bookings', {checkIn, checkOut, name, mobile, numberOfGuests, place: place._id, price: numberOfNights * place.price})
        const bookingId = response.data._id
        setRedirect(`/account/bookings/${bookingId}`)
    }

    if(redirect){
        return <Navigate to={redirect} />
    }

  return (
    <div className="bg-white shadow p-4 rounded-2xl">
        <div className="shadow p-4 rounded-2xl">
            <div className="text-2xl text-center">Price: ${place.price} / per night</div>
        </div>
        <div className="border rounded-2xl mt-4">
            <div className="flex">
                <div className="px-4 py-3">
                    <label>Check in:</label>
                    <input type="date"
                        value={checkIn} 
                        onChange={e => setCheckIn(e.target.value)}
                    />
                </div>
                <div className="px-4 py-3 border-l">
                    <label>Check out:</label>
                    <input type="date"
                        value={checkOut} 
                        onChange={e => setCheckOut(e.target.value)}
                    />
                </div>
            </div>
            <div className="px-4 py-3 border-t">
                <label>Number of guests:</label>
                <input type="number"
                    value={numberOfGuests} 
                    onChange={e => setNumberOfGuests(e.target.value)}
                />
            </div>
            {numberOfNights > 0 && (
                <div className="px-4 py-3 border-t">
                    <label>Your full name:</label>
                    <input type="text"
                        value={name} 
                        onChange={e => setName(e.target.value)}
                    />
                    <label>Your mobile number:</label>
                    <input type="tel"
                        value={mobile} 
                        onChange={e => setMobile(e.target.value)}
                    />
                </div>
            )}
        </div>
        <button onClick={bookThisPlace} className="primary mt-4">
            Book this place
            {numberOfNights > 0 && (
                <span>${numberOfNights * place.price}</span>
            )}
        </button>
    </div>
  )
}

BookingWidget.propTypes = {
    place: PropTypes.shape({
        price: PropTypes.number.isRequired,
        _id: PropTypes.number.isRequired,
    }).isRequired
}

export default BookingWidget
