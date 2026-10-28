import DashboardLayout from '../layouts/DashboardLayout';
import { Package, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function VendorProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [stock, setStock] = useState('100');
  
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products/my-products');
      setProducts(res.data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/products', {
        name,
        category,
        description,
        price: Number(price),
        stock: Number(stock),
        imageUrl
      });
      alert('Product added successfully!');
      setIsModalOpen(false);
      // Reset form
      setName('');
      setCategory('');
      setPrice('');
      setDescription('');
      setImageUrl('');
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert('Failed to add product');
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Product Catalog</h1>
          <p className="text-secondary-500">Manage your items for customers to browse and buy.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary px-6 py-2.5 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Product
        </button>
      </div>

      {isLoading ? (
        <div className="card p-8 text-center text-secondary-500 animate-pulse">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="card p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-secondary-400" />
          </div>
          <h3 className="text-lg font-bold text-secondary-900 mb-2">No Products Yet</h3>
          <p className="text-secondary-500 mb-6">Add items to your catalog so customers can buy on credit.</p>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-outline text-primary-600 border-primary-600 hover:bg-primary-50">
            Create First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product._id} className="card overflow-hidden hover:shadow-lg transition-all group">
              <div className="h-48 bg-secondary-100 relative">
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
              <div className="p-4">
                <h3 className="font-bold text-secondary-900 text-lg leading-tight mb-1">{product.name}</h3>
                <p className="text-2xl font-black text-primary-600 mb-2">₹{product.price}</p>
                {product.description && (
                  <p className="text-sm text-secondary-500 line-clamp-2 mb-4">{product.description}</p>
                )}
                <div className="flex justify-between items-center text-xs text-secondary-500 border-t pt-3 mt-auto">
                  <span>Stock: {product.stock}</span>
                  <button className="text-danger hover:text-red-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-secondary-900/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-secondary-900 mb-6">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Product Name</label>
                <input 
                  type="text" 
                  required
                  className="input px-4 py-2 border w-full"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aashirvaad Atta 5kg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Price (₹)</label>
                  <input 
                    type="number" 
                    required
                    className="input px-4 py-2 border w-full"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 250"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Category</label>
                  <select 
                    required
                    className="input px-4 py-2 border w-full"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Select Category</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Image URL (Optional)</label>
                <input 
                  type="url" 
                  className="input px-4 py-2 border w-full"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Description (Optional)</label>
                <textarea 
                  className="input px-4 py-2 border w-full resize-none h-20"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief details about the product..."
                />
              </div>

              <div className="flex gap-4 mt-8">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 btn border border-secondary-300 text-secondary-700 hover:bg-secondary-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 btn btn-primary"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
