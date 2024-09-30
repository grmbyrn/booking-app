import PropTypes from 'prop-types';

const PlaceImg = ({place, index=0, className=null}) => {
    if(!place.photos?.length){
        return ''
    }

    if(!className){
        className = 'object-cover'
    }
  return (
    <img className={className} src={'http://localhost:4000/uploads/' + place.photos[index]} alt="" />
  )
}

PlaceImg.propTypes = {
    place: PropTypes.shape({
        photos: PropTypes.arrayOf(PropTypes.string).isRequired,  // Ensuring that photos is an array of strings
    }).isRequired,  // place is required
    index: PropTypes.number,  // index is a number
    className: PropTypes.string,  // className is a string
};

export default PlaceImg
