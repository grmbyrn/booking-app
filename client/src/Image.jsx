import PropTypes from 'prop-types';

const Image = ({src, ...rest}) => {
    src = src && src.includes('https://') ? src : 'http://localhost:4000/uploads/' + src
  return (
      <img {...rest} src={src} alt="" />
  )
}

Image.propTypes = {
    src: PropTypes.string.isRequired,
};

export default Image
