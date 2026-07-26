import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Wallet,
  CheckCircle,
  Truck,
  ShieldCheck,
  CreditCard,
  Plus,
  ArrowUpRight,
  Clock,
  Sparkles,
  Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ProductItem, ProductOrder, WalletTransaction } from '../types';
import {
  createProductOrder,
  subscribeToUserOrders,
  addWalletTransaction,
  subscribeToWalletTransactions
} from '../services/firestoreService';

export const ShopAndWallet: React.FC = () => {
  const { userProfile } = useAuth();
  const [orders, setOrders] = useState<ProductOrder[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [shippingAddress, setShippingAddress] = useState<string>(
    userProfile?.address ? `${userProfile.address}, ${userProfile.city}` : '123 Cyber City, MG Road, New Delhi 110001'
  );
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(1500);

  const products: ProductItem[] = [
    {
      id: 'P1',
      name: 'Emergency PVC Smart ID Card',
      category: 'Cards',
      price: 199,
      description: 'Durable waterproof PVC credit card size emergency ID with high contrast QR print.',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
      badge: 'Best Seller',
    },
    {
      id: 'P2',
      name: 'Reflective Bike Helmet QR Sticker',
      category: 'Stickers',
      price: 149,
      description: '3M reflective waterproof vinyl QR sticker designed for bike helmets & visors.',
      imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80',
      badge: 'Biker Special',
    },
    {
      id: 'P3',
      name: 'Car Windshield Emergency QR Tag',
      category: 'Vehicle',
      price: 249,
      description: 'UV-proof static cling vehicle sticker for car windshields & dashboards.',
      imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80',
      badge: 'Popular',
    },
    {
      id: 'P4',
      name: 'Stainless Steel Pet Collar QR Tag',
      category: 'Pet Safety',
      price: 299,
      description: 'Laser etched scratchproof stainless steel pet collar tag for dogs & cats.',
      imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'P5',
      name: 'Smart QR Metal Keychain Tag',
      category: 'Accessories',
      price: 199,
      description: 'Heavy duty zinc alloy emergency keychain with QR identity laser print.',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    },
  ];

  useEffect(() => {
    if (!userProfile) return;

    const unsubOrders = subscribeToUserOrders(userProfile.uid, (data) => setOrders(data));
    const unsubTrans = subscribeToWalletTransactions(userProfile.uid, (data) => {
      setTransactions(data);
      // Calculate wallet balance from credits and debits
      const balance = data.reduce((acc, curr) => {
        return curr.type === 'DEBIT' ? acc - curr.amount : acc + curr.amount;
      }, 1500);
      setWalletBalance(Math.max(0, balance));
    });

    return () => {
      unsubOrders();
      unsubTrans();
    };
  }, [userProfile]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !selectedProduct) return;

    const totalAmount = selectedProduct.price * quantity;
    const orderId = `ORD_${Date.now()}`;

    const newOrder: ProductOrder = {
      id: orderId,
      userId: userProfile.uid,
      productName: selectedProduct.name,
      quantity,
      totalAmount,
      status: 'DISPATCHED',
      shippingAddress,
      createdAt: new Date().toISOString(),
    };

    const newTrans: WalletTransaction = {
      id: `TR_${Date.now()}`,
      userId: userProfile.uid,
      amount: totalAmount,
      type: 'DEBIT',
      description: `Order #${orderId} - ${selectedProduct.name} (x${quantity})`,
      createdAt: new Date().toISOString(),
    };

    try {
      await createProductOrder(newOrder);
      await addWalletTransaction(newTrans);
      setOrderSuccess(`Order #${orderId} placed successfully! Stored in Firestore database.`);
      setSelectedProduct(null);
      setTimeout(() => setOrderSuccess(null), 5000);
    } catch (err) {
      console.error('Place Order Error:', err);
    }
  };

  const handleTopupWallet = async (amount: number) => {
    if (!userProfile) return;
    const newTrans: WalletTransaction = {
      id: `TR_${Date.now()}`,
      userId: userProfile.uid,
      amount,
      type: 'CREDIT',
      description: `Wallet Top-up via Razorpay/UPI`,
      createdAt: new Date().toISOString(),
    };
    try {
      await addWalletTransaction(newTrans);
    } catch (err) {
      console.error('Topup Error:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <ShoppingBag className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-extrabold">Emergency QR Products & Wallet</h2>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
            Order official physical PVC smart cards, reflective helmet stickers, car windshield QR tags, and pet tags. Manage your wallet balance & subscription plans.
          </p>
        </div>

        {/* Wallet Balance Widget */}
        <div className="bg-slate-800 border border-slate-700 px-5 py-3 rounded-2xl flex items-center space-x-4 shadow-lg shrink-0">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Wallet Balance</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">₹{walletBalance.toLocaleString()}</span>
          </div>
          <button
            onClick={() => handleTopupWallet(500)}
            className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1"
            title="Add ₹500 Funds"
          >
            <Plus className="w-4 h-4" />
            <span>+ ₹500</span>
          </button>
        </div>
      </div>

      {orderSuccess && (
        <div className="bg-emerald-600 text-white p-4 rounded-xl font-bold text-sm shadow-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>{orderSuccess}</span>
          </div>
          <button onClick={() => setOrderSuccess(null)} className="text-xs underline">Dismiss</button>
        </div>
      )}

      {/* Order Modal / Form */}
      {selectedProduct && (
        <form
          onSubmit={handlePlaceOrder}
          className="bg-slate-900 border-2 border-red-600 rounded-2xl p-6 sm:p-8 text-white shadow-2xl space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-lg text-white">Checkout: {selectedProduct.name}</h3>
            <span className="text-lg font-black text-red-500 font-mono">₹{selectedProduct.price * quantity}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Quantity</label>
              <input
                type="number"
                min="1"
                max="10"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Shipping Address</label>
              <input
                type="text"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-600/30"
            >
              Confirm Order & Pay From Wallet
            </button>
          </div>
        </form>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
          >
            <div>
              <div className="relative h-40 bg-slate-800 rounded-xl overflow-hidden mb-4">
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                {p.badge && (
                  <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    {p.badge}
                  </span>
                )}
              </div>

              <span className="text-[10px] uppercase font-mono text-slate-400 font-bold">{p.category}</span>
              <h4 className="font-bold text-base text-white mt-1">{p.name}</h4>
              <p className="text-xs text-slate-400 mt-1">{p.description}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xl font-black text-red-500 font-mono">₹{p.price}</span>
              <button
                onClick={() => setSelectedProduct(p)}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition"
              >
                Order Product
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Real-time Order & Wallet History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        {/* Firestore Orders List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-4">
            <Package className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-base">Your Product Orders (Firestore)</h3>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto text-xs">
            {orders.length === 0 ? (
              <p className="text-slate-500 text-center py-6">No product orders placed yet</p>
            ) : (
              orders.map((o) => (
                <div key={o.id} className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">{o.productName} (x{o.quantity})</div>
                    <div className="text-slate-400 text-[11px] font-mono">{o.id} • {new Date(o.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-red-400 block">₹{o.totalAmount}</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 font-bold px-1.5 py-0.2 rounded border border-emerald-500/30">
                      {o.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Wallet Transactions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-4">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">Wallet Ledger History</h3>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto text-xs">
            {transactions.length === 0 ? (
              <p className="text-slate-500 text-center py-6">No wallet transactions recorded yet</p>
            ) : (
              transactions.map((t) => (
                <div key={t.id} className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-200">{t.description}</div>
                    <div className="text-slate-400 text-[11px] font-mono">{new Date(t.createdAt).toLocaleTimeString()}</div>
                  </div>
                  <span className={`font-mono font-bold text-sm ${t.type === 'CREDIT' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {t.type === 'CREDIT' ? '+' : '-'}₹{t.amount}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
