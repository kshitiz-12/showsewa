import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  CreditCard, 
  Building2, 
  RefreshCw, 
  Settings, 
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { inventoryService, TheaterChannel, ChannelBooking } from '../services/inventoryService';

interface ChannelManagementProps {
  theaterId: string;
  theaterName: string;
}

const channelConfig = {
  showsewa: { name: 'ShowSewa', icon: Monitor, color: 'red', description: 'Our platform' },
  walkIn: { name: 'Walk-In', icon: Building2, color: 'gray', description: 'Physical tickets' },
  otherPlatform: { name: 'Other Platforms', icon: Handshake, color: 'purple', description: 'Partner sites' },
  posSystem: { name: 'POS System', icon: CreditCard, color: 'green', description: 'Point of sale' },
};

export const ChannelManagement: React.FC<ChannelManagementProps> = ({ theaterId, theaterName }) => {
  const [channels, setChannels] = useState<TheaterChannel | null>(null);
  const [bookings, setBookings] = useState<ChannelBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChannelData();
  }, [theaterId]);

  const loadChannelData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [channelsData, bookingsData] = await Promise.all([
        inventoryService.getTheaterChannels(theaterId),
        inventoryService.getChannelBookings(theaterId),
      ]);
      
      setChannels(channelsData);
      setBookings(bookingsData);
    } catch (err) {
      console.error('Error loading channel data:', err);
      setError('Failed to load channel configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleChannelToggle = async (channel: keyof TheaterChannel['channels']) => {
    if (!channels) return;

    const updatedChannels = {
      ...channels,
      channels: {
        ...channels.channels,
        [channel]: !channels.channels[channel],
      },
    };

    try {
      const success = await inventoryService.updateTheaterChannels(theaterId, updatedChannels);
      if (success) {
        setChannels(updatedChannels);
      } else {
        throw new Error('Failed to update channels');
      }
    } catch (error) {
      console.error('Error updating channels:', error);
      alert('Failed to update channel configuration');
    }
  };

  const handleSyncInventory = async () => {
    setSyncing(true);
    try {
      const result = await inventoryService.syncInventory(theaterId);
      if (result.success) {
        alert(`✅ ${result.message}`);
        await loadChannelData(); // Refresh data
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error('Error syncing inventory:', error);
      alert('Failed to sync inventory');
    } finally {
      setSyncing(false);
    }
  };

  const getChannelStats = (channel: string) => {
    const channelBookings = bookings.filter(b => b.channel === channel.toUpperCase());
    const confirmed = channelBookings.filter(b => b.status === 'CONFIRMED').length;
    const pending = channelBookings.filter(b => b.status === 'PENDING').length;
    const cancelled = channelBookings.filter(b => b.status === 'CANCELLED').length;
    
    return { total: channelBookings.length, confirmed, pending, cancelled };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Loading channel configuration...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Channels</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadChannelData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Channel Management</h2>
            <p className="text-gray-600">{theaterName}</p>
          </div>
          <button
            onClick={handleSyncInventory}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync All Channels'}</span>
          </button>
        </div>

        {channels?.syncSettings && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-900">Sync Settings</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Auto Sync:</span>
                <span className={`ml-2 font-medium ${channels.syncSettings.autoSync ? 'text-green-600' : 'text-red-600'}`}>
                  {channels.syncSettings.autoSync ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Sync Interval:</span>
                <span className="ml-2 font-medium text-gray-900">{channels.syncSettings.syncInterval} minutes</span>
              </div>
              <div>
                <span className="text-gray-600">Last Sync:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {new Date(channels.syncSettings.lastSync).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Channel Configuration */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Channels</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(channelConfig).map(([key, config]) => {
            const IconComponent = config.icon;
            const isActive = channels?.channels[key as keyof TheaterChannel['channels']] || false;
            const stats = getChannelStats(key);
            
            return (
              <div
                key={key}
                className={`border-2 rounded-lg p-4 transition-all ${
                  isActive 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isActive ? `bg-${config.color}-100` : 'bg-gray-100'
                    }`}>
                      <IconComponent className={`w-5 h-5 ${
                        isActive ? `text-${config.color}-600` : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{config.name}</h4>
                      <p className="text-xs text-gray-600">{config.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleChannelToggle(key as keyof TheaterChannel['channels'])}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      isActive ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      isActive ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                {isActive && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Bookings:</span>
                      <span className="font-medium">{stats.total}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Confirmed:</span>
                      <span className="font-medium text-green-600">{stats.confirmed}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Pending:</span>
                      <span className="font-medium text-yellow-600">{stats.pending}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Cancelled:</span>
                      <span className="font-medium text-red-600">{stats.cancelled}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Channel Performance */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Channel Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Channel</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Total Bookings</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Success Rate</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Last Activity</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(channelConfig).map(([key, config]) => {
                const stats = getChannelStats(key);
                const isActive = channels?.channels[key as keyof TheaterChannel['channels']] || false;
                const successRate = stats.total > 0 ? ((stats.confirmed / stats.total) * 100).toFixed(1) : '0';
                const lastBooking = bookings
                  .filter(b => b.channel === key.toUpperCase())
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                
                return (
                  <tr key={key} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <config.icon className={`w-4 h-4 ${isActive ? `text-${config.color}-600` : 'text-gray-400'}`} />
                        <span className="font-medium">{config.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{stats.total}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${successRate}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{successRate}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {lastBooking ? new Date(lastBooking.createdAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-time Status */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Live Bookings</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {bookings.filter(b => b.status === 'PENDING').length}
            </p>
            <p className="text-sm text-blue-700">Currently processing</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">Confirmed Today</span>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {bookings.filter(b => 
                b.status === 'CONFIRMED' && 
                new Date(b.createdAt).toDateString() === new Date().toDateString()
              ).length}
            </p>
            <p className="text-sm text-green-700">Successful bookings</p>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-yellow-900">Sync Status</span>
            </div>
            <p className="text-lg font-bold text-yellow-900">
              {channels?.syncSettings.autoSync ? 'Auto' : 'Manual'}
            </p>
            <p className="text-sm text-yellow-700">
              Next sync in {channels?.syncSettings.syncInterval || 0} min
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
