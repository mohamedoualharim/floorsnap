import React, { useState, useEffect, useRef } from 'react';
import { Calculator as CalcIcon, Ruler, Layers, Hammer, Box, Save, ArrowLeft } from 'lucide-react';
import PricingTiers from './PricingTiers';
import RoomVisualizer from './RoomVisualizer';

const Calculator = ({ initialData, onSave, onCancel }) => {
  const [name, setName] = useState(initialData?.name || 'New Room');
  const [width, setWidth] = useState(initialData?.width || '');
  const [length, setLength] = useState(initialData?.length || '');
  const [materialType, setMaterialType] = useState(initialData?.materialType || 'Tile');
  const [roomShape, setRoomShape] = useState(initialData?.roomShape || 'Standard');
  const [materialCost, setMaterialCost] = useState(initialData?.materialCostPerSqFt || '');
  const [laborCost, setLaborCost] = useState(initialData?.laborCostPerSqFt || '');

  const [sqft, setSqft] = useState(initialData?.sqft || 0);
  const [wasteFactor, setWasteFactor] = useState(initialData?.wasteFactor || 0.10);
  const [roomImage, setRoomImage] = useState(initialData?.image || null);

  const [isManualInput, setIsManualInput] = useState(initialData?.isManualInput || false);
  const [manualSqft, setManualSqft] = useState(initialData?.isManualInput ? initialData.sqft : '');

  const visualizerRef = useRef(null);

  const materialOptions = {
    'Tile': 0.10,
    'Wood': 0.08,
    'Vinyl': 0.05,
    'Laminate': 0.05
  };

  // Update Waste Factor based on Room Shape and Material
  useEffect(() => {
    if (roomShape === 'Complex') {
      setWasteFactor(0.15);
    } else {
      setWasteFactor(materialOptions[materialType]);
    }
  }, [materialType, roomShape]);

  // Update SqFt based on inputs and mode
  useEffect(() => {
    if (isManualInput) {
      setSqft(parseFloat(manualSqft) || 0);
    } else {
      const w = parseFloat(width) || 0;
      const l = parseFloat(length) || 0;
      setSqft(w * l);
    }
  }, [width, length, isManualInput, manualSqft]);

  const handleSave = async () => {
    let finalImage = roomImage;

    // Capture annotated image if visualizer is active
    if (visualizerRef.current && visualizerRef.current.generateCompositeImage && roomImage) {
      try {
        const composite = await visualizerRef.current.generateCompositeImage();
        if (composite) finalImage = composite;
      } catch (e) {
        console.error("Failed to generate composite image", e);
      }
    }

    const mCost = parseFloat(materialCost) || 0;
    const lCost = parseFloat(laborCost) || 0;
    const totalMaterial = sqft * (1 + wasteFactor) * mCost;
    const totalLabor = sqft * lCost;
    const totalCost = totalMaterial + totalLabor;

    const roomData = {
      id: initialData?.id || Date.now(),
      name,
      width,
      length,
      isManualInput,
      sqft,
      materialType,
      roomShape,
      wasteFactor,
      materialCostPerSqFt: mCost,
      laborCostPerSqFt: lCost,
      totalCost,
      image: finalImage
    };

    onSave(roomData);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen shadow-xl overflow-hidden md:rounded-3xl md:min-h-[800px] md:my-8 border border-gray-100 pb-20 relative">
      {/* Header */}
      <div className="bg-slate-800 text-white p-6 pt-12 rounded-b-3xl shadow-lg relative z-10 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-transparent text-2xl font-bold tracking-tight focus:outline-none border-b border-transparent focus:border-white/50 transition-colors placeholder-slate-400"
              placeholder="Room Name"
            />
            <p className="text-slate-300 text-sm font-medium opacity-80">Edit Room Details</p>
          </div>
        </div>
        <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
          <CalcIcon size={28} className="text-orange-500" />
        </div>
      </div>

      <div className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Dimensions Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Ruler size={18} className="text-orange-500" />
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Room Dimensions</h2>
              </div>

              {/* Input Mode Toggle */}
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setIsManualInput(false)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${!isManualInput ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Dimensions
                </button>
                <button
                  onClick={() => setIsManualInput(true)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${isManualInput ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Total SqFt
                </button>
              </div>
            </div>

            {!isManualInput ? (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 transition-all">
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Width (ft)</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="w-full bg-transparent text-2xl font-bold text-slate-800 outline-none placeholder-slate-300"
                    placeholder="0"
                  />
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 transition-all">
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Length (ft)</label>
                  <input
                    type="number"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="w-full bg-transparent text-2xl font-bold text-slate-800 outline-none placeholder-slate-300"
                    placeholder="0"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 transition-all mb-4">
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Total Area (sq ft)</label>
                <input
                  type="number"
                  value={manualSqft}
                  onChange={(e) => setManualSqft(e.target.value)}
                  className="w-full bg-transparent text-2xl font-bold text-slate-800 outline-none placeholder-slate-300"
                  placeholder="0"
                />
              </div>
            )}

            {/* Helper Text */}
            <div className="mb-6 flex items-center gap-2 text-slate-400 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
              <p className="text-xs font-medium">You measure, we calculate waste & price.</p>
            </div>

            {/* Room Shape Dropdown */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <Box size={14} className="text-slate-400" />
                <label className="block text-xs font-bold text-slate-400 uppercase">Room Shape</label>
              </div>
              <select
                value={roomShape}
                onChange={(e) => setRoomShape(e.target.value)}
                className="w-full bg-transparent text-lg font-bold text-slate-800 outline-none"
              >
                <option value="Standard">Standard (Square/Rect)</option>
                <option value="Complex">Complex (Angles/Curves)</option>
              </select>
            </div>

            <div className="mt-3 flex justify-between items-center px-2">
              <span className="text-sm font-medium text-slate-400">Total Area</span>
              <span className="text-lg font-bold text-slate-700">{sqft.toLocaleString()} <span className="text-sm font-normal text-slate-400">sq ft</span></span>
            </div>
          </section>

          {/* Material & Labor Inputs */}
          <div className="space-y-8">
            {/* Material Section */}
            <section>
              <div className="flex items-center gap-2 mb-4 text-slate-500">
                <Layers size={18} className="text-orange-500" />
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Material Details</h2>
              </div>

              <div className="bg-slate-50 p-1.5 rounded-2xl border border-slate-200 mb-4 flex">
                {Object.keys(materialOptions).map((type) => (
                  <button
                    key={type}
                    onClick={() => setMaterialType(type)}
                    className={`flex-1 py-3 text-xs md:text-sm font-bold rounded-xl transition-all ${materialType === type
                      ? 'bg-white text-slate-800 shadow-md ring-1 ring-black/5'
                      : 'text-slate-400 hover:text-slate-600'
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center px-2 mb-4">
                <span className="text-sm font-medium text-slate-400">Waste Factor</span>
                <span className={`text-sm font-bold px-3 py-1 rounded-full border ${roomShape === 'Complex' ? 'text-red-500 bg-red-50 border-red-100' : 'text-orange-600 bg-orange-50 border-orange-100'}`}>
                  {(wasteFactor * 100).toFixed(0)}% {roomShape === 'Complex' && '(Complex)'}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 transition-all">
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Material Cost ($/sq ft)</label>
                <div className="flex items-center">
                  <span className="text-slate-400 mr-1 text-lg">$</span>
                  <input
                    type="number"
                    value={materialCost}
                    onChange={(e) => setMaterialCost(e.target.value)}
                    className="w-full bg-transparent text-2xl font-bold text-slate-800 outline-none placeholder-slate-300"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </section>

            {/* Labor Section */}
            <section>
              <div className="flex items-center gap-2 mb-4 text-slate-500">
                <Hammer size={18} className="text-orange-500" />
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Labor Costs</h2>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 transition-all">
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Labor Cost ($/sq ft)</label>
                <div className="flex items-center">
                  <span className="text-slate-400 mr-1 text-lg">$</span>
                  <input
                    type="number"
                    value={laborCost}
                    onChange={(e) => setLaborCost(e.target.value)}
                    className="w-full bg-transparent text-2xl font-bold text-slate-800 outline-none placeholder-slate-300"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Room Visualizer */}
        <RoomVisualizer
          sqft={sqft}
          image={roomImage}
          onImageChange={setRoomImage}
          ref={visualizerRef}
        />

        {/* Pricing Tiers */}
        <PricingTiers
          sqft={sqft}
          wasteFactor={wasteFactor}
          baseMaterialCost={parseFloat(materialCost) || 0}
          laborCost={parseFloat(laborCost) || 0}
        />

        {/* Save Button */}
        <div className="fixed bottom-6 left-0 right-0 px-6 flex justify-center z-50 pointer-events-none">
          <button
            onClick={handleSave}
            className="pointer-events-auto bg-orange-500 text-white font-bold py-4 px-10 rounded-full shadow-2xl flex items-center gap-3 hover:bg-orange-600 transition-all transform hover:scale-105 active:scale-95 border-4 border-white/20"
          >
            <Save size={24} />
            <span className="text-lg">Save Room</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default Calculator;
