import React, { useState } from 'react';
import { Check, Edit2 } from 'lucide-react';

const PricingTiers = ({ sqft, wasteFactor, baseMaterialCost, laborCost }) => {
    const [tierNames, setTierNames] = useState({
        good: 'Good',
        better: 'Better',
        best: 'Best'
    });

    const [editing, setEditing] = useState(null);

    const calculateTotal = (multiplier) => {
        const materialPrice = baseMaterialCost * multiplier;
        const totalMaterial = sqft * (1 + wasteFactor) * materialPrice;
        const totalLabor = sqft * laborCost;
        return totalMaterial + totalLabor;
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    const tiers = [
        {
            id: 'good',
            multiplier: 1.0,
            color: 'bg-white border-gray-200',
            textColor: 'text-gray-700',
            features: ['Standard Material', 'Basic Installation']
        },
        {
            id: 'better',
            multiplier: 1.2,
            color: 'bg-white border-yellow-400 ring-4 ring-yellow-400/10',
            textColor: 'text-blue-600',
            badge: 'Most Popular',
            features: ['Premium Material', 'Enhanced Durability', 'Extended Warranty']
        },
        {
            id: 'best',
            multiplier: 1.5,
            color: 'bg-slate-900 border-slate-900 text-white',
            textColor: 'text-white',
            features: ['Luxury Material', 'Superior Finish', 'Lifetime Warranty']
        }
    ];

    const handleNameChange = (id, newName) => {
        setTierNames(prev => ({ ...prev, [id]: newName }));
    };

    return (
        <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 px-2">Estimated Quote Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tiers.map((tier) => {
                    const total = calculateTotal(tier.multiplier);
                    const isEditing = editing === tier.id;

                    return (
                        <div
                            key={tier.id}
                            className={`relative rounded-2xl p-6 border-2 transition-all duration-300 ${tier.color} ${tier.id === 'better' ? 'transform md:-translate-y-2 shadow-xl' : 'shadow-sm'}`}
                        >
                            {tier.badge && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                    {tier.badge}
                                </div>
                            )}

                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-1 group">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={tierNames[tier.id]}
                                            onChange={(e) => handleNameChange(tier.id, e.target.value)}
                                            onBlur={() => setEditing(null)}
                                            onKeyDown={(e) => e.key === 'Enter' && setEditing(null)}
                                            autoFocus
                                            className={`font-bold text-lg bg-transparent outline-none border-b border-current w-full ${tier.id === 'best' ? 'text-white' : 'text-gray-800'}`}
                                        />
                                    ) : (
                                        <h3
                                            className={`font-bold text-lg cursor-pointer flex items-center gap-2 ${tier.id === 'best' ? 'text-white' : 'text-gray-800'}`}
                                            onClick={() => setEditing(tier.id)}
                                        >
                                            {tierNames[tier.id]}
                                            <Edit2 size={12} className="opacity-0 group-hover:opacity-50 transition-opacity" />
                                        </h3>
                                    )}
                                </div>
                                <div className={`text-3xl font-bold tracking-tight ${tier.id === 'best' ? 'text-white' : 'text-gray-900'}`}>
                                    {formatCurrency(total)}
                                </div>
                                <div className={`text-xs font-medium mt-1 ${tier.id === 'best' ? 'text-slate-400' : 'text-gray-400'}`}>
                                    approx. {formatCurrency(total / sqft)} / sq ft
                                </div>
                            </div>

                            <ul className="space-y-2 mb-4">
                                {tier.features.map((feature, idx) => (
                                    <li key={idx} className={`text-xs flex items-center gap-2 ${tier.id === 'best' ? 'text-slate-300' : 'text-gray-500'}`}>
                                        <Check size={12} className={tier.id === 'best' ? 'text-green-400' : 'text-green-600'} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PricingTiers;
