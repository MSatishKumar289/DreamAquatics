const AdminConfirmPopup = ({ confirmPopup, closeConfirm, handleConfirmDelete }) => {
  if (!confirmPopup?.open) return null;

  return (
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
  );
};

export default AdminConfirmPopup;
