import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import edit_ic from "../assets/Icons/edit_ic.png";
import bin_ic from "../assets/Icons/bin_ic.png";
import {
  createProduct,
  uploadProductImage,
  fetchProducts,
  fetchCategories,
  fetchSubcategories,
  upsertProductPrimaryImage,
  updateProduct,
  deleteProduct,
  fetchProductImages,
  deleteStorageFileByPublicUrl,
  deleteProductImageRow,
  createSubcategory,
  updateSubcategory,
  deleteSubcategoryCascade
} from "../lib/catalogApi.js";
import {
  fetchAllOrdersAdmin,
  updateOrderStatusAdmin,
  formatOrderStatus
} from "../lib/ordersApi.js";


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

const AdminAddProduct = ({ profile, authLoading }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const subcategoryFileInputRef = useRef(null);

  /* =========================
     TOAST (MINIMAL + ANIMATED)
  ========================= */
  const getToastPrefix = (type) => (type === "error" ? "✖" : "✅");

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" // "success" | "error"
  });

  const toastTimerRef = useRef(null);

  const showToast = (message, type = "success") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

    setToast({ show: true, message, type });

    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  /* =========================
     CONFIRM POPUP (DELETE + ANIMATED)
  ========================= */
  const [confirmPopup, setConfirmPopup] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "Delete",
    cancelText: "Cancel",
    onConfirm: null
  });

  const openConfirm = ({ title, message, onConfirm }) => {
    setConfirmPopup({
      open: true,
      title,
      message,
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm
    });
  };

  const closeConfirm = () => {
    setConfirmPopup((prev) => ({
      ...prev,
      open: false,
      onConfirm: null
    }));
  };

  const handleConfirmDelete = async () => {
    const fn = confirmPopup.onConfirm;
    closeConfirm();
    if (typeof fn === "function") await fn();
  };

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
  const [isItemImageProcessing, setIsItemImageProcessing] = useState(false);
  const [isSavingItem, setIsSavingItem] = useState(false);

  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [subcategoryDraft, setSubcategoryDraft] = useState(blankSubcategoryDraft);
  const [editingSubcategoryId, setEditingSubcategoryId] = useState(null);
  const [subcategoryError, setSubcategoryError] = useState("");

  const [isSubcategoriesLoading, setIsSubcategoriesLoading] = useState(false);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [itemSearch, setItemSearch] = useState("");
  const [homeMediaDraft, setHomeMediaDraft] = useState({
    videoUrl: "",
    imageOneUrl: "",
    imageTwoUrl: ""
  });
  const [homeMediaError, setHomeMediaError] = useState("");
  const [selectedAdminOrder, setSelectedAdminOrder] = useState(null);
  const [adminView, setAdminView] = useState("catalog");
  const [adminOrders, setAdminOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");


  const loadHomeMediaFromStorage = () => {
    const stored = localStorage.getItem("dream-aquatics-home-media");
    if (!stored) {
      setHomeMediaDraft({
        videoUrl: "",
        imageOneUrl: "",
        imageTwoUrl: ""
      });
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      setHomeMediaDraft({
        videoUrl: parsed.videoUrl || "",
        imageOneUrl: parsed.imageOneUrl || "",
        imageTwoUrl: parsed.imageTwoUrl || ""
      });
    } catch (error) {
      console.error("Failed to parse home media settings", error);
    }
  };

  useEffect(() => {
    loadHomeMediaFromStorage();
  }, []);

  const handleSaveHomeMedia = () => {
    try {
      localStorage.setItem("dream-aquatics-home-media", JSON.stringify(homeMediaDraft));
      setHomeMediaError("");
      showToast("Home media updated", "success");
      window.dispatchEvent(
        new CustomEvent("dreamAquaticsHomeMediaUpdated", { detail: homeMediaDraft })
      );
    } catch (error) {
      console.error("Failed to save home media", error);
      setHomeMediaError("Unable to save home media settings.");
    }
  };

  const handleResetHomeMedia = () => {
    localStorage.removeItem("dream-aquatics-home-media");
    setHomeMediaDraft({
      videoUrl: "",
      imageOneUrl: "",
      imageTwoUrl: ""
    });
    setHomeMediaError("");
    showToast("Home media reset", "success");
  };

  const loadAdminOrders = async () => {
    setOrdersLoading(true);
    setOrdersError("");
  
    const { data, error } = await fetchAllOrdersAdmin();
    if (error) {
      setOrdersError(error.message || "Failed to load orders");
      setAdminOrders([]);
      setOrdersLoading(false);
      return;
    }
  
    setAdminOrders(data || []);
    setOrdersLoading(false);
  };
  

  const handleHomeMediaUpload = (type) => async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setHomeMediaError("");

    try {
      let dataUrl = "";
      if (type === "video") {
        if (file.size > 8 * 1024 * 1024) {
          setHomeMediaError("Video is too large. Please upload a smaller file.");
          return;
        }
        dataUrl = await readFileAsDataUrl(file);
      } else {
        dataUrl = await prepareImageData(file);
      }

      setHomeMediaDraft((prev) => ({
        ...prev,
        ...(type === "video" ? { videoUrl: dataUrl } : null),
        ...(type === "imageOne" ? { imageOneUrl: dataUrl } : null),
        ...(type === "imageTwo" ? { imageTwoUrl: dataUrl } : null)
      }));
    } catch (error) {
      console.error("Failed to upload home media", error);
      setHomeMediaError("Unable to process the file. Try a smaller one.");
    } finally {
      event.target.value = "";
    }
  };

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

  const currentSubcategories = useMemo(() => dbSubcategories, [dbSubcategories]);
  const orderedCategories = useMemo(() => {
    const order = ["Fishes", "Plants", "Accessories", "Tanks"];
    const rank = new Map(order.map((name, index) => [name, index]));
    return [...dbCategories].sort((a, b) => {
      const aRank = rank.has(a.name) ? rank.get(a.name) : Number.MAX_SAFE_INTEGER;
      const bRank = rank.has(b.name) ? rank.get(b.name) : Number.MAX_SAFE_INTEGER;
      if (aRank !== bRank) return aRank - bRank;
      return a.name.localeCompare(b.name);
    });
  }, [dbCategories]);

  const selectedSubcategory = useMemo(
    () =>
      currentSubcategories.find((subcategory) => subcategory.id === selectedSubcategoryId) ||
      null,
    [currentSubcategories, selectedSubcategoryId]
  );

  const currentItems = selectedSubcategoryId
    ? itemsBySubcategory[selectedSubcategoryId] || []
    : [];

  const filteredItems = useMemo(() => {
    const query = itemSearch.trim().toLowerCase();
    if (!query) return currentItems;
    return currentItems.filter((item) => {
      const name = String(item.name || "").toLowerCase();
      const price = String(item.price || "").toLowerCase();
      return name.includes(query) || price.includes(query);
    });
  }, [currentItems, itemSearch]);

  /* =========================
     FETCH PRODUCTS
  ========================= */
  useEffect(() => {
    if (!selectedSubcategoryId) return;

    setIsProductsLoading(true);

    (async () => {
      const { data } = await fetchProducts(selectedSubcategoryId);
      setItemsBySubcategory((prev) => ({
        ...prev,
        [selectedSubcategoryId]: normalizeProducts(data)
      }));
      setIsProductsLoading(false);
    })();
  }, [selectedSubcategoryId]);

  useEffect(() => {
    if (authLoading) return;
    if (!profile || profile.role !== "admin") {
      navigate("/", { replace: true });
    }
  }, [profile, authLoading, navigate]);

  useEffect(() => {
    if (adminView !== "orders") return;
    loadAdminOrders();
  }, [adminView]);
  

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

    const availability = item.stock_count > 0 ? "in-stock" : "out-of-stock";

    setItemDraft({
      name: item.name || "",
      price: item.price || "",
      description: item.description || "",
      availability,
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
    if (isItemImageProcessing || isSavingItem) return;
    setIsSavingItem(true);

    if (!itemDraft.name.trim()) {
      setItemError("Item name is required.");
      setIsSavingItem(false);
      return;
    }

    if (!selectedSubcategoryId) {
      setItemError("Subcategory not selected.");
      setIsSavingItem(false);
      return;
    }

    setItemError("");

    const hasNewImage = !!fileInputRef.current?.files?.[0];
    const stock_count = itemDraft.availability === "out-of-stock" ? 0 : 1;

    if (editingItemId) {
      const { error: updateError } = await updateProduct(editingItemId, {
        name: itemDraft.name.trim(),
        price: itemDraft.price,
        description: itemDraft.description,
        stock_count
      });

      if (updateError) {
        setItemError(updateError.message || "Failed to update product");
        setIsSavingItem(false);
        return;
      }

      if (hasNewImage) {
        const { error: imgErr } = await upsertProductPrimaryImage({
          productId: editingItemId,
          file: fileInputRef.current.files[0]
        });

        if (imgErr) {
          setItemError(imgErr.message || "Image update failed");
          setIsSavingItem(false);
          return;
        }
      }

      showToast("Product updated successfully", "success");
    } else {
      const { data: product, error: createError } = await createProduct({
        name: itemDraft.name.trim(),
        price: itemDraft.price,
        description: itemDraft.description,
        subcategory_id: selectedSubcategoryId
      });

      if (createError) {
        setItemError(createError.message || "Failed to create product");
        setIsSavingItem(false);
        return;
      }

      if (hasNewImage) {
        const { error: imgErr } = await uploadProductImage({
          productId: product.id,
          file: fileInputRef.current.files[0]
        });

        if (imgErr) {
          setItemError(imgErr.message || "Image upload failed");
          setIsSavingItem(false);
          return;
        }
      }

      showToast("Product added successfully", "success");
    }

    const { data } = await fetchProducts(selectedSubcategoryId);
    setItemsBySubcategory((prev) => ({
      ...prev,
      [selectedSubcategoryId]: normalizeProducts(data)
    }));

    handleCloseItemModal();
    setIsSavingItem(false);
  };
  


  const requestDeleteItem = (item) => {
    setPendingDelete({
      type: "item",
      id: item.id,
      name: item.name || "this item"
    });
  };

  const handleDeleteItem = async (itemId) => {
    if (!selectedSubcategoryId) return;
  
    try {
      // 1) get images linked to this product
      const { data: imgs, error: imgFetchErr } = await fetchProductImages(itemId);
      if (imgFetchErr) throw imgFetchErr;
  
      // 2) delete product (this removes product row)
      const { error: delErr } = await deleteProduct(itemId);
      if (delErr) throw delErr;
  
      // 3) cleanup: delete image rows + storage files
      if (imgs?.length) {
        for (const img of imgs) {
          if (img?.url) {
            await deleteStorageFileByPublicUrl(img.url);
          }
          if (img?.id) {
            await deleteProductImageRow(img.id);
          }
        }
      }
  
      // 4) refresh list
      const { data } = await fetchProducts(selectedSubcategoryId);
      setItemsBySubcategory((prev) => ({
        ...prev,
        [selectedSubcategoryId]: normalizeProducts(data)
      }));
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err?.message || "Delete failed");
    }
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const resizeImageDataUrl = (dataUrl, maxDimension) =>
    new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.floor(image.width * scale));
        canvas.height = Math.max(1, Math.floor(image.height * scale));
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
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
    setIsItemImageProcessing(true);
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
    } finally {
      setIsItemImageProcessing(false);
    }
  };

  /* =========================
     SUBCATEGORY HANDLERS
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
    if (subcategoryFileInputRef.current) subcategoryFileInputRef.current.value = "";
  };

  const handleSaveSubcategory = async (event) => {
    event.preventDefault();

    if (!subcategoryDraft.name.trim()) {
      setSubcategoryError("Subcategory name is required.");
      return;
    }

    if (!selectedCategoryId) {
      setSubcategoryError("Category not selected.");
      return;
    }

    setSubcategoryError("");

    const name = subcategoryDraft.name.trim();
    const slug = slugify(name);

    try {
      if (editingSubcategoryId) {
        const { error } = await updateSubcategory(editingSubcategoryId, {
          name,
          slug,
          description: subcategoryDraft.description.trim()
        });

        if (error) {
          setSubcategoryError(error.message || "Failed to update subcategory");
          return;
        }

        showToast("Subcategory updated successfully", "success");
      } else {
        const { data, error } = await createSubcategory({
          name,
          slug,
          description: subcategoryDraft.description.trim(),
          category_id: selectedCategoryId
        });

        if (error) {
          setSubcategoryError(error.message || "Failed to create subcategory");
          return;
        }

        if (data?.id) setSelectedSubcategoryId(data.id);

        showToast("Subcategory added successfully", "success");
      }

      const { data: refreshed, error: refErr } = await fetchSubcategories(selectedCategoryId);
      if (!refErr) setDbSubcategories(refreshed || []);

      handleCloseSubcategoryModal();
    } catch (err) {
      console.error(err);
      setSubcategoryError(err.message || "Subcategory save failed");
    }
  };
  

  // DELETE SubCAtegory
  const requestDeleteSubcategory = (subcategory) => {
    setPendingDelete({
      type: "subcategory",
      id: subcategory.id,
      name: subcategory.name || "this subcategory"
    });
  };

  const handleDeleteSubcategory = async (subcategoryId) => {
    try {
      const { error } = await deleteSubcategoryCascade(subcategoryId);
      if (error) throw error;
  
      // refresh list
      const { data: refreshed } = await fetchSubcategories(selectedCategoryId);
      setDbSubcategories(refreshed || []);
  
      // reset selection
      if (selectedSubcategoryId === subcategoryId) {
        setSelectedSubcategoryId(refreshed?.[0]?.id || "");
      }
  
      // clear products cache (optional but clean)
      setItemsBySubcategory({});
    } catch (err) {
      console.error("Delete subcategory failed:", err);
      alert(err?.message || "Delete failed");
    }
  };

  const handleSubcategoryImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSubcategoryError("");

    try {
      const dataUrl = await prepareImageData(file);

      setSubcategoryDraft((prev) => ({
        ...prev,
        imageData: dataUrl,
        imageName: file.name
      }));
    } catch (error) {
      console.error("Subcategory image upload failed", error);
      setSubcategoryError("Unable to process the image. Try a smaller file.");
    }
  };

  return (
    <>
      {/* ✅ Toast UI (Animated) */}
      {toast.show && (
        <div className="fixed left-1/2 top-4 z-[9999] -translate-x-1/2">
          <div
            className={`animate-[toastIn_220ms_ease-out] rounded-md px-4 py-3 text-center text-sm font-semibold shadow-lg border ${
              toast.type === "success"
                ? "bg-emerald-600 text-white border-emerald-700"
                : "bg-rose-600 text-white border-rose-700"
            }`}
          >
            {`${getToastPrefix(toast.type)} ${toast.message}`}
          </div>

          <style>
            {`
              @keyframes toastIn {
                0% { opacity: 0; transform: translateY(-10px) scale(0.98); }
                100% { opacity: 1; transform: translateY(0) scale(1); }
              }
            `}
          </style>
        </div>
      )}

      {/* ✅ Confirm Popup (Animated) */}
      {confirmPopup.open && (
        <div
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 px-4 animate-[fadeIn_180ms_ease-out]"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeConfirm();
          }}
        >
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl border border-slate-200 animate-[popIn_200ms_ease-out]">
            <h3 className="text-base font-semibold text-slate-900">{confirmPopup.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{confirmPopup.message}</p>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeConfirm}
                className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-800"
              >
                {confirmPopup.cancelText}
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-rose-700"
              >
                {confirmPopup.confirmText}
              </button>
            </div>
          </div>

          <style>
            {`
              @keyframes fadeIn {
                0% { opacity: 0; }
                100% { opacity: 1; }
              }
              @keyframes popIn {
                0% { opacity: 0; transform: translateY(8px) scale(0.96); }
                100% { opacity: 1; transform: translateY(0) scale(1); }
              }
            `}
          </style>
        </div>
      )}

      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Admin</p>
              <h1 className="text-2xl font-semibold text-slate-900">Catalog Builder</h1>
            </div>
          </div>
        </header>

        <div className="container mx-auto grid max-w gap-6 px-4 py-6 md:grid-cols-[220px_260px_1fr]">
          <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700">Categories</h2>
            <div className="mt-3 space-y-2">
              {orderedCategories.map((category) => {
                const isActive = category.id === selectedCategoryId;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setAdminView("catalog");
                      setSelectedCategory(category.name);
                      setSelectedCategoryId(category.id);
                    }}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                    }`}
                  >
                    {category.name}
                  </button>
                );
              })}
              <div className="mt-4 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdminView("live")}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm font-semibold transition ${
                    adminView === "live"
                      ? "bg-blue-600 text-white"
                      : "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  Live update
                </button>
                <button
                  type="button"
                  onClick={() => setAdminView("orders")}
                  className={`mt-3 w-full rounded-md px-3 py-2 text-left text-sm font-semibold transition ${
                    adminView === "orders"
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                  }`}
                >
                  Orders
                </button>
              </div>
            </div>
          </aside>

          {adminView === "catalog" && (
          <div className="contents">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Subcategories</p>
                <h2 className="text-lg font-semibold text-slate-900">{selectedCategory}</h2>
              </div>
              <button
                type="button"
                onClick={handleOpenAddSubcategory}
                className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
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
                    className={`flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition ${
                      isActive
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedSubcategoryId(subcategory.id)}
                      className="flex flex-1 items-center gap-3 text-left"
                    >
                      <div>
                        <p className="text-sm font-semibold">{subcategory.name}</p>
                      </div>
                    </button>
                    <div className="ml-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditSubcategory(subcategory)}
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                          isActive ? "hover:bg-white/10" : "hover:bg-slate-100"
                        }`}
                        aria-label={`Edit ${subcategory.name}`}
                        title="Edit"
                      >
                        <img src={edit_ic} alt="" className="h-6 w-6" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => requestDeleteSubcategory(subcategory)}
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${isActive
                          ? "hover:bg-white/10"
                          : "hover:bg-rose-50"
                          }`}
                        aria-label={`Delete ${subcategory.name}`}
                        title="Delete"
                      >
                        <img src={bin_ic} alt="" className="h-6 w-6" aria-hidden />
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
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddItem}
                  disabled={!selectedSubcategoryId}
                  className="inline-flex min-w-[140px] items-center justify-center rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  Add Item
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-semibold text-slate-700">Items list</h3>
                <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                  <input
                    type="search"
                    value={itemSearch}
                    onChange={(event) => setItemSearch(event.target.value)}
                    placeholder="Search items"
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:max-w-[220px]"
                  />
                  <span className="text-xs text-slate-400">
                    {filteredItems.length} items
                  </span>
                </div>
              </div>

              {filteredItems.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">
                  No items yet. Use “Add Item” to create one for this subcategory.
                </p>
              ) : (
                <div className="mt-4 max-h-[360px] space-y-3 overflow-y-auto pr-1 sm:max-h-[420px] lg:max-h-[520px]">
                  {filteredItems.map((item) => {
                    const count = Number(item.stock_count);
                    const availabilityText = String(item.availability || "").toLowerCase();
                    const isOut = Number.isFinite(count)
                      ? count <= 0
                      : availabilityText === "out-of-stock";
                    const statusLabel = isOut ? "Out of stock" : "In stock";
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between gap-4 rounded-lg px-3 py-3 ${
                          isOut
                            ? "bg-rose-50 text-rose-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
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
                            {` · ${statusLabel}`}
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
                          <img src={edit_ic} alt="" className="h-6 w-6" aria-hidden />
                        </button>

                        <button
                          type="button"
                          onClick={() => requestDeleteItem(item)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-rose-50"
                          aria-label={`Delete ${item.name}`}
                          title="Delete"
                        >
                          <img src={bin_ic} alt="" className="h-6 w-6" aria-hidden />
                        </button>
                      </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
          </div>
          )}

          {adminView === "orders" && (
          <section className="md:col-span-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Orders</p>
                <h2 className="text-lg font-semibold text-slate-900">Recent orders</h2>
              </div>
            </div>

            {ordersLoading ? (
              <p className="mt-4 text-sm text-slate-500">Loading orders...</p>
            ) : ordersError ? (
              <p className="mt-4 text-sm text-rose-600">{ordersError}</p>
            ) : adminOrders.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">No orders received yet.</p>
            ) : (
              <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1 lg:max-h-[520px]">
                {adminOrders.map((order) => {
                  const items = order.order_items || [];
                  const firstItem = items[0];
                  const extraCount = Math.max(items.length - 1, 0);
                  
                  const dateLabel = new Date(order.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                  });
                  

                  return (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => setSelectedAdminOrder(order)}
                      className="w-full rounded-2xl border border-slate-100 bg-white px-4 py-4 text-left shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                            Order {order.order_number || order.id}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-slate-900">
                            {firstItem?.title}
                            {extraCount > 0 ? ` + ${extraCount} more` : ""}
                          </p>
                          <p className="mt-1 text-xs text-slate-600">{dateLabel} · {formatOrderStatus(order.status)}</p>
                        </div>
                        <div className="text-sm font-semibold text-slate-900">
                          Rs. {Number(order.total || 0).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
          )}

          {adminView === "live" && (
            <section className="md:col-span-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Home screen</p>
                  <h2 className="text-lg font-semibold text-slate-900">Live update</h2>
                </div>
              </div>

              <div className="mt-5 grid gap-6 md:grid-cols-[1fr_1fr]">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Video</p>
                    <label className="mt-2 inline-flex w-full cursor-pointer items-center justify-center rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100">
                      Upload video
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleHomeMediaUpload("video")}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-700">Image one</p>
                    <label className="mt-2 inline-flex w-full cursor-pointer items-center justify-center rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100">
                      Upload image one
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleHomeMediaUpload("imageOne")}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-700">Image two</p>
                    <label className="mt-2 inline-flex w-full cursor-pointer items-center justify-center rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100">
                      Upload image two
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleHomeMediaUpload("imageTwo")}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {homeMediaError && (
                    <p className="text-sm text-rose-600">{homeMediaError}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                    <p className="mb-2 font-semibold text-slate-600">Video preview</p>
                    {homeMediaDraft.videoUrl ? (
                      <video
                        src={homeMediaDraft.videoUrl}
                        className="h-36 w-full rounded-md object-cover"
                        muted
                        controls
                      />
                    ) : (
                      <div className="flex h-36 items-center justify-center rounded-md border border-dashed border-slate-200 bg-white">
                        Upload a video to preview.
                      </div>
                    )}
                  </div>

                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                    <p className="mb-2 font-semibold text-slate-600">Image one preview</p>
                    {homeMediaDraft.imageOneUrl ? (
                      <img
                        src={homeMediaDraft.imageOneUrl}
                        alt="Highlight one preview"
                        className="h-28 w-full rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-28 items-center justify-center rounded-md border border-dashed border-slate-200 bg-white">
                        Upload an image to preview.
                      </div>
                    )}
                  </div>

                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                    <p className="mb-2 font-semibold text-slate-600">Image two preview</p>
                    {homeMediaDraft.imageTwoUrl ? (
                      <img
                        src={homeMediaDraft.imageTwoUrl}
                        alt="Highlight two preview"
                        className="h-28 w-full rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-28 items-center justify-center rounded-md border border-dashed border-slate-200 bg-white">
                        Upload an image to preview.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={loadHomeMediaFromStorage}
                  className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveHomeMedia}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </section>
          )}
        </div>

        {/* =========================
           ITEM MODAL (UNCHANGED)
        ========================= */}
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
                        className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${
                          itemDraft.availability === "in-stock"
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
                        className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${
                          itemDraft.availability === "out-of-stock"
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
                    className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isItemImageProcessing || isSavingItem}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================
           SUBCATEGORY MODAL (UNCHANGED)
        ========================= */}
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
                    onChange={(e) =>
                      setSubcategoryDraft((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    placeholder="Description"
                  />
                </div>

                {subcategoryError && <p className="text-sm text-rose-600">{subcategoryError}</p>}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseSubcategoryModal}
                    className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {pendingDelete && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={(event) => {
              if (event.target === event.currentTarget) setPendingDelete(null);
            }}
          >
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-xl">
              <h3 className="text-lg font-semibold text-slate-900">
                Confirm delete
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Delete {pendingDelete.name}? This cannot be undone.
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setPendingDelete(null)}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (pendingDelete.type === "subcategory") {
                      await handleDeleteSubcategory(pendingDelete.id);
                    } else {
                      await handleDeleteItem(pendingDelete.id);
                    }
                    setPendingDelete(null);
                  }}
                  className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedAdminOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedAdminOrder(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="relative border-b border-dashed border-slate-200 px-5 py-4 text-center">
              <p className="flex items-baseline justify-center text-blue-600">
                <span className="text-base font-bold tracking-[0.2em]">D</span>
                <span className="-ml-0.5 text-xs font-semibold tracking-[0.2em]">REAM</span>
                <span className="ml-0.5 text-base font-bold tracking-[0.2em]">A</span>
                <span className="-ml-0.5 text-xs font-semibold tracking-[0.2em]">QUATICS</span>
              </p>

              <h2 className="mt-2 text-1xl font-semibold text-slate-900">Order receipt</h2>

              <p className="mt-1 text-xs text-slate-600">
                Status:{" "}
                <span className="font-semibold">
                  {formatOrderStatus(selectedAdminOrder.status)}
                </span>
              </p>

              <button
                type="button"
                onClick={() => setSelectedAdminOrder(null)}
                className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white shadow-sm hover:bg-red-700"
                aria-label="Close order receipt"
              >
                X
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[75vh] overflow-y-auto px-5 py-4 text-sm text-slate-700">
              {/* Placed on */}
              <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-3">
                <span>Placed on</span>
                <span className="font-semibold text-slate-900">
                  {new Date(selectedAdminOrder.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                  })}
                </span>
              </div>

              {/* ✅ Status dropdown */}
              <div className="mt-4 flex items-center justify-between border-b border-dashed border-slate-200 pb-3">
                <span>Status</span>

                <select
                  value={selectedAdminOrder.status}
                  onChange={async (e) => {
                    const nextStatus = e.target.value;

                    // optimistic UI update
                    setSelectedAdminOrder((prev) => ({ ...prev, status: nextStatus }));
                    setAdminOrders((prev) =>
                      prev.map((o) =>
                        o.id === selectedAdminOrder.id ? { ...o, status: nextStatus } : o
                      )
                    );

                    const { error } = await updateOrderStatusAdmin(
                      selectedAdminOrder.id,
                      nextStatus
                    );

                    if (error) {
                      showToast(error.message || "Failed to update status", "error");
                      loadAdminOrders(); // reload correct status from DB
                    } else {
                      showToast("Order status updated", "success");
                    }
                  }}
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                >
                  <option value="awaiting_approval">Awaiting Approval</option>
                  <option value="in_transit">Confirmed (In Transit)</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Items */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
                  <span>Item</span>
                  <span>Total</span>
                </div>

                <div className="mt-3 space-y-3 border-b border-dashed border-slate-200 pb-4">
                  {(selectedAdminOrder.order_items || []).map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-500">
                          Qty {item.qty} - Rs. {Number(item.price).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="font-semibold text-slate-900">
                        Rs.{" "}
                        {Number(item.line_total || item.qty * item.price).toLocaleString(
                          "en-IN"
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="mt-4 border-b border-dashed border-slate-200 pb-4">
                <h3 className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Delivery Address
                </h3>

                <div className="mt-2 space-y-1 text-sm">
                  <p className="font-semibold text-slate-900">
                    {selectedAdminOrder.customer_name}
                  </p>
                  {selectedAdminOrder.customer_email && <p>{selectedAdminOrder.customer_email}</p>}
                  <p>{selectedAdminOrder.customer_mobile}</p>
                  <p>{selectedAdminOrder.address_line1}</p>
                  {selectedAdminOrder.address_line2 && <p>{selectedAdminOrder.address_line2}</p>}
                  {selectedAdminOrder.landmark && (
                    <p>Landmark: {selectedAdminOrder.landmark}</p>
                  )}
                  <p>
                    {selectedAdminOrder.city} - {selectedAdminOrder.pincode}
                  </p>
                </div>
              </div>

              {/* Totals */}
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    Rs. {Number(selectedAdminOrder.subtotal || 0).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Standard shipping</span>
                  <span className="font-semibold text-slate-900">
                    Rs.{" "}
                    {Number(selectedAdminOrder.shipping_fee || 0).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-3 font-semibold text-slate-900">
                  <span>Total</span>
                  <span>
                    Rs. {Number(selectedAdminOrder.total || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Receipt tear strip */}
            <div className="h-4 w-full bg-white">
              <svg className="h-full w-full" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path
                  d="M0 2 L5 8 L10 2 L15 8 L20 2 L25 8 L30 2 L35 8 L40 2 L45 8 L50 2 L55 8 L60 2 L65 8 L70 2 L75 8 L80 2 L85 8 L90 2 L95 8 L100 2"
                  stroke="#e2e8f0"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default AdminAddProduct;
