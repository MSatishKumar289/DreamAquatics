const PendingDeleteModal = ({
  pendingDelete,
  setPendingDelete,
  handleDeleteSubcategory,
  handleDeleteItem
}) => {
  if (!pendingDelete) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) setPendingDelete(null);
      }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">Confirm delete</h3>
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
  );
};

export default PendingDeleteModal;
