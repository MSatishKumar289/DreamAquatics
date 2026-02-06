const AdminToast = ({ toast, getToastPrefix }) => {
  if (!toast?.show) return null;

  return (
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
  );
};

export default AdminToast;
