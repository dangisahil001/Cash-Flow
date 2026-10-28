import DashboardLayout from '../layouts/DashboardLayout';
import { ShoppingCart, Store, CheckCircle2, Image as ImageIcon, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { AxiosError } from 'axios';

export default function CustomerCatalog() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuying, setIsBuying] = useState<any | null>(null);
  
  // Buy Form State
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    fetchLinkedVendors();
  }, []);

  const fetchLinkedVendors = async () => {
    try {
      const res = await api.get('/customers/my-vendors');
      setVendors(res.data);
      if (res.data.length > 0) {
        setSelectedVendor(res.data[0]._id);
        fetchProducts(res.data[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch vendors', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async (vendorId: string) => {
    try {
      const res = await api.get(`/products/${vendorId}`);
      setProducts(res.data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    }
  };

  const handleVendorSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVendor(e.target.value);
    fetchProducts(e.target.value);
  };

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBuying) return;

    try {
      await api.post('/transactions/buy', {
        vendorId: selectedVendor,
        amount: isBuying.price * buyQuantity,
        notes: `Bought ${buyQuantity}x ${isBuying.name}`,
        dueDate: dueDate || undefined,
        products: [{ productId: isBuying._id, quantity: buyQuantity, price: isBuying.price }]
      });
      
      alert(`Successfully requested to buy ${isBuying.name}! The vendor will approve this credit transaction.`);
      setIsBuying(null);
      setBuyQuantity(1);
      setDueDate('');
    } catch (err) {
      if (err instanceof AxiosError) {
        alert(err.response?.data?.message || 'Failed to complete purchase');
      } else {
        alert('An unexpected error occurred');
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary-900">Vendor Catalog</h1>
        <p className="text-secondary-500">Buy items on credit from your linked vendors.</p>
      </div>
      
      {isLoading ? (
        <div className="card p-8 text-center text-secondary-500 animate-pulse">
          Loading catalog...
        </div>
      ) : vendors.length === 0 ? (
        <div className="card p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
            <Store className="w-8 h-8 text-secondary-400" />
          </div>
          <h3 className="text-lg font-bold text-secondary-900 mb-2">No Vendors Linked</h3>
          <p className="text-secondary-500 mb-6">You need to link with a vendor before you can view their catalog.</p>
        </div>
      ) : (
        <>
          <div className="card p-6 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="bg-primary-100 p-2 rounded text-primary-600">
                <Store className="w-5 h-5" />
              </div>
              <div className="flex-1 md:w-64">
                <label className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-1 block">
                  Select Vendor
                </label>
                <select 
                  className="w-full bg-transparent font-medium text-secondary-900 focus:outline-none"
                  value={selectedVendor}
                  onChange={handleVendorSelect}
                >
                  {vendors.map(v => (
                    <option key={v._id} value={v._id}>{v.businessName || v.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="card p-12 text-center flex flex-col items-center">
              <ShoppingCart className="w-12 h-12 text-secondary-300 mb-4" />
              <h3 className="text-lg font-bold text-secondary-900">No Products Found</h3>
              <p className="text-secondary-500">This vendor hasn't added any items to their catalog yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product._id} className="card overflow-hidden hover:shadow-lg transition-all flex flex-col">
                  <div className="h-48 bg-secondary-100 relative group">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-secondary-400">
                        <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                        <span className="text-sm font-medium">No Image</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-bold text-secondary-900 shadow-sm">
                      {product.category}
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-secondary-900 text-lg leading-tight mb-1">{product.name}</h3>
                    <p className="text-2xl font-black text-primary-600 mb-2">₹{product.price}</p>
                    {product.description && (
                      <p className="text-sm text-secondary-500 line-clamp-2 mb-4">{product.description}</p>
                    )}
                    <button 
                      onClick={() => setIsBuying(product)}
                      className="btn btn-primary w-full justify-center mt-auto shadow-sm hover:shadow-md"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" /> Buy on Credit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Buy Modal */}
      {isBuying && (
        <div className="fixed inset-0 bg-secondary-900/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-secondary-900 mb-6 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-primary-600" /> Complete Purchase
            </h2>
            
            <div className="bg-secondary-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-secondary-900">{isBuying.name}</span>
                <span className="font-black text-primary-600">₹{isBuying.price}</span>
              </div>
              <p className="text-sm text-secondary-500">{vendors.find(v => v._id === selectedVendor)?.businessName}</p>
            </div>

            <form onSubmit={handleBuy} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Quantity</label>
                <input 
                  type="number" 
                  min="1"
                  max={isBuying.stock}
                  required
                  className="input px-4 py-2 border w-full"
                  value={buyQuantity}
                  onChange={(e) => setBuyQuantity(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Expected Payment Date (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-secondary-400" />
                  </div>
                  <input 
                    type="date"
                    className="input pl-10 w-full"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <p className="text-xs text-secondary-500 mt-1">When do you plan to settle this credit amount?</p>
              </div>

              <div className="border-t border-secondary-200 pt-4 mt-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold text-secondary-900">Total Amount:</span>
                  <span className="text-2xl font-black text-primary-600">₹{isBuying.price * buyQuantity}</span>
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsBuying(null);
                      setDueDate('');
                      setBuyQuantity(1);
                    }}
                    className="flex-1 btn border border-secondary-300 text-secondary-700 hover:bg-secondary-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 btn btn-primary"
                  >
                    Confirm Order
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
