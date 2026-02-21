const ItemsPanel = ({
  selectedSubcategory,
  selectedSubcategoryId,
  handleOpenAddItem,
  itemSearch,
  setItemSearch,
  filteredItems,
  bestsellingIdSet,
  essentialIdSet,
  handleOpenEditItem,
  requestDeleteItem,
  editIcon,
  deleteIcon
}) => (
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
          No items yet. Use â€œAdd Itemâ€ to create one for this subcategory.
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
            const isBestSeller = bestsellingIdSet?.has?.(item.id);
            const isEssential = essentialIdSet?.has?.(item.id);
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between gap-4 rounded-lg px-3 py-3 ${
                  isOut ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
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
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                      {isBestSeller && (
                        <span className="inline-flex items-center rounded-full border border-amber-300/70 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-700">
                          BestSeller
                        </span>
                      )}
                      {isEssential && (
                        <span className="inline-flex items-center rounded-full border border-blue-300/70 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700">
                          Essential
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500">
                      {item.price ? `Price: ${item.price}` : "No price set"}
                      {` Â· ${statusLabel}`}
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
                    <img src={editIcon} alt="" className="h-6 w-6" aria-hidden />
                  </button>

                  <button
                    type="button"
                    onClick={() => requestDeleteItem(item)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-rose-50"
                    aria-label={`Delete ${item.name}`}
                    title="Delete"
                  >
                    <img src={deleteIcon} alt="" className="h-6 w-6" aria-hidden />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </section>
);

export default ItemsPanel;
