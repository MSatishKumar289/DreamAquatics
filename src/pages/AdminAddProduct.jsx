import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import { fetchHomeMedia, upsertHomeMedia } from "../lib/homeMediaApi.js";
import {
  fetchAllOrdersAdmin,
  normalizeAdminOrders,
  updateOrderStatusAdmin,
  formatOrderStatus
} from "../lib/ordersApi.js";
import AdminToast from "../components/admin/AdminToast.jsx";
import AdminConfirmPopup from "../components/admin/AdminConfirmPopup.jsx";
import AdminSidebar from "../components/admin/AdminSidebar.jsx";
import SubcategoryPanel from "../components/admin/SubcategoryPanel.jsx";
import ItemsPanel from "../components/admin/ItemsPanel.jsx";
import OrdersPanel from "../components/admin/OrdersPanel.jsx";
import LiveUpdatePanel from "../components/admin/LiveUpdatePanel.jsx";
import ItemModal from "../components/admin/ItemModal.jsx";
import SubcategoryModal from "../components/admin/SubcategoryModal.jsx";
import PendingDeleteModal from "../components/admin/PendingDeleteModal.jsx";
import OrderReceiptModal from "../components/admin/OrderReceiptModal.jsx";


const MAX_IMAGE_BYTES = 300 * 1024;
const MAX_IMAGE_DIMENSION = 720;
const MAX_VIDEO_SECONDS = 31;

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

const AdminAddProduct = ({
  profile,
  authLoading,
  onUpdateOrderStatus,
  onUpdateOrderFulfillment
}) => {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [subcategorySearch, setSubcategorySearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [homeMediaDraft, setHomeMediaDraft] = useState({
    videoUrl: "",
    imageOneUrl: "",
    imageTwoUrl: ""
  });
  const [homeMediaSaved, setHomeMediaSaved] = useState({
    videoUrl: "",
    videoPath: "",
    imageOneUrl: "",
    imageOnePath: "",
    imageTwoUrl: "",
    imageTwoPath: ""
  });
  const [homeMediaFiles, setHomeMediaFiles] = useState({
    video: null,
    imageOne: null,
    imageTwo: null
  });
  const [homeMediaError, setHomeMediaError] = useState("");
  const [isHomeMediaSaving, setIsHomeMediaSaving] = useState(false);
  const [selectedAdminOrder, setSelectedAdminOrder] = useState(null);
  const [adminView, setAdminView] = useState("catalog");
  const [adminOrders, setAdminOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  const [adminOrderFilter, setAdminOrderFilter] = useState("all");
  const [adminOrderSearch, setAdminOrderSearch] = useState("");
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [pendingFulfillment, setPendingFulfillment] = useState({});
  const [selectedOrderStatusDraft, setSelectedOrderStatusDraft] = useState("");

  const loadHomeMediaFromDb = async () => {
    setHomeMediaError("");
    const { data, error } = await fetchHomeMedia();
    if (error) {
      console.error("Failed to load home media", error);
      setHomeMediaError("Unable to load home media settings.");
      return;
    }

    const saved = {
      videoUrl: data?.video_url || "",
      videoPath: data?.video_path || "",
      imageOneUrl: data?.image_one_url || "",
      imageOnePath: data?.image_one_path || "",
      imageTwoUrl: data?.image_two_url || "",
      imageTwoPath: data?.image_two_path || ""
    };

    setHomeMediaSaved(saved);
    setHomeMediaDraft({
      videoUrl: saved.videoUrl,
      imageOneUrl: saved.imageOneUrl,
      imageTwoUrl: saved.imageTwoUrl
    });
    setHomeMediaFiles({ video: null, imageOne: null, imageTwo: null });
  };

  useEffect(() => {
    loadHomeMediaFromDb();
  }, []);

  const handleSaveHomeMedia = async () => {
    if (isHomeMediaSaving) return;
    setIsHomeMediaSaving(true);
    setHomeMediaError("");
    try {
      const { data, error } = await upsertHomeMedia({
        current: homeMediaSaved,
        videoFile: homeMediaFiles.video,
        imageOneFile: homeMediaFiles.imageOne,
        imageTwoFile: homeMediaFiles.imageTwo
      });

      if (error) {
        setHomeMediaError(error.message || "Unable to save home media settings.");
        return;
      }

      const saved = {
        videoUrl: data?.video_url || "",
        videoPath: data?.video_path || "",
        imageOneUrl: data?.image_one_url || "",
        imageOnePath: data?.image_one_path || "",
        imageTwoUrl: data?.image_two_url || "",
        imageTwoPath: data?.image_two_path || ""
      };

      setHomeMediaSaved(saved);
      setHomeMediaDraft({
        videoUrl: saved.videoUrl,
        imageOneUrl: saved.imageOneUrl,
        imageTwoUrl: saved.imageTwoUrl
      });
      setHomeMediaFiles({ video: null, imageOne: null, imageTwo: null });
      showToast("Home media updated", "success");
      window.dispatchEvent(
        new CustomEvent("dreamAquaticsHomeMediaUpdated", {
          detail: {
            videoUrl: saved.videoUrl,
            imageOneUrl: saved.imageOneUrl,
            imageTwoUrl: saved.imageTwoUrl
          }
        })
      );
    } catch (error) {
      console.error("Failed to save home media", error);
      setHomeMediaError("Unable to save home media settings.");
    } finally {
      setIsHomeMediaSaving(false);
    }
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
  
    setAdminOrders(normalizeAdminOrders(data || []));
    setOrdersLoading(false);
  };
  
  const getOrderStatusKey = (order) => {
    const state = order.status || "awaiting_approval";
    if (state === "cancelled") return "cancelled";
    if (state !== "accepted") return state;
    return order.fulfillment || "accepted";
  };

  const getOrderStatusLabel = (order) => {
    const state = order.status || "awaiting_approval";
    if (state === "awaiting_approval") {
      return { text: "Awaiting Approval", cls: "bg-slate-50 text-slate-600 border-slate-200" };
    }
    if (state === "accepted") {
      return { text: "Order Confirmed", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    }
    if (state === "in_transit") {
      return { text: "In Transit", cls: "bg-amber-50 text-amber-700 border-amber-200" };
    }
    if (state === "completed") {
      return { text: "Completed", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    }
    if (state === "cancelled") {
      return { text: "Rejected", cls: "bg-rose-50 text-rose-700 border-rose-200" };
    }
    return null;
  };

  const handleQuickOrderStatusUpdate = async (orderId, nextStatus) => {
    setAdminOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: nextStatus } : order
      )
    );

    const { error } = await updateOrderStatusAdmin(orderId, nextStatus);
    if (error) {
      showToast(error.message || "Failed to update order status", "error");
      loadAdminOrders();
      return;
    }
    showToast("Order status updated", "success");
    window.dispatchEvent(new Event("adminOrdersUpdated"));
  };

  const handleReceiptOrderStatusSave = async (nextStatus) => {
    if (!selectedAdminOrder) return;

    const { error } = await updateOrderStatusAdmin(selectedAdminOrder.id, nextStatus);
    if (error) {
      showToast(error.message || "Failed to update status", "error");
      loadAdminOrders();
      return;
    }

    setSelectedAdminOrder((prev) => ({ ...prev, status: nextStatus }));
    setAdminOrders((prev) =>
      prev.map((order) =>
        order.id === selectedAdminOrder.id ? { ...order, status: nextStatus } : order
      )
    );
    showToast("Order status updated", "success");
    window.dispatchEvent(new Event("adminOrdersUpdated"));
  };


  const adminOrderCounts = useMemo(() => {
    const counts = {
      all: adminOrders.length,
      awaiting_approval: 0,
      accepted: 0,
      in_transit: 0,
      completed: 0,
      cancelled: 0,
    };
    adminOrders.forEach((order) => {
      const key = getOrderStatusKey(order);
      if (counts[key] !== undefined) counts[key] += 1;
    });
    return counts;
  }, [adminOrders]);

  const filteredAdminOrders = useMemo(() => {
    const search = adminOrderSearch.trim().toLowerCase();
    const filtered = adminOrders.filter((order) => {
      if (search) {
        const orderId = String(order.id || "").toLowerCase();
        const orderNumber = String(order.order_number || "").toLowerCase();
        if (!orderId.includes(search) && !orderNumber.includes(search)) {
          return false;
        }
      }
      if (adminOrderFilter === "all") return true;
      return getOrderStatusKey(order) === adminOrderFilter;
    });

    return filtered.sort((a, b) => {
      const statusA = getOrderStatusKey(a);
      const statusB = getOrderStatusKey(b);
      if (statusA === "awaiting_approval" && statusB !== "awaiting_approval") return -1;
      if (statusA !== "awaiting_approval" && statusB === "awaiting_approval") return 1;
      return new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime();
    });
  }, [adminOrders, adminOrderFilter, adminOrderSearch]);

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
        const duration = await getVideoDurationSeconds(file);
        if (duration > MAX_VIDEO_SECONDS) {
          setHomeMediaError(
            `Video is too long (${Math.round(duration)}s). Please upload a video up to ${MAX_VIDEO_SECONDS}s.`
          );
          return;
        }
        dataUrl = await readFileAsDataUrl(file);
      } else {
        dataUrl = await readFileAsDataUrl(file);
      }

      setHomeMediaDraft((prev) => ({
        ...prev,
        ...(type === "video" ? { videoUrl: dataUrl } : null),
        ...(type === "imageOne" ? { imageOneUrl: dataUrl } : null),
        ...(type === "imageTwo" ? { imageTwoUrl: dataUrl } : null)
      }));
      setHomeMediaFiles((prev) => ({
        ...prev,
        ...(type === "video" ? { video: file } : null),
        ...(type === "imageOne" ? { imageOne: file } : null),
        ...(type === "imageTwo" ? { imageTwo: file } : null)
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
  const filteredSubcategories = useMemo(() => {
    const query = subcategorySearch.trim().toLowerCase();
    if (!query) return currentSubcategories;
    return currentSubcategories.filter((subcategory) =>
      String(subcategory?.name || "").toLowerCase().includes(query)
    );
  }, [currentSubcategories, subcategorySearch]);
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
    if (!profile) return;
    if (profile.role !== "admin") {
      navigate("/", { replace: true });
    }
  }, [profile, authLoading, navigate]);

  useEffect(() => {
    if (adminView !== "orders") return;
    loadAdminOrders();
  }, [adminView]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get("orderId");
    if (!orderId) return;
    setAdminView("orders");
  }, [location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get("orderId");
    if (!orderId) return;
    if (!adminOrders.length) return;

    const targetOrder = adminOrders.find((order) => order.id === orderId);
    if (!targetOrder) return;

    setSelectedAdminOrder(targetOrder);
    setSelectedOrderStatusDraft(targetOrder.status || "awaiting_approval");
    navigate("/admin/add-product", { replace: true });
  }, [location.search, adminOrders]);
  

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

  const getVideoDurationSeconds = (file) =>
    new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const objectUrl = URL.createObjectURL(file);
      const cleanup = () => URL.revokeObjectURL(objectUrl);
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        const duration = Number(video.duration) || 0;
        cleanup();
        resolve(duration);
      };
      video.onerror = () => {
        cleanup();
        reject(new Error("Unable to read video metadata"));
      };
      video.src = objectUrl;
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
      <AdminToast toast={toast} getToastPrefix={getToastPrefix} />
      <AdminConfirmPopup
        confirmPopup={confirmPopup}
        closeConfirm={closeConfirm}
        handleConfirmDelete={handleConfirmDelete}
      />

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
          <AdminSidebar
            orderedCategories={orderedCategories}
            selectedCategoryId={selectedCategoryId}
            setAdminView={setAdminView}
            setSelectedCategory={setSelectedCategory}
            setSelectedCategoryId={setSelectedCategoryId}
            adminView={adminView}
          />

          {adminView === "catalog" && (
          <div className="contents">
            <SubcategoryPanel
              selectedCategory={selectedCategory}
              handleOpenAddSubcategory={handleOpenAddSubcategory}
              subcategorySearch={subcategorySearch}
              setSubcategorySearch={setSubcategorySearch}
              filteredSubcategories={filteredSubcategories}
              selectedSubcategoryId={selectedSubcategoryId}
              setSelectedSubcategoryId={setSelectedSubcategoryId}
              handleOpenEditSubcategory={handleOpenEditSubcategory}
              requestDeleteSubcategory={requestDeleteSubcategory}
              editIcon={edit_ic}
              deleteIcon={bin_ic}
            />

            <ItemsPanel
              selectedSubcategory={selectedSubcategory}
              selectedSubcategoryId={selectedSubcategoryId}
              handleOpenAddItem={handleOpenAddItem}
              itemSearch={itemSearch}
              setItemSearch={setItemSearch}
              filteredItems={filteredItems}
              handleOpenEditItem={handleOpenEditItem}
              requestDeleteItem={requestDeleteItem}
              editIcon={edit_ic}
              deleteIcon={bin_ic}
            />
          </div>
          )}
          {adminView === "orders" && (
            <OrdersPanel
              adminOrders={adminOrders}
              filteredAdminOrders={filteredAdminOrders}
              adminOrderFilter={adminOrderFilter}
              setAdminOrderFilter={setAdminOrderFilter}
              adminOrderSearch={adminOrderSearch}
              setAdminOrderSearch={setAdminOrderSearch}
              adminOrderCounts={adminOrderCounts}
              ordersLoading={ordersLoading}
              ordersError={ordersError}
              handleQuickOrderStatusUpdate={handleQuickOrderStatusUpdate}
              getOrderStatusLabel={getOrderStatusLabel}
              formatOrderStatus={formatOrderStatus}
              setSelectedAdminOrder={setSelectedAdminOrder}
              setSelectedOrderStatusDraft={setSelectedOrderStatusDraft}
            />
          )}
          {adminView === "live" && (
            <LiveUpdatePanel
              handleHomeMediaUpload={handleHomeMediaUpload}
              homeMediaError={homeMediaError}
              homeMediaDraft={homeMediaDraft}
              loadHomeMediaFromDb={loadHomeMediaFromDb}
              handleSaveHomeMedia={handleSaveHomeMedia}
              isHomeMediaSaving={isHomeMediaSaving}
            />
          )}
        </div>
      </div>

        {/* =========================
           ITEM MODAL (UNCHANGED)
        ========================= */}
        <ItemModal
          isOpen={isItemModalOpen}
          onClose={handleCloseItemModal}
          editingItemId={editingItemId}
          itemDraft={itemDraft}
          setItemDraft={setItemDraft}
          fileInputRef={fileInputRef}
          handleItemImageUpload={handleItemImageUpload}
          itemError={itemError}
          isItemImageProcessing={isItemImageProcessing}
          isSavingItem={isSavingItem}
          handleSaveItem={handleSaveItem}
        />
        {/* =========================
           SUBCATEGORY MODAL (UNCHANGED)
        ========================= */}
        <SubcategoryModal
          isOpen={isSubcategoryModalOpen}
          onClose={handleCloseSubcategoryModal}
          editingSubcategoryId={editingSubcategoryId}
          subcategoryDraft={subcategoryDraft}
          setSubcategoryDraft={setSubcategoryDraft}
          subcategoryError={subcategoryError}
          handleSaveSubcategory={handleSaveSubcategory}
        />
        <PendingDeleteModal
          pendingDelete={pendingDelete}
          setPendingDelete={setPendingDelete}
          handleDeleteSubcategory={handleDeleteSubcategory}
          handleDeleteItem={handleDeleteItem}
        />
        <OrderReceiptModal
          selectedAdminOrder={selectedAdminOrder}
          setSelectedAdminOrder={setSelectedAdminOrder}
          selectedOrderStatusDraft={selectedOrderStatusDraft}
          setSelectedOrderStatusDraft={setSelectedOrderStatusDraft}
          getOrderStatusLabel={getOrderStatusLabel}
          onSaveOrderStatus={handleReceiptOrderStatusSave}
        />
    </>
  );
};

export default AdminAddProduct;


