const AdminSidebar = ({
  orderedCategories,
  selectedCategoryId,
  setAdminView,
  setSelectedCategory,
  setSelectedCategoryId,
  adminView
}) => (
  // Display-only mapping; underlying DB category names remain unchanged.
  <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <h2 className="text-sm font-semibold text-slate-700">Categories</h2>
    <div className="mt-3 space-y-2">
      {orderedCategories.map((category) => {
        const isActive = category.id === selectedCategoryId;
        const displayCategoryName =
          category.name === "Accessories"
            ? "Tanks & Accessories"
            : category.name === "Tanks"
              ? "Fish Food & Medicines"
              : category.name;

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
            {displayCategoryName}
          </button>
        );
      })}
      <div className="mt-4 border-t border-slate-100 pt-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Admin Tools
        </h3>
        <button
          type="button"
          onClick={() => setAdminView("live")}
          className={`mt-3 w-full rounded-md px-3 py-2 text-left text-sm font-semibold transition ${
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
);

export default AdminSidebar;
