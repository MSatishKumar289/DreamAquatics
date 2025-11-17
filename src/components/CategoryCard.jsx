import { getImageWithFallback } from '../assets';
import { useNavigate } from 'react-router-dom';

const CategoryCard = ({ categoryName, product, isSubCategory = false, handleSubCategoryClick }) => {

  const navigate = useNavigate();

  const handleClick = () => {
    if(!isSubCategory){
      // Placeholder for future navigation/click handling
      navigate(`/category/${categoryName}/${product.title}`);
    } else {
      handleSubCategoryClick();
    }
  };

  // Get image from src/assets/ with fallback to placeholder
  const imageSrc = getImageWithFallback(product.image, product.title);

  return (
    <article
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 cursor-pointer"
      tabIndex="0"
      role="button"
      aria-label={`View details for ${product.title}`}
      onClick={handleClick}
    >
      {/* Image Container with 4:3 aspect ratio */}
      <div className="w-full aspect-[4/3] bg-gray-200 overflow-hidden">
        <img
          src={imageSrc}
          alt={`${product.title} - ${product.subtitle}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback placeholder if image doesn't load
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3E' + encodeURIComponent(product.title) + '%3C/text%3E%3C/svg%3E';
          }}
        />
      </div>

      {/* Card Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
          {product.title}
        </h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-1">
          {product.subtitle}
        </p>
        <p className="text-base font-bold text-blue-600">
          ₹{product?.price?.toLocaleString('en-IN')}
        </p>
      </div>
    </article>
  );
};

export default CategoryCard;
