import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AddressForm from '../components/AddressForm';
import { useProfile } from '../context/ProfileContext';
import edit_ic from '../assets/Icons/edit_ic.png';
import bin_ic from '../assets/Icons/bin_ic.png';

const Profile = () => {
  const { addresses, addAddress, updateAddress, removeAddress, setDefaultAddress } = useProfile();
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [activeTab, setActiveTab] = useState('addresses');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const location = useLocation();

  const orders = useMemo(
    () => [
      {
        id: 'DA-1001',
        placedAt: '2025-01-12',
        status: 'Pending',
        subtotal: 1350,
        shipping: 100,
        total: 1450,
        address: {
          name: 'Satish',
          email: 'msatish289kumar@gmail.com',
          phone: '3213123123',
          line1: '33D, Gandhi Puram, Cross Street',
          line2: 'Dharapuram',
          landmark: 'Near Periyakaaliamman Kovil',
          city: 'Dharapuram',
          pincode: '638656'
        },
        items: [
          { id: 'itm-1', title: 'Full Moon Betta', qty: 2, price: 400 },
          { id: 'itm-2', title: 'Albino Oscar', qty: 1, price: 650 },
          { id: 'itm-3', title: 'Channa Andrao', qty: 1, price: 300 }
        ]
      }
    ],
    []
  );

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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'orders') {
      setActiveTab('orders');
    }
  }, [location.search]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Profile</p>
          {activeTab === 'addresses' ? (
            <>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Saved Addresses</h1>
              <p className="mt-2 text-sm text-slate-600">
                Add up to two delivery addresses and set a default one.
              </p>
            </>
          ) : (
            <>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Your Orders</h1>
              <p className="mt-2 text-sm text-slate-600">
                Track your recent purchases and order history here.
              </p>
            </>
          )}
        </header>

        <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mb-4 inline-flex w-full overflow-hidden rounded-full border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('addresses')}
              className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                activeTab === 'addresses'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Addresses
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                activeTab === 'orders'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Orders
            </button>
          </div>

          {activeTab === 'addresses' ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">Address book</h2>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setShowForm(true);
                  }}
                  disabled={!canAddMore}
                  className="w-full max-w-xs rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 sm:w-auto"
                >
                  Add address
                </button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {addresses.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600 md:col-span-2">
                    No addresses saved yet.
                  </div>
                )}

                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`flex h-full w-full flex-col rounded-xl border px-4 py-3 shadow-sm ${
                      addr.isDefault
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900">{addr.name}</p>
                        {addr.email && <p className="text-xs text-slate-600 break-words">{addr.email}</p>}
                        <p className="text-xs text-slate-600">{addr.phone}</p>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditing(addr)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                          aria-label={`Edit ${addr.name} address`}
                          title="Edit"
                        >
                          <img src={edit_ic} alt="" className="h-4 w-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(addr)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                          aria-label={`Delete ${addr.name} address`}
                          title="Delete"
                        >
                          <img src={bin_ic} alt="" className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-slate-600">
                      <p>{addr.line1}</p>
                      {addr.line2 && <p>{addr.line2}</p>}
                      {addr.landmark && <p>Landmark: {addr.landmark}</p>}
                      <p>
                        {addr.city} - {addr.pincode}
                      </p>
                    </div>
                    <div className="mt-auto flex min-h-[40px] items-center justify-center">
                      {addr.isDefault ? (
                        <span className="rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                          Default
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDefaultAddress(addr.id)}
                          className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                        >
                          Set default
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : orders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
              No orders yet. Your future orders will appear here.
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const firstItem = order.items[0];
                const extraCount = Math.max(order.items.length - 1, 0);
                const dateLabel = new Date(order.placedAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                });

                return (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => setSelectedOrder(order)}
                    className="w-full rounded-2xl border border-slate-100 bg-white px-4 py-4 text-left shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                          Order {order.id}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">
                          {firstItem?.title}
                          {extraCount > 0 ? ` + ${extraCount} more` : ''}
                        </p>
                        <p className="mt-1 text-xs text-slate-600">
                          {dateLabel} · {order.status}
                        </p>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        ₹{order.total.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
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

      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) setPendingDelete(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              Remove address?
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Delete address for {pendingDelete.name}?
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
                onClick={() => {
                  removeAddress(pendingDelete.id);
                  setPendingDelete(null);
                }}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedOrder(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="relative border-b border-dashed border-slate-200 px-5 py-4 text-center">
              <p className="flex items-baseline justify-center text-blue-600">
                <span className="text-base font-bold tracking-[0.2em]">D</span>
                <span className="-ml-0.5 text-xs font-semibold tracking-[0.2em]">REAM</span>
                <span className="ml-0.5 text-base font-bold tracking-[0.2em]">A</span>
                <span className="-ml-0.5 text-xs font-semibold tracking-[0.2em]">QUATICS</span>
              </p>
              <h2 className="mt-2 text-1xl font-semibold text-slate-900">
                Order Details
              </h2>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white shadow-sm hover:bg-red-700"
                aria-label="Close order details"
              >
                X
              </button>
            </div>
            <div className="max-h-[75vh] overflow-y-auto px-5 py-4 text-sm text-slate-700">
              <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-3">
                <span>Placed on</span>
                <span className="font-semibold text-slate-900">
                  {new Date(selectedOrder.placedAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
                  <span>Item</span>
                  <span>Total</span>
                </div>
                <div className="mt-3 space-y-3 border-b border-dashed border-slate-200 pb-4">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-500">
                          Qty {item.qty} · ₹{item.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="font-semibold text-slate-900">
                        ₹{(item.qty * item.price).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 border-b border-dashed border-slate-200 pb-4">
                <h3 className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Delivery Address
                </h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p className="font-semibold text-slate-900">
                    {selectedOrder.address.name}
                  </p>
                  <p>{selectedOrder.address.email}</p>
                  <p>{selectedOrder.address.phone}</p>
                  <p>{selectedOrder.address.line1}</p>
                  {selectedOrder.address.line2 && <p>{selectedOrder.address.line2}</p>}
                  {selectedOrder.address.landmark && (
                    <p>Landmark: {selectedOrder.address.landmark}</p>
                  )}
                  <p>
                    {selectedOrder.address.city} - {selectedOrder.address.pincode}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    ₹{selectedOrder.subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Standard shipping</span>
                  <span className="font-semibold text-slate-900">
                    ₹{selectedOrder.shipping.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-3 font-semibold text-slate-900">
                  <span>Total</span>
                  <span>₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                </div>
                <p className="pt-2 text-xs text-slate-500">
                  Payment details will be shared via WhatsApp after you place the order.
                </p>
              </div>
            </div>
            <div className="h-4 w-full bg-white">
              <svg
                className="h-full w-full"
                viewBox="0 0 100 10"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 2 L5 8 L10 2 L15 8 L20 2 L25 8 L30 2 L35 8 L40 2 L45 8 L50 2 L55 8 L60 2 L65 8 L70 2 L75 8 L80 2 L85 8 L90 2 L95 8 L100 2"
                  stroke="#e2e8f0"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Profile;
