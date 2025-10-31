import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Phone, Mail, Building2, RefreshCw, AlertCircle, Download } from 'lucide-react';
import { theaterService, CreateTheaterRequest, UpdateTheaterRequest } from '../services/theaterService';
import { Theater } from '../data/nepalTheaters';

interface TheaterManagementProps {
  onAddTheater?: () => void;
}

export const TheaterManagement: React.FC<TheaterManagementProps> = ({ onAddTheater }) => {
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editingTheater, setEditingTheater] = useState<Theater | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadTheaters();
  }, []);

  const loadTheaters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await theaterService.getTheaters(1, 100);
      if (response.success) {
        setTheaters(response.data.theaters);
      } else {
        throw new Error('Failed to load theaters');
      }
    } catch (err) {
      console.error('Error loading theaters:', err);
      setError('Failed to load theaters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTheaters();
    setRefreshing(false);
  };

  const handleCreateTheater = async (theaterData: CreateTheaterRequest) => {
    try {
      const newTheater = await theaterService.createTheater(theaterData);
      setTheaters(prev => [newTheater, ...prev]);
      setShowCreateForm(false);
      
      // Call external onAddTheater callback if provided
      if (onAddTheater) {
        onAddTheater();
      }
      
      console.log('✅ Theater created successfully:', newTheater.name);
    } catch (error) {
      console.error('❌ Failed to create theater:', error);
      throw error;
    }
  };

  const handleUpdateTheater = async (id: string, theaterData: UpdateTheaterRequest) => {
    try {
      const updatedTheater = await theaterService.updateTheater(id, theaterData);
      setTheaters(prev => prev.map(t => t.id === id ? updatedTheater : t));
      setEditingTheater(null);
      console.log('✅ Theater updated successfully:', updatedTheater.name);
    } catch (error) {
      console.error('❌ Failed to update theater:', error);
      throw error;
    }
  };

  const handleDeleteTheater = async (id: string) => {
    if (!confirm('Are you sure you want to delete this theater? This action cannot be undone.')) {
      return;
    }

    try {
      const success = await theaterService.deleteTheater(id);
      if (success) {
        setTheaters(prev => prev.filter(t => t.id !== id));
        console.log('✅ Theater deleted successfully');
      } else {
        throw new Error('Failed to delete theater');
      }
    } catch (error) {
      console.error('❌ Failed to delete theater:', error);
      alert('Failed to delete theater. Please try again.');
    }
  };

  const handleSyncStaticTheaters = async () => {
    if (!confirm('This will sync all static theaters to the database. Continue?')) {
      return;
    }

    try {
      const results = await theaterService.syncStaticTheaters();
      alert(`Sync completed: ${results.success} successful, ${results.failed} failed`);
      
      if (results.success > 0) {
        await loadTheaters(); // Refresh the list
      }
    } catch (error) {
      console.error('❌ Failed to sync theaters:', error);
      alert('Failed to sync theaters. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Loading theaters...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Theater Management</h2>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => onAddTheater?.() || setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Theater</span>
            <span className="sm:hidden">Add</span>
          </button>
          <button
            onClick={handleSyncStaticTheaters}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            title="Sync static theaters to database"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Sync Static</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {theaters.length === 0 ? (
        <div className="text-center py-8">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No theaters found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first theater or syncing static data.</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Theater
            </button>
            <button
              onClick={handleSyncStaticTheaters}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Sync Static Data
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">Found {theaters.length} theaters</p>
          <div className="grid gap-4">
            {theaters.map((theater) => (
              <div key={theater.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{theater.name}</h3>
                      {theater.nameNe && (
                        <p className="text-sm text-gray-600">({theater.nameNe})</p>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        theater.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {theater.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{theater.city}, {theater.area}</span>
                      </div>
                      <p className="ml-6">{theater.address}</p>
                      {theater.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{theater.phone}</span>
                        </div>
                      )}
                      {theater.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{theater.email}</span>
                        </div>
                      )}
                    </div>

                    {theater.amenities && theater.amenities.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Amenities:</p>
                        <div className="flex flex-wrap gap-1">
                          {theater.amenities.map((amenity: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setEditingTheater(theater)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit theater"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTheater(theater.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete theater"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Theater Form */}
      {showCreateForm && (
        <TheaterForm
          onSubmit={handleCreateTheater}
          onCancel={() => setShowCreateForm(false)}
          title="Create New Theater"
        />
      )}

      {/* Edit Theater Form */}
      {editingTheater && (
        <TheaterForm
          theater={editingTheater}
          onSubmit={(data) => handleUpdateTheater(editingTheater.id, data)}
          onCancel={() => setEditingTheater(null)}
          title="Edit Theater"
        />
      )}
    </div>
  );
};

// Theater Form Component
interface TheaterFormProps {
  theater?: Theater;
  onSubmit: (data: CreateTheaterRequest | UpdateTheaterRequest) => Promise<void>;
  onCancel: () => void;
  title: string;
}

const TheaterForm: React.FC<TheaterFormProps> = ({ theater, onSubmit, onCancel, title }) => {
  const [formData, setFormData] = useState({
    name: theater?.name || '',
    nameNe: theater?.nameNe || '',
    city: theater?.city || '',
    area: theater?.area || '',
    address: theater?.address || '',
    phone: theater?.phone || '',
    email: theater?.email || '',
    description: '',
    amenities: theater?.amenities || [],
    screenCount: theater?.screens || 3,
    seatsPerScreen: 200,
  });

  const [amenityInput, setAmenityInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData as CreateTheaterRequest | UpdateTheaterRequest);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAmenity = () => {
    if (amenityInput.trim() && !formData.amenities.includes(amenityInput.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenityInput.trim()]
      }));
      setAmenityInput('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name (Nepali)</label>
                <input
                  type="text"
                  value={formData.nameNe}
                  onChange={(e) => setFormData(prev => ({ ...prev, nameNe: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area *</label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  placeholder="Add amenity..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                />
                <button
                  type="button"
                  onClick={addAmenity}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => removeAmenity(amenity)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Screen Count</label>
                <input
                  type="number"
                  value={formData.screenCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, screenCount: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seats per Screen</label>
                <input
                  type="number"
                  value={formData.seatsPerScreen}
                  onChange={(e) => setFormData(prev => ({ ...prev, seatsPerScreen: parseInt(e.target.value) || 100 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="50"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Theater'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
