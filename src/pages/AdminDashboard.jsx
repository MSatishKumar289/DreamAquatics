import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'dream-aquatics-admin-dashboard-v3';

const CATEGORIES = [
  { label: 'Fishes', value: 'Fishes' },
  { label: 'Live Plants', value: 'Live Plants' },
  { label: 'Accessories', value: 'Accessories' },
  { label: 'Tank', value: 'Tank' },
];

const createDefaultData = () => ({
  Fishes: {
    subcategories: {
      'Neon Tetra': {
        image: '',
        items: [
          {
            id: 'fish-1',
            name: 'Item 1',
            price: '120',
            description: 'Small schooling fish with vivid color.',
            image: '',
          },
        ],
      },
    },
  },
  'Live Plants': {
    subcategories: {
      'Java Fern': {
        image: '',
        items: [
          {
            id: 'plant-1',
            name: 'Item 1',
            price: '200',
            description: 'Low light, easy maintenance.',
            image: '',
          },
        ],
      },
    },
  },
  Accessories: {
    subcategories: {
      Filters: {
        image: '',
        items: [
          {
            id: 'accessory-1',
            name: 'Item 1',
            price: '850',
            description: 'Silent flow filter.',
            image: '',
          },
        ],
      },
    },
  },
  Tank: {
    subcategories: {
      Glass: {
        image: '',
        items: [
          {
            id: 'tank-1',
            name: 'Item 1',
            price: '3400',
            description: 'Premium clear glass tank.',
            image: '',
          },
        ],
      },
    },
  },
});

const normalizeData = (raw) => {
  if (!raw || typeof raw !== 'object') return createDefaultData();
  const hasSubcategories = Object.values(raw).every(
    (entry) => entry && typeof entry === 'object' && entry.subcategories
  );
  if (!hasSubcategories) return createDefaultData();
  const normalized = {};
  Object.entries(raw).forEach(([category, categoryValue]) => {
    const subcategories = categoryValue.subcategories || {};
    const normalizedSubcategories = {};
    Object.entries(subcategories).forEach(([name, value]) => {
      if (Array.isArray(value)) {
        normalizedSubcategories[name] = {
          image: '',
          items: value.map((item) => ({
            id: item.id,
            name: item.name || '',
            price: item.price || '',
            description: item.description || '',
            image: item.image || '',
          })),
        };
      } else {
        normalizedSubcategories[name] = {
          image: value.image || '',
          items: (value.items || []).map((item) => ({
            id: item.id,
            name: item.name || '',
            price: item.price || '',
            description: item.description || '',
            image: item.image || '',
          })),
        };
      }
    });
    normalized[category] = { subcategories: normalizedSubcategories };
  });
  return normalized;
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const AdminDashboard = () => {
  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return normalizeData(raw ? JSON.parse(raw) : null);
    } catch (error) {
      console.warn('Failed to load admin dashboard data', error);
      return createDefaultData();
    }
  });
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].value);
  const subcategories = useMemo(() => {
    const entry = data[activeCategory];
    return entry ? Object.keys(entry.subcategories || {}) : [];
  }, [data, activeCategory]);
  const [activeSubcategory, setActiveSubcategory] = useState(subcategories[0] || '');
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
  });
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    if (!subcategories.includes(activeSubcategory)) {
      setActiveSubcategory(subcategories[0] || '');
    }
  }, [subcategories, activeSubcategory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const items = useMemo(() => {
    if (!activeSubcategory) return [];
    return data[activeCategory]?.subcategories?.[activeSubcategory]?.items || [];
  }, [data, activeCategory, activeSubcategory]);

  const activeSubcategoryImage =
    data[activeCategory]?.subcategories?.[activeSubcategory]?.image || '';

  const handleAddSubcategory = () => {
    const name = window.prompt('Enter subcategory name');
    if (!name || !name.trim()) {
      return;
    }
    const trimmedName = name.trim();
    setData((prev) => {
      const entry = prev[activeCategory] || { subcategories: {} };
      if (entry.subcategories[trimmedName]) {
        return prev;
      }
      return {
        ...prev,
        [activeCategory]: {
          subcategories: {
            ...entry.subcategories,
            [trimmedName]: {
              image: '',
              items: [],
            },
          },
        },
      };
    });
    setActiveSubcategory(trimmedName);
  };

  const handleDeleteSubcategory = (name) => {
    if (!window.confirm(`Delete "${name}" and all its items?`)) {
      return;
    }
    setData((prev) => {
      const entry = prev[activeCategory] || { subcategories: {} };
      const updatedSubcategories = { ...entry.subcategories };
      delete updatedSubcategories[name];
      return {
        ...prev,
        [activeCategory]: {
          subcategories: updatedSubcategories,
        },
      };
    });
  };

  const handleAddItem = () => {
    if (!activeSubcategory) {
      window.alert('Select or add a subcategory first.');
      return;
    }
    if (!newItem.name.trim() || !newItem.price.trim() || !newItem.description.trim()) {
      window.alert('Name, price, and description are required.');
      return;
    }
    setData((prev) => {
      const entry = prev[activeCategory] || { subcategories: {} };
      const subcategory = entry.subcategories[activeSubcategory] || {
        image: '',
        items: [],
      };
      const list = subcategory.items || [];
      return {
        ...prev,
        [activeCategory]: {
          subcategories: {
            ...entry.subcategories,
            [activeSubcategory]: {
              ...subcategory,
              items: [
                ...list,
                {
                  id: `${activeCategory}-${activeSubcategory}-${Date.now()}`,
                  name: newItem.name.trim(),
                  price: newItem.price.trim(),
                  description: newItem.description.trim(),
                  image: newItem.image || '',
                },
              ],
            },
          },
        },
      };
    });
    setNewItem({
      name: '',
      price: '',
      description: '',
      image: '',
    });
  };

  const handleStartEditItem = (item) => {
    setEditingItem({ ...item });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const handleSaveEditItem = () => {
    if (!editingItem) return;
    if (
      !editingItem.name?.trim() ||
      !editingItem.price?.trim() ||
      !editingItem.description?.trim()
    ) {
      window.alert('Name, price, and description are required.');
      return;
    }
    setData((prev) => {
      const entry = prev[activeCategory] || { subcategories: {} };
      const subcategory = entry.subcategories[activeSubcategory] || {
        image: '',
        items: [],
      };
      const list = subcategory.items || [];
      return {
        ...prev,
        [activeCategory]: {
          subcategories: {
            ...entry.subcategories,
            [activeSubcategory]: {
              ...subcategory,
              items: list.map((entryItem) =>
                entryItem.id === editingItem.id
                  ? {
                      ...entryItem,
                      name: editingItem.name.trim(),
                      price: editingItem.price.trim(),
                      description: editingItem.description.trim(),
                      image: editingItem.image || '',
                    }
                  : entryItem
              ),
            },
          },
        },
      };
    });
    setEditingItem(null);
  };

  const handleDeleteItem = (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) {
      return;
    }
    setData((prev) => {
      const entry = prev[activeCategory] || { subcategories: {} };
      const subcategory = entry.subcategories[activeSubcategory] || {
        image: '',
        items: [],
      };
      const list = subcategory.items || [];
      return {
        ...prev,
        [activeCategory]: {
          subcategories: {
            ...entry.subcategories,
            [activeSubcategory]: {
              ...subcategory,
              items: list.filter((entryItem) => entryItem.id !== item.id),
            },
          },
        },
      };
    });
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#f6f1e8]">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-amber-200/50 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-24 h-64 w-64 rounded-full bg-sky-200/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-rose-200/40 blur-3xl" />

      <div className="container mx-auto px-4 py-10">
        <div className="mb-8 flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
            Admin workspace
          </p>
          <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl">
            Categories - Subcategories - Items
          </h1>
          <p className="text-sm text-slate-600 md:text-base">
            Categories are static. Subcategories are dynamic. Each item includes name,
            price, description, and options.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_260px_1fr]">
          <aside className="rounded-[26px] border border-slate-200/70 bg-white/70 p-5 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Categories</h2>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                Static
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {CATEGORIES.map((category) => {
                const isActive = category.value === activeCategory;
                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setActiveCategory(category.value)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-amber-300 ${
                      isActive
                        ? 'border-amber-200 bg-amber-50 text-amber-800 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-amber-200 hover:bg-amber-50/50'
                    }`}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-5 rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-xs text-slate-500">
              Select a category to load its subcategories.
            </div>
          </aside>

          <aside className="rounded-[26px] border border-slate-200/70 bg-white/75 p-5 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Subcategory</h2>
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                  Dynamic
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddSubcategory}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white shadow transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-amber-300"
              >
                + Add
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {subcategories.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 px-3 py-4 text-xs text-slate-500">
                  No subcategories yet. Tap "Add" to create one.
                </div>
              )}
              {subcategories.map((name) => {
                const subcategoryImage =
                  data[activeCategory]?.subcategories?.[name]?.image || '';
                const isActive = name === activeSubcategory;
                return (
                  <div
                    key={name}
                    className={`flex items-center justify-between rounded-2xl border px-3 py-2 text-left text-sm font-semibold transition ${
                      isActive
                        ? 'border-sky-200 bg-sky-50 text-sky-800'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50/60'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveSubcategory(name)}
                      className="flex flex-1 items-center gap-2 text-left"
                    >
                      <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-xs font-semibold uppercase text-slate-500">
                        {subcategoryImage ? (
                          <img
                            src={subcategoryImage}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          name.slice(0, 1)
                        )}
                      </span>
                      {name}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubcategory(name)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                      aria-label={`Delete ${name}`}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                Subcategory image
              </p>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-[80px] w-[80px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  {activeSubcategoryImage ? (
                    <img
                      src={activeSubcategoryImage}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                      No image
                    </div>
                  )}
                </div>
                <div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:bg-slate-100">
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={!activeSubcategory}
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file || !activeSubcategory) return;
                        const image = await readFileAsDataUrl(file);
                        setData((prev) => {
                          const entry = prev[activeCategory] || { subcategories: {} };
                          const subcategory = entry.subcategories[activeSubcategory] || {
                            image: '',
                            items: [],
                          };
                          return {
                            ...prev,
                            [activeCategory]: {
                              subcategories: {
                                ...entry.subcategories,
                                [activeSubcategory]: {
                                  ...subcategory,
                                  image,
                                },
                              },
                            },
                          };
                        });
                        event.target.value = '';
                      }}
                    />
                  </label>
                  <p className="mt-1 text-[11px] text-slate-400">
                    PNG or JPG, stored locally for now.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <div className="rounded-[26px] border border-slate-200/70 bg-white/85 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.1)] backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Items under
                </p>
                <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
                  {activeSubcategory || 'Select a subcategory'}
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Add new item
                </p>
                <div className="mt-3 grid gap-3 md:grid-cols-[1fr_140px]">
                  <input
                    type="text"
                    placeholder="Item name"
                    value={newItem.name}
                    onChange={(event) =>
                      setNewItem((prev) => ({ ...prev, name: event.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                  <input
                    type="text"
                    placeholder="Price"
                    value={newItem.price}
                    onChange={(event) =>
                      setNewItem((prev) => ({ ...prev, price: event.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                </div>
                <textarea
                  rows={3}
                  placeholder="Description"
                  value={newItem.description}
                  onChange={(event) =>
                    setNewItem((prev) => ({ ...prev, description: event.target.value }))
                  }
                  className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-[80px] w-[80px] overflow-hidden rounded-xl border border-slate-200 bg-white">
                      {newItem.image ? (
                        <img
                          src={newItem.image}
                          alt=""
                          className="h-full w-full object-cover"
                          style={{ width: 80, height: 80 }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                          Image
                        </div>
                      )}
                    </div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:bg-slate-100">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          const image = await readFileAsDataUrl(file);
                          setNewItem((prev) => ({ ...prev, image }));
                          event.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:ring-offset-2"
                  >
                    Save item
                  </button>
                </div>
              </div>

              {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                  Items will appear here once you add them to the selected subcategory.
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
                  >
                    {editingItem && editingItem.id === item.id ? (
                      <div className="space-y-3">
                        <div className="grid gap-3 md:grid-cols-[1fr_140px]">
                          <input
                            type="text"
                            value={editingItem.name}
                            onChange={(event) =>
                              setEditingItem((prev) => ({ ...prev, name: event.target.value }))
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
                          />
                          <input
                            type="text"
                            value={editingItem.price}
                            onChange={(event) =>
                              setEditingItem((prev) => ({ ...prev, price: event.target.value }))
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
                          />
                        </div>
                        <textarea
                          rows={3}
                          value={editingItem.description}
                          onChange={(event) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              description: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
                        />
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="h-[80px] w-[80px] overflow-hidden rounded-xl border border-slate-200 bg-white">
                              {editingItem.image ? (
                                <img
                                  src={editingItem.image}
                                  alt=""
                                  className="h-full w-full object-cover"
                                  style={{ width: 80, height: 80 }}
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                                  Image
                                </div>
                              )}
                            </div>
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:bg-slate-100">
                              Upload
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (event) => {
                                  const file = event.target.files?.[0];
                                  if (!file) return;
                                  const image = await readFileAsDataUrl(file);
                                  setEditingItem((prev) => ({ ...prev, image }));
                                  event.target.value = '';
                                }}
                              />
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:bg-slate-100"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveEditItem}
                              className="inline-flex items-center justify-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700 transition hover:bg-sky-100"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-[80px] w-[80px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt=""
                                  className="h-full w-full object-cover"
                                  style={{ width: 80, height: 80 }}
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                                  No image
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                                Name
                              </p>
                              <p className="text-base font-semibold text-slate-900">
                                {item.name}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                              Price
                            </p>
                            <p className="text-base font-semibold text-slate-900">
                              {item.price}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                            Description
                          </p>
                          <p className="text-sm text-slate-600">
                            {item.description}
                          </p>
                        </div>
                        <div className="mt-4 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartEditItem(item)}
                            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-200"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item)}
                            className="inline-flex items-center justify-center rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-200"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-4 text-sm text-slate-600">
              Items are stored locally for now. Keep the structure ready to sync with the
              Supabase database when you connect the integration.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;



