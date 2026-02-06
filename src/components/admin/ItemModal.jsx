const ItemModal = ({
  isOpen,
  onClose,
  editingItemId,
  itemDraft,
  setItemDraft,
  fileInputRef,
  handleItemImageUpload,
  itemError,
  isItemImageProcessing,
  isSavingItem,
  handleSaveItem
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-8"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
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
            onClick={onClose}
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
                  onClick={() =>
                    setItemDraft((prev) => ({ ...prev, availability: "out-of-stock" }))
                  }
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
              onClick={onClose}
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
  );
};

export default ItemModal;
