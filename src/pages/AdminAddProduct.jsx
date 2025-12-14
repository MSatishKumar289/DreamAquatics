import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { subcategoryData } from "../data/subcategoryData";

const CATEGORY_TO_SUBCATEGORY_TITLES = {
  Fishes: ["Neon Tetra", "Betta Fish", "Goldfish", "Angelfish"],
  "Live Plants": ["Java Fern", "Anubias", "Amazon Sword", "Dwarf Hairgrass"],
  Accessories: ["LED Aquarium Light", "Filter System", "Heater", "Air Pump"],
  Tanks: ["Glass Aquarium 20L", "Glass Aquarium 50L", "Glass Aquarium 100L", "Premium Reef Tank"]
};

const AdminAddProduct = ({ profile }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    subcategory: "",
    description: ""
  });
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!profile || profile.role !== "admin") {
      navigate("/", { replace: true });
    }
  }, [profile, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Reset subcategory when category changes
      if (name === "category") {
        updated.subcategory = "";
      }
      return updated;
    });
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageError("");

    // Check if adding these files would exceed the limit
    const currentCount = images.length;
    const newCount = files.length;
    const totalCount = currentCount + newCount;

    if (totalCount > 3) {
      setImageError("Maximum 3 images allowed. Only the first " + (3 - currentCount) + " image(s) will be added.");
      // Only take as many files as needed to reach 3 total
      files.splice(3 - currentCount);
    }

    const newImages = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      file: file
    }));

    setImages((prev) => [...prev, ...newImages]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (id) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id);
      if (imageToRemove && imageToRemove.previewUrl) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product Title is required";
    }

    if (!formData.category) {
      newErrors.category = "Main Category is required";
    }

    if (!formData.subcategory) {
      newErrors.subcategory = "Subcategory is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Product Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setImageError("");

    if (!validateForm()) {
      return;
    }

    // Build product object
    const product = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      category: formData.category,
      subcategory: formData.subcategory,
      description: formData.description.trim(),
      images: images.map((img) => ({
        id: img.id.toString(),
        name: img.name,
        previewUrl: img.previewUrl
      })),
      createdAt: new Date().toISOString()
    };

    // Get existing products from localStorage
    const existingProducts = JSON.parse(
      localStorage.getItem("dream-aquatics-admin-products") || "[]"
    );

    // Append new product
    const updatedProducts = [...existingProducts, product];

    // Save back to localStorage
    localStorage.setItem("dream-aquatics-admin-products", JSON.stringify(updatedProducts));

    // Clear form
    setFormData({
      name: "",
      category: "",
      subcategory: "",
      description: ""
    });

    // Clean up image URLs and clear images
    images.forEach((img) => {
      if (img.previewUrl) {
        URL.revokeObjectURL(img.previewUrl);
      }
    });
    setImages([]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Show success message
    setSuccessMessage("Product added successfully!");

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  // Get available subcategories based on selected category
  const availableSubcategories = formData.category
    ? CATEGORY_TO_SUBCATEGORY_TITLES[formData.category] || []
    : [];

  if (!profile || profile.role !== "admin") {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow my-8">
        <p className="text-base font-semibold text-gray-700">
          You do not have access to this page.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow my-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Product</h1>

      {successMessage && (
        <div
          className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded"
          role="alert"
        >
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Title */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Product Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter product title"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        {/* Main Category */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Main Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.category ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select a category</option>
            <option value="Fishes">Fishes</option>
            <option value="Live Plants">Live Plants</option>
            <option value="Accessories">Accessories</option>
            <option value="Tanks">Tanks</option>
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.category}
            </p>
          )}
        </div>

        {/* Subcategory */}
        <div>
          <label
            htmlFor="subcategory"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Subcategory <span className="text-red-500">*</span>
          </label>
          <select
            id="subcategory"
            name="subcategory"
            value={formData.subcategory}
            onChange={handleInputChange}
            disabled={!formData.category}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.subcategory ? "border-red-500" : "border-gray-300"
            } ${
              !formData.category
                ? "bg-gray-100 cursor-not-allowed"
                : "bg-white"
            }`}
          >
            <option value="">
              {formData.category
                ? "Select a subcategory"
                : "Select a category first"}
            </option>
            {availableSubcategories.map((subcategory) => (
              <option key={subcategory} value={subcategory}>
                {subcategory}
              </option>
            ))}
          </select>
          {errors.subcategory && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.subcategory}
            </p>
          )}
        </div>

        {/* Product Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Product Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={5}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter product description"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.description}
            </p>
          )}
        </div>

        {/* Images */}
        <div>
          <label
            htmlFor="images"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Product Images (up to 3)
          </label>
          <input
            type="file"
            id="images"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            multiple
            disabled={images.length >= 3}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              images.length >= 3
                ? "bg-gray-100 cursor-not-allowed border-gray-300"
                : "border-gray-300"
            }`}
          />
          {imageError && (
            <p className="mt-1 text-sm text-yellow-600" role="alert">
              {imageError}
            </p>
          )}
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative">
                  <img
                    src={image.previewUrl}
                    alt={image.name}
                    className="w-full h-32 object-cover rounded-md border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(image.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label={`Remove ${image.name}`}
                  >
                    ×
                  </button>
                  <p className="mt-1 text-xs text-gray-600 truncate">
                    {image.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
          >
            Add Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminAddProduct;
