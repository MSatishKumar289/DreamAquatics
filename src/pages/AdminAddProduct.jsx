import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import deleteIcon from "../assets/Images/delete.png";
import editIcon from "../assets/Images/edit.png";
import {
  createProduct,
  uploadProductImage,
  fetchProducts,
  fetchCategories,
  fetchSubcategories
} from "../lib/catalogApi.js";

const CATEGORY_TO_SUBCATEGORY_TITLES = {
  Fishes: ["Neon Tetra", "Betta Fish", "Goldfish", "Angelfish"],
  "Live Plants": ["Java Fern", "Anubias", "Amazon Sword", "Dwarf Hairgrass"],
  Accessories: ["LED Aquarium Light", "Filter System", "Heater", "Air Pump"],
  Tanks: ["Glass Aquarium 20L", "Glass Aquarium 50L", "Glass Aquarium 100L", "Premium Reef Tank"]
};

const CATEGORY_SLUG_MAP = {
  Fishes: 'Fishes',
  'Live Plants': 'Plants',
  Accessories: 'Accessories',
  Tanks: 'Tanks',
};

const STORAGE_KEY = "dream-aquatics-admin-data";
const MAX_IMAGE_BYTES = 300 * 1024;
const MAX_IMAGE_DIMENSION = 720;

const blankItemDraft = {
  name: "",
  price: "",
  description: "",
  availability: "in-stock",
  imageData: "",
  imageName: ""
};

const blankSubcategoryDraft = {
  name: "",
  description: "",
  imageData: "",
  imageName: ""
};

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/* =========================
   normalize DB products
========================= */
const normalizeProducts = (products = []) =>
  products.map((p) => ({
    ...p,
    imageData: p.product_images?.[0]?.url || ""

  }));

const AdminAddProduct = ({ profile }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const subcategoryFileInputRef = useRef(null);

  /* =========================
     CATEGORY (UI + DB)
  ========================= */
  const [selectedCategory, setSelectedCategory] = useState("Fishes");
  const [dbCategories, setDbCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  /* =========================
     SUBCATEGORY (DB)
  ========================= */
  const [dbSubcategories, setDbSubcategories] = useState([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");

  /* =========================
     PRODUCTS (DB)
  ========================= */
  const [itemsBySubcategory, setItemsBySubcategory] = useState({});

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemDraft, setItemDraft] = useState(blankItemDraft);
  const [editingItemId, setEditingItemId] = useState(null);
  const [itemError, setItemError] = useState("");
  const [storageError, setStorageError] = useState("");

  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [subcategoryDraft, setSubcategoryDraft] = useState(blankSubcategoryDraft);
  const [editingSubcategoryId, setEditingSubcategoryId] = useState(null);
  const [subcategoryError, setSubcategoryError] = useState("");

  const [isSubcategoriesLoading, setIsSubcategoriesLoading] = useState(false);
  const [isProductsLoading, setIsProductsLoading] = useState(false);

  /* =========================
     FETCH CATEGORIES
  ========================= */
  useEffect(() => {
    (async () => {
      const { data } = await fetchCategories();
      if (data?.length) {
        setDbCategories(data);
        const match = data.find((c) => c.name === selectedCategory);
        setSelectedCategoryId(match?.id || data[0].id);
      }
    })();
  }, []);

  useEffect(() => {
    if (!dbCategories.length) return;
    const match = dbCategories.find((c) => c.name === selectedCategory);
    setSelectedCategoryId(match?.id || null);
  }, [selectedCategory, dbCategories]);

  /* =========================
     FETCH SUBCATEGORIES
  ========================= */
  useEffect(() => {
    if (!selectedCategoryId) return;

    setDbSubcategories([]);
    setSelectedSubcategoryId("");
    setItemsBySubcategory({});
    setIsSubcategoriesLoading(true);

    (async () => {
      const { data } = await fetchSubcategories(selectedCategoryId);
      setDbSubcategories(data || []);
      setSelectedSubcategoryId(data?.[0]?.id || "");
      setIsSubcategoriesLoading(false);
    })();
  }, [selectedCategoryId]);


  const currentSubcategories = useMemo(
    () => dbSubcategories,
    [dbSubcategories]
  );

  const selectedSubcategory = useMemo(
    () =>
      currentSubcategories.find(
        (subcategory) => subcategory.id === selectedSubcategoryId
      ) || null,
    [currentSubcategories, selectedSubcategoryId]
  );

  const currentItems = selectedSubcategoryId
    ? itemsBySubcategory[selectedSubcategoryId] || []
    : [];

  /* =========================
     FETCH PRODUCTS
  ========================= */
  useEffect(() => {
    if (!selectedSubcategoryId) return;

    setIsProductsLoading(true);

    (async () => {
      const { data } = await fetchProducts(selectedSubcategoryId);
      console.log("data: ", data)
      setItemsBySubcategory((prev) => ({
        ...prev,
        [selectedSubcategoryId]: normalizeProducts(data)
      }));
      setIsProductsLoading(false);
    })();
  }, [selectedSubcategoryId]);

  useEffect(() => {
    if (!profile || profile.role !== "admin") {
      navigate("/", { replace: true });
    }
  }, [profile, navigate]);

  /* =========================
     ITEM HANDLERS
  ========================= */
  const handleOpenAddItem = () => {
    if (!selectedSubcategoryId) return;
    setEditingItemId(null);
    setItemDraft(blankItemDraft);
    setItemError("");
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (item) => {
    setEditingItemId(item.id);
    setItemDraft({
      name: item.name || "",
      price: item.price || "",
      description: item.description || "",
      availability: item.availability || "in-stock",
      imageData: item.imageData || "",
      imageName: item.imageName || ""
    });
    setItemError("");
    setIsItemModalOpen(true);
  };

  const handleCloseItemModal = () => {
    setIsItemModalOpen(false);
    setEditingItemId(null);
    setItemDraft(blankItemDraft);
    setItemError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveItem = async (event) => {
    event.preventDefault();

    if (!itemDraft.name.trim()) {
      setItemError("Item name is required.");
      return;
    }

    const { data: product, error } = await createProduct({
      name: itemDraft.name.trim(),
      price: itemDraft.price,
      description: itemDraft.description,
      subcategory_id: selectedSubcategoryId
    });

    if (error) {
      setItemError(error.message || "Failed to create product");
      return;
    }

    if (fileInputRef.current?.files?.[0]) {
      await uploadProductImage({
        productId: product.id,
        file: fileInputRef.current.files[0]
      });
    }

    const { data } = await fetchProducts(selectedSubcategoryId);
    setItemsBySubcategory((prev) => ({
      ...prev,
      [selectedSubcategoryId]: normalizeProducts(data)
    }));

    handleCloseItemModal();
  };

  const handleDeleteItem = (itemId) => {
    if (!selectedSubcategoryId) return;
    const shouldDelete = window.confirm("Delete this item? This cannot be undone.");
    if (!shouldDelete) return;
    setItemsBySubcategory((prev) => ({
        ...prev,
        [selectedSubcategoryId]: (prev[selectedSubcategoryId] || []).filter((item) => item.id !== itemId)
    }));
  };

  const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
  });
  const resizeImageDataUrl = (dataUrl, maxDimension) => new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
          const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.floor(image.width * scale));
          canvas.height = Math.max(1, Math.floor(image.height * scale));
          const ctx = canvas.getContext("2d");
          if (ctx) {
              ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          }
          resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      image.onerror = () => resolve(dataUrl);
      image.src = dataUrl;
  });
  const prepareImageData = async (file) => {
      const dataUrl = await readFileAsDataUrl(file);
      if (file.size <= MAX_IMAGE_BYTES) return dataUrl;
      return resizeImageDataUrl(dataUrl, MAX_IMAGE_DIMENSION);
  };
  const handleItemImageUpload = async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      setItemError("");
      try {
          const dataUrl = await prepareImageData(file);
          setItemDraft((prev) => ({
              ...prev,
              imageData: dataUrl,
              imageName: file.name
          }));
      } catch (error) {
          console.error("Image upload failed", error);
          setItemError("Unable to process the image. Try a smaller file.");
      }
  };
  /* =========================
     SUBCATEGORY HANDLERS (RESTORED)
  ========================= */
  const handleOpenAddSubcategory = () => {
    setEditingSubcategoryId(null);
    setSubcategoryDraft(blankSubcategoryDraft);
    setSubcategoryError("");
    setIsSubcategoryModalOpen(true);
  };

  const handleOpenEditSubcategory = (subcategory) => {
    setEditingSubcategoryId(subcategory.id);
    setSubcategoryDraft({
      name: subcategory.name || "",
      description: subcategory.description || "",
      imageData: subcategory.imageData || "",
      imageName: subcategory.imageName || ""
    });
    setSubcategoryError("");
    setIsSubcategoryModalOpen(true);
  };

  const handleCloseSubcategoryModal = () => {
    setIsSubcategoryModalOpen(false);
    setEditingSubcategoryId(null);
    setSubcategoryDraft(blankSubcategoryDraft);
    setSubcategoryError("");
    if (subcategoryFileInputRef.current) {
      subcategoryFileInputRef.current.value = "";
    }
  };


  return (
    <>
      {isProductsLoading && (
        <div className="flex items-center justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
        </div>
      )}

      {!isProductsLoading && currentItems.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-6">
          No products found for this subcategory
        </p>
      )}


      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Admin</p>
              <h1 className="text-2xl font-semibold text-slate-900">Catalog Builder</h1>
            </div>
            <div className="text-sm text-slate-500">Static categories, dynamic subcategories</div>
          </div>
        </header>

        {storageError && (
          <div className="mx-auto max-w-6xl px-4 pt-4">
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {storageError}
            </div>
          </div>
        )}

        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[220px_260px_1fr]">
          <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700">Categories</h2>
            <div className="mt-3 space-y-2">
              {Object.keys(CATEGORY_TO_SUBCATEGORY_TITLES).map((category) => {
                const isActive = category === (selectedCategory === "Plants" ? "Live Plants" : selectedCategory);
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(CATEGORY_SLUG_MAP[category])}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition ${isActive
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                      }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Subcategories</p>
                <h2 className="text-lg font-semibold text-slate-900">{selectedCategory}</h2>
              </div>
              <button
                type="button"
                onClick={handleOpenAddSubcategory}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-900"
              >
                Add
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {currentSubcategories.map((subcategory) => {
                const isActive = subcategory.id === selectedSubcategoryId;
                return (
                  <div
                    key={subcategory.id}
                    className={`flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition ${isActive
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                      }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedSubcategoryId(subcategory.id)}
                      className="flex flex-1 items-center gap-3 text-left"
                    >
                      {subcategory.imageData ? (
                        <img
                          src={subcategory.imageData}
                          alt={subcategory.name}
                          className="h-8 w-8 rounded border border-slate-200 object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded border border-dashed border-slate-200 bg-slate-50" />
                      )}
                      <div>
                        <p className="text-sm font-semibold">{subcategory.name}</p>
                        {subcategory.description && (
                          <p className={`text-xs ${isActive ? "text-slate-200" : "text-slate-400"}`}>
                            {subcategory.description}
                          </p>
                        )}
                      </div>
                    </button>
                    <div className="ml-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditSubcategory(subcategory)}
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${isActive
                          ? "hover:bg-white/10"
                          : "hover:bg-slate-100"
                          }`}
                        aria-label={`Edit ${subcategory.name}`}
                        title="Edit"
                      >
                        <img src={editIcon} alt="" className="h-4 w-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSubcategory(subcategory.id)}
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${isActive
                          ? "hover:bg-white/10"
                          : "hover:bg-rose-50"
                          }`}
                        aria-label={`Delete ${subcategory.name}`}
                        title="Delete"
                      >
                        <img src={deleteIcon} alt="" className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                );
              })}
              {currentSubcategories.length === 0 && (
                <p className="text-sm text-slate-500">No subcategories available.</p>
              )}
            </div>
          </section>

          <section className="space-y-5">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Items</p>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {selectedSubcategory ? selectedSubcategory.name : "Select a subcategory"}
                  </h2>
                  {selectedSubcategory?.description && (
                    <p className="text-xs text-slate-400">{selectedSubcategory.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddItem}
                  disabled={!selectedSubcategoryId}
                  className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Add Item
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">Items list</h3>
                <span className="text-xs text-slate-400">{currentItems.length} items</span>
              </div>

              {currentItems.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">
                  No items yet. Use “Add Item” to create one for this subcategory.
                </p>
              ) : (
                <div className="mt-4 divide-y divide-slate-100">
                  {currentItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.imageData ? (
                          <img
                            src={item.imageData}
                            alt={item.imageName || item.name}
                            className="h-12 w-12 rounded border border-slate-200 object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded border border-dashed border-slate-200 bg-slate-50" />
                        )}
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500">
                            {item.price ? `Price: ${item.price}` : "No price set"}
                            {item.availability === "out-of-stock" ? " · Out of stock" : " · In stock"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleOpenEditItem(item)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-slate-100"
                          aria-label={`Edit ${item.name}`}
                          title="Edit"
                        >
                          <img src={editIcon} alt="" className="h-4 w-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-rose-50"
                          aria-label={`Delete ${item.name}`}
                          title="Delete"
                        >
                          <img src={deleteIcon} alt="" className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {isItemModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-8"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                handleCloseItemModal();
              }
            }}
          >
            <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  {editingItemId ? "Edit Item" : "Add Item"}
                </h3>
                <button
                  type="button"
                  onClick={handleCloseItemModal}
                  className="text-sm font-semibold text-slate-500 hover:text-slate-700"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleSaveItem} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Name</label>
                  <input
                    type="text"
                    value={itemDraft.name}
                    onChange={(e) => setItemDraft((prev) => ({ ...prev, name: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    placeholder="Item name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Price</label>
                  <input
                    type="text"
                    value={itemDraft.price}
                    onChange={(e) => setItemDraft((prev) => ({ ...prev, price: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    placeholder="Price"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Description</label>
                  <textarea
                    rows={4}
                    value={itemDraft.description}
                    onChange={(e) => setItemDraft((prev) => ({ ...prev, description: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    placeholder="Description"
                  />
                </div>
                {editingItemId && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Availability</label>
                    <div className="mt-2 inline-flex w-full rounded-md border border-slate-200 bg-white p-1">
                      <button
                        type="button"
                        onClick={() => setItemDraft((prev) => ({ ...prev, availability: "in-stock" }))}
                        className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${itemDraft.availability === "in-stock"
                          ? "bg-emerald-600 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                          }`}
                        aria-pressed={itemDraft.availability === "in-stock"}
                      >
                        In stock
                      </button>
                      <button
                        type="button"
                        onClick={() => setItemDraft((prev) => ({ ...prev, availability: "out-of-stock" }))}
                        className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${itemDraft.availability === "out-of-stock"
                          ? "bg-rose-600 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                          }`}
                        aria-pressed={itemDraft.availability === "out-of-stock"}
                      >
                        Out of stock
                      </button>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700">Image Upload</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleItemImageUpload}
                    className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  />
                  {itemDraft.imageData && (
                    <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-2">
                      <img
                        src={itemDraft.imageData}
                        alt={itemDraft.imageName || "Preview"}
                        className="h-32 w-full rounded object-cover"
                      />
                    </div>
                  )}
                </div>
                {itemError && <p className="text-sm text-rose-600">{itemError}</p>}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseItemModal}
                    className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isSubcategoryModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-8"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                handleCloseSubcategoryModal();
              }
            }}
          >
            <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  {editingSubcategoryId ? "Edit Subcategory" : "Add Subcategory"}
                </h3>
                <button
                  type="button"
                  onClick={handleCloseSubcategoryModal}
                  className="text-sm font-semibold text-slate-500 hover:text-slate-700"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleSaveSubcategory} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Name</label>
                  <input
                    type="text"
                    value={subcategoryDraft.name}
                    onChange={(e) => setSubcategoryDraft((prev) => ({ ...prev, name: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    placeholder="Subcategory name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Description</label>
                  <textarea
                    rows={4}
                    value={subcategoryDraft.description}
                    onChange={(e) => setSubcategoryDraft((prev) => ({ ...prev, description: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    placeholder="Description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Image Upload</label>
                  <input
                    ref={subcategoryFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleSubcategoryImageUpload}
                    className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  />
                  {subcategoryDraft.imageData && (
                    <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-2">
                      <img
                        src={subcategoryDraft.imageData}
                        alt={subcategoryDraft.imageName || "Preview"}
                        className="h-32 w-full rounded object-cover"
                      />
                    </div>
                  )}
                </div>
                {subcategoryError && <p className="text-sm text-rose-600">{subcategoryError}</p>}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseSubcategoryModal}
                    className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminAddProduct;
