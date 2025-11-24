import React, { useState } from 'react';
import { Settings, Plus, Trash2, Edit, FileText, Calculator, Home } from 'lucide-react';

const ProjectDashboard = ({ rooms, onAddRoom, onEditRoom, onDeleteRoom, onGeneratePDF, settings, onUpdateSettings }) => {
    const [showSettings, setShowSettings] = useState(false);
    const [localSettings, setLocalSettings] = useState(settings);

    const handleSaveSettings = () => {
        onUpdateSettings(localSettings);
        setShowSettings(false);
    };

    const totalSqft = rooms.reduce((sum, room) => sum + room.sqft, 0);
    const totalCost = rooms.reduce((sum, room) => sum + room.totalCost, 0);

    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            {/* Header */}
            <div className="bg-slate-800 text-white p-6 rounded-3xl shadow-lg mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{settings.businessName || "My Project"}</h1>
                    <p className="text-slate-300 text-sm font-medium opacity-80">Whole House Estimate</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowSettings(true)}
                        className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors flex items-center gap-2"
                    >
                        <Settings size={20} className="text-white" />
                        <span className="text-sm font-bold">Settings</span>
                    </button>
                    <button
                        onClick={onGeneratePDF}
                        disabled={rooms.length === 0}
                        className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <FileText size={20} />
                        <span>Generate Quote</span>
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-2 text-slate-500">
                        <Home size={20} className="text-blue-500" />
                        <h3 className="font-bold uppercase text-xs tracking-wide">Total Rooms</h3>
                    </div>
                    <p className="text-3xl font-bold text-slate-800">{rooms.length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-2 text-slate-500">
                        <Calculator size={20} className="text-orange-500" />
                        <h3 className="font-bold uppercase text-xs tracking-wide">Total Area</h3>
                    </div>
                    <p className="text-3xl font-bold text-slate-800">{totalSqft.toLocaleString()} <span className="text-sm font-normal text-slate-400">sq ft</span></p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-2 text-slate-500">
                        <FileText size={20} className="text-green-500" />
                        <h3 className="font-bold uppercase text-xs tracking-wide">Est. Total Cost</h3>
                    </div>
                    <p className="text-3xl font-bold text-slate-800">{formatCurrency(totalCost)}</p>
                </div>
            </div>

            {/* Room Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Add Room Card */}
                <button
                    onClick={onAddRoom}
                    className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 hover:bg-slate-100 hover:border-orange-300 transition-all group min-h-[300px]"
                >
                    <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <Plus className="text-orange-500" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">Add New Room</h3>
                </button>

                {/* Room Cards */}
                {rooms.map((room) => (
                    <div key={room.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md transition-all">
                        <div className="h-48 bg-slate-100 relative overflow-hidden">
                            {room.image ? (
                                <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <Home size={48} />
                                </div>
                            )}
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => onEditRoom(room.id)}
                                    className="bg-white/90 p-2 rounded-full text-slate-700 hover:text-blue-600 shadow-sm"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={() => onDeleteRoom(room.id)}
                                    className="bg-white/90 p-2 rounded-full text-slate-700 hover:text-red-600 shadow-sm"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-slate-800 mb-1">{room.name}</h3>
                            <p className="text-sm text-slate-500 font-medium mb-4">{room.materialType} • {room.roomShape}</p>

                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Area</p>
                                    <p className="text-lg font-bold text-slate-700">{room.sqft.toLocaleString()} sq ft</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Cost</p>
                                    <p className="text-lg font-bold text-slate-700">{formatCurrency(room.totalCost)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Project Settings</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-500 mb-1 uppercase">Business Name</label>
                                <input
                                    type="text"
                                    value={localSettings.businessName}
                                    onChange={(e) => setLocalSettings({ ...localSettings, businessName: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-500 mb-1 uppercase">Phone Number</label>
                                <input
                                    type="tel"
                                    value={localSettings.phoneNumber}
                                    onChange={(e) => setLocalSettings({ ...localSettings, phoneNumber: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-500 mb-1 uppercase">Email Address</label>
                                <input
                                    type="email"
                                    value={localSettings.email}
                                    onChange={(e) => setLocalSettings({ ...localSettings, email: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveSettings}
                                    className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-900 transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDashboard;
