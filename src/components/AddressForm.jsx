import { useMemo, useState } from 'react';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AddressForm = ({ initialValue, onSave, onCancel }) => {
  const [form, setForm] = useState({
    label: initialValue?.label || '',
    name: initialValue?.name || '',
    email: initialValue?.email || '',
    phone: initialValue?.phone || '',
    line1: initialValue?.line1 || '',
    line2: initialValue?.line2 || '',
    city: initialValue?.city || '',
    pincode: initialValue?.pincode || '',
    landmark: initialValue?.landmark || ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleDigitsOnly = (field, maxLength) => (event) => {
    const value = event.target.value.replace(/\D/g, '').slice(0, maxLength);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validationErrors = useMemo(() => {
    const next = {};
    if (!form.label.trim()) next.label = 'Label is required.';
    if (!form.name.trim()) next.name = 'Name is required.';
    if (form.email.trim() && !emailRegex.test(form.email)) {
      next.email = 'Enter a valid email.';
    }
    if (!form.phone.trim()) {
      next.phone = 'Mobile number is required.';
    } else if (form.phone.length !== 10) {
      next.phone = 'Mobile number must be 10 digits.';
    }
    if (!form.line1.trim()) next.line1 = 'Address Line 1 is required.';
    if (!form.city.trim()) next.city = 'City is required.';
    if (!form.pincode.trim()) {
      next.pincode = 'Pincode is required.';
    } else if (form.pincode.length !== 6) {
      next.pincode = 'Pincode must be 6 digits.';
    }
    return next;
  }, [form]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    onSave?.(form);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">
          Label *
          <input
            type="text"
            value={form.label}
            onChange={handleChange('label')}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          {errors.label && <span className="mt-1 block text-xs text-red-600">{errors.label}</span>}
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Name *
          <input
            type="text"
            value={form.name}
            onChange={handleChange('name')}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          {errors.name && <span className="mt-1 block text-xs text-red-600">{errors.name}</span>}
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">
          Email
          <input
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          {errors.email && <span className="mt-1 block text-xs text-red-600">{errors.email}</span>}
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Mobile *
          <input
            type="text"
            inputMode="numeric"
            pattern="\d*"
            value={form.phone}
            onChange={handleDigitsOnly('phone', 10)}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          {errors.phone && <span className="mt-1 block text-xs text-red-600">{errors.phone}</span>}
        </label>
      </div>

      <label className="text-sm font-semibold text-slate-700">
        Address Line 1 *
        <input
          type="text"
          value={form.line1}
          onChange={handleChange('line1')}
          className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        {errors.line1 && <span className="mt-1 block text-xs text-red-600">{errors.line1}</span>}
      </label>

      <label className="text-sm font-semibold text-slate-700">
        Address Line 2
        <input
          type="text"
          value={form.line2}
          onChange={handleChange('line2')}
          className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-sm font-semibold text-slate-700">
          City *
          <input
            type="text"
            value={form.city}
            onChange={handleChange('city')}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          {errors.city && <span className="mt-1 block text-xs text-red-600">{errors.city}</span>}
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Pincode *
          <input
            type="text"
            inputMode="numeric"
            pattern="\d*"
            value={form.pincode}
            onChange={handleDigitsOnly('pincode', 6)}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          {errors.pincode && <span className="mt-1 block text-xs text-red-600">{errors.pincode}</span>}
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Landmark
          <input
            type="text"
            value={form.landmark}
            onChange={handleChange('landmark')}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-100 sm:w-auto"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:w-auto"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default AddressForm;
