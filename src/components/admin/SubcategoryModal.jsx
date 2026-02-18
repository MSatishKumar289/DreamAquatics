import { useRef } from "react";

const SubcategoryModal = ({
  isOpen,
  onClose,
  editingSubcategoryId,
  subcategoryDraft,
  setSubcategoryDraft,
  subcategoryError,
  handleSaveSubcategory
}) => {
  const descriptionRef = useRef(null);
  if (!isOpen) return null;

  const updateDescription = (nextValue) => {
    setSubcategoryDraft((prev) => ({ ...prev, description: nextValue }));
  };

  const insertDescriptionToken = (prefix, suffix = "", placeholder = "text") => {
    const el = descriptionRef.current;
    const current = subcategoryDraft.description || "";
    if (!el) {
      updateDescription(`${current}${prefix}${placeholder}${suffix}`);
      return;
    }

    const start = el.selectionStart ?? current.length;
    const end = el.selectionEnd ?? current.length;
    const selected = current.slice(start, end);
    const valueToWrap = selected || placeholder;
    const next = `${current.slice(0, start)}${prefix}${valueToWrap}${suffix}${current.slice(end)}`;
    updateDescription(next);

    requestAnimationFrame(() => {
      el.focus();
      const nextCursor = selected
        ? start + prefix.length + valueToWrap.length + suffix.length
        : start + prefix.length + valueToWrap.length;
      el.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const handleDescriptionKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
      event.preventDefault();
      insertDescriptionToken("**", "**");
    }
  };

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
            {editingSubcategoryId ? "Edit Subcategory" : "Add Subcategory"}
          </h3>
          <button
            type="button"
            onClick={onClose}
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
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => insertDescriptionToken("**", "**")}
                className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Bold
              </button>
              <button
                type="button"
                onClick={() => insertDescriptionToken("\n• ", "")}
                className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Bullet
              </button>
              <button
                type="button"
                onClick={() => insertDescriptionToken("\n\n", "")}
                className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Line Break
              </button>
              <button
                type="button"
                onClick={() => insertDescriptionToken("[", "](https://example.com)", "label")}
                className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Link
              </button>
              <span className="text-[11px] text-slate-500">Shortcut: Ctrl/Cmd + B for bold</span>
            </div>
            <textarea
              ref={descriptionRef}
              rows={4}
              value={subcategoryDraft.description}
              onChange={(e) =>
                setSubcategoryDraft((prev) => ({ ...prev, description: e.target.value }))
              }
              onKeyDown={handleDescriptionKeyDown}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="Description"
            />
          </div>

          {subcategoryError && <p className="text-sm text-rose-600">{subcategoryError}</p>}

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
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubcategoryModal;
