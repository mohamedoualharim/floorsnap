import React, { useState, useEffect } from 'react';
import { Calculator as CalcIcon, DollarSign, Ruler, Layers, Hammer, FileText, Box, Settings, X } from 'lucide-react';
import PricingTiers from './PricingTiers';
import RoomVisualizer from './RoomVisualizer';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Calculator = () => {
  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [materialType, setMaterialType] = useState('Tile');
  const [roomShape, setRoomShape] = useState('Standard');
  const [materialCost, setMaterialCost] = useState('');
  const [laborCost, setLaborCost] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  const [sqft, setSqft] = useState(0);
  const [wasteFactor, setWasteFactor] = useState(0.10);
  const [roomImage, setRoomImage] = useState(null);

  const materialOptions = {
    'Tile': 0.10,
    'Wood': 0.08,
    'Vinyl': 0.05,
    'Laminate': 0.05
  };

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('floorSnapData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setWidth(parsed.width || '');
        setLength(parsed.length || '');
        setMaterialType(parsed.materialType || 'Tile');
        setRoomShape(parsed.roomShape || 'Standard');
        setMaterialCost(parsed.materialCost || '');
        setLaborCost(parsed.laborCost || '');
        setBusinessName(parsed.businessName || '');
        setPhoneNumber(parsed.phoneNumber || '');
        setEmail(parsed.email || '');
        // Note: roomImage is not saved to localStorage to avoid quota limits, 
        // but could be if using IndexedDB or small thumbnails.
      } catch (e) {
        console.error("Failed to load saved data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save data to localStorage on change
  useEffect(() => {
    if (!isLoaded) return;

    const dataToSave = {
      width,
      length,
      materialType,
      roomShape,
      materialCost,
      laborCost,
      businessName,
      phoneNumber,
      email
    };
    localStorage.setItem('floorSnapData', JSON.stringify(dataToSave));
  }, [width, length, materialType, roomShape, materialCost, laborCost, businessName, phoneNumber, email, isLoaded]);

  // Update Waste Factor based on Room Shape and Material
  useEffect(() => {
    if (roomShape === 'Complex') {
      setWasteFactor(0.15);
    } else {
      setWasteFactor(materialOptions[materialType]);
    }
  }, [materialType, roomShape]);

  useEffect(() => {
    const w = parseFloat(width) || 0;
    const l = parseFloat(length) || 0;
    setSqft(w * l);
  }, [width, length]);

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const mCost = parseFloat(materialCost) || 0;
      const lCost = parseFloat(laborCost) || 0;

      // Header
      doc.setFontSize(22);
      doc.setTextColor(37, 99, 235); // Blue-600
      doc.text(businessName || "FloorSnap Contractor", 20, 20);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Professional Flooring Estimates", 20, 26);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 32);

      // Contact Info
      if (phoneNumber || email) {
        let contactY = 38;
        if (phoneNumber) {
          doc.text(`Phone: ${phoneNumber}`, 20, contactY);
          contactY += 5;
        }
        if (email) {
          doc.text(`Email: ${email}`, 20, contactY);
        }
      }

      let yPos = 50;

      // Room Photo
      if (roomImage) {
        try {
          const imgProps = doc.getImageProperties(roomImage);
          const pdfWidth = 170;
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

          // Limit height if too tall
          const finalHeight = Math.min(pdfHeight, 100);
          const finalWidth = (imgProps.width * finalHeight) / imgProps.height;

          doc.addImage(roomImage, 'JPEG', 20, yPos, finalWidth, finalHeight);
          yPos += finalHeight + 10;
        } catch (e) {
          console.error("Error adding image to PDF", e);
        }
      }

      // Breakdown
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Project Details", 20, yPos);
      yPos += 8;

      autoTable(doc, {
        startY: yPos,
        head: [['Item', 'Value']],
        body: [
          ['Room Dimensions', `${width || 0} ft x ${length || 0} ft`],
          ['Room Shape', roomShape],
          ['Total Area', `${sqft.toLocaleString()} sq ft`],
          ['Material Type', materialType],
          ['Waste Factor', `${(wasteFactor * 100).toFixed(0)}%`],
          ['Billable Area', `${(sqft * (1 + wasteFactor)).toFixed(1)} sq ft`],
        ],
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
      });

      yPos = doc.lastAutoTable.finalY + 15;

      // Pricing Options
      doc.setFontSize(14);
      doc.text("Quote Options", 20, yPos);
      yPos += 8;

      const calculateTierTotal = (multiplier) => {
        const materialPrice = mCost * multiplier;
        const totalMaterial = sqft * (1 + wasteFactor) * materialPrice;
        const totalLabor = sqft * lCost;
        return totalMaterial + totalLabor;
      };

      const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

      autoTable(doc, {
        startY: yPos,
        head: [['Tier', 'Description', 'Total Estimate']],
        body: [
          ['Good', 'Standard Material & Installation', formatCurrency(calculateTierTotal(1.0))],
          ['Better', 'Premium Material (Most Popular)', formatCurrency(calculateTierTotal(1.2))],
          ['Best', 'Luxury Material & Lifetime Warranty', formatCurrency(calculateTierTotal(1.5))],
        ],
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] },
        columnStyles: {
          2: { fontStyle: 'bold', halign: 'right' }
        }
      });

      // Footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text("Valid for 30 days. This is an estimate only.", 105, pageHeight - 10, { align: 'center' });

      doc.save("FloorSnap_Quote.pdf");
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Failed to generate PDF. Check console for details.");
    }
  };

  const handleGenerateQuote = () => {
    if (!businessName.trim()) {
      setShowSettings(true);
    } else {
      generatePDF();
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen shadow-xl overflow-hidden md:rounded-3xl md:min-h-[800px] md:my-8 border border-gray-100 pb-20 relative">
      {/* Header */}
      <div className="bg-slate-800 text-white p-6 pt-12 rounded-b-3xl shadow-lg relative z-10">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{businessName || "FloorSnap"}</h1>
            <p className="text-slate-300 text-sm font-medium opacity-80">Professional Estimator</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowSettings(true)}
              className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors"
            >
              <Settings size={28} className="text-white" />
            </button>
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
              <CalcIcon size={28} className="text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Business Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-1 uppercase">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Mike's Tiling"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-1 uppercase">Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-1 uppercase">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mike@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full bg-slate-800 text-white font-bold py-4 rounded-xl mt-4 hover:bg-slate-900 transition-colors shadow-lg"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Dimensions Section */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-slate-500">
              <Ruler size={18} className="text-orange-500" />
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Room Dimensions</h2>
            </div>
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
        />

        {/* Pricing Tiers */}
        <PricingTiers
          sqft={sqft}
          wasteFactor={wasteFactor}
          baseMaterialCost={parseFloat(materialCost) || 0}
          laborCost={parseFloat(laborCost) || 0}
        />

        {/* Generate Quote Button */}
        <div className="fixed bottom-6 left-0 right-0 px-6 flex justify-center z-50 pointer-events-none">
          <button
            onClick={handleGenerateQuote}
            className="pointer-events-auto bg-orange-500 text-white font-bold py-4 px-10 rounded-full shadow-2xl flex items-center gap-3 hover:bg-orange-600 transition-all transform hover:scale-105 active:scale-95 border-4 border-white/20"
          >
            <FileText size={24} />
            <span className="text-lg">Generate Quote PDF</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default Calculator;
