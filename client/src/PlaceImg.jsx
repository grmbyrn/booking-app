import PropTypes from 'prop-types';
import Image from './Image';

const PlaceImg = ({place, index=0, className=null}) => {
    if(!place.photos?.length){
        return ''
    }

    if(!className){
        className = 'object-cover'
    }
  return (
    <Image className={className} src={place.photos[index]} alt="" />
  )
}

PlaceImg.propTypes = {
    place: PropTypes.shape({
        photos: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
    index: PropTypes.number,
    className: PropTypes.string,
};

export default PlaceImg
