const SubcategoryPanel = ({
  selectedCategory,
  handleOpenAddSubcategory,
  subcategorySearch,
  setSubcategorySearch,
  filteredSubcategories,
  selectedSubcategoryId,
  setSelectedSubcategoryId,
  handleOpenEditSubcategory,
  requestDeleteSubcategory,
  editIcon,
  deleteIcon
}) => {
  const displayCategoryName =
    selectedCategory === "Accessories"
      ? "Tanks & Accessories"
      : selectedCategory === "Tanks"
        ? "Fish Food & Medicines"
        : selectedCategory;

  return (
  <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Subcategories</p>
        <h2 className="text-lg font-semibold text-slate-900">{displayCategoryName}</h2>
      </div>
      <button
        type="button"
        onClick={handleOpenAddSubcategory}
        className="rounded-md border border-blue-600 bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
      >
        Add
      </button>
    </div>

    <div className="mt-4 space-y-2">
      <input
        type="search"
        value={subcategorySearch}
        onChange={(event) => setSubcategorySearch(event.target.value)}
        placeholder="Search subcategories"
        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      <span className="text-xs text-slate-400">
        {filteredSubcategories.length} subcategories
      </span>
    </div>

    <div className="mt-3 max-h-[420px] space-y-2 overflow-y-auto pr-1 sm:max-h-[520px]">
      {filteredSubcategories.map((subcategory) => {
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
                <img src={editIcon} alt="" className="h-6 w-6" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => requestDeleteSubcategory(subcategory)}
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                  isActive ? "hover:bg-white/10" : "hover:bg-rose-50"
                }`}
                aria-label={`Delete ${subcategory.name}`}
                title="Delete"
              >
                <img src={deleteIcon} alt="" className="h-6 w-6" aria-hidden />
              </button>
            </div>
          </div>
        );
      })}
      {filteredSubcategories.length === 0 && (
        <p className="text-sm text-slate-500">No subcategories available.</p>
      )}
    </div>
  </section>
  );
};

export default SubcategoryPanel;
