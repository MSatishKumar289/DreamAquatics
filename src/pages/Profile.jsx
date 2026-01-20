import { useMemo, useState } from 'react';
import AddressForm from '../components/AddressForm';
import { useProfile } from '../context/ProfileContext';

const Profile = () => {
  const { addresses, addAddress, updateAddress, removeAddress, setDefaultAddress } = useProfile();
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const canAddMore = addresses.length < 2;

  const handleAdd = (payload) => {
    const result = addAddress(payload);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError('');
    setShowForm(false);
  };

  const handleUpdate = (payload) => {
    updateAddress(editing.id, payload);
    setEditing(null);
  };

  const activeFormValue = useMemo(() => {
    if (editing) return editing;
    return null;
  }, [editing]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Profile</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Saved Addresses</h1>
          <p className="mt-2 text-sm text-slate-600">
            Add up to two delivery addresses and set a default one.
          </p>
        </header>

        <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Address book</h2>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
              disabled={!canAddMore}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              Add address
            </button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {addresses.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600 md:col-span-2">
                No addresses saved yet.
              </div>
            )}

            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`rounded-xl border px-4 py-4 shadow-sm ${
                  addr.isDefault
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      {addr.label}
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-900">{addr.name}</p>
                    {addr.email && <p className="text-sm text-slate-600">{addr.email}</p>}
                    <p className="text-sm text-slate-600">{addr.phone}</p>
                  </div>
                  {addr.isDefault && (
                    <span className="rounded-full bg-emerald-600 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                      Default
                    </span>
                  )}
                </div>
                <div className="mt-3 text-sm text-slate-600">
                  <p>{addr.line1}</p>
                  {addr.line2 && <p>{addr.line2}</p>}
                  {addr.landmark && <p>Landmark: {addr.landmark}</p>}
                  <p>
                    {addr.city} - {addr.pincode}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {!addr.isDefault && (
                    <button
                      type="button"
                      onClick={() => setDefaultAddress(addr.id)}
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                    >
                      Set default
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditing(addr)}
                    className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAddress(addr.id)}
                    className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {(showForm || editing) && (
          <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              {editing ? 'Edit address' : 'Add new address'}
            </h2>
            <div className="mt-4">
              <AddressForm
                initialValue={activeFormValue}
                onCancel={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
                onSave={editing ? handleUpdate : handleAdd}
              />
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default Profile;
