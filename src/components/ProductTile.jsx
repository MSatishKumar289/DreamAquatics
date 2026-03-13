const ProductTile = ({ product, onViewMore }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
      {/* Product Title */}
      <h3 className="text-base font-semibold mb-2 px-4 pt-4">
        {product.title}
      </h3>

      {/* Product Image */}
      <div className="w-full aspect-[4/3] bg-gray-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Price */}
      <p className="text-lg font-semibold text-gray-900 mt-3 px-4">
        {'\u20B9'}
        {Number(product.price ?? 0).toLocaleString('en-IN')}
      </p>

      {/* Short Description (2 lines with ellipsis) */}
      <p className="px-4 mt-2 text-sm text-gray-600 line-clamp-2">
        {product.description}
      </p>

      {/* View More Button */}
      <button
        onClick={() => onViewMore(product)}
        className="mt-4 mx-4 mb-4 text-sm font-medium text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
        aria-label={`View details for ${product.title}`}
      >
        View More
      </button>
    </div>
  );
};

export default ProductTile;

