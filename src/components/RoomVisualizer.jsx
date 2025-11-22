import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, X, Plus, Trash2 } from 'lucide-react';
import Draggable from 'react-draggable';

const DraggableLabel = ({ label, onDelete, containerRef }) => {
    const nodeRef = useRef(null);

    return (
        <Draggable
            nodeRef={nodeRef}
            defaultPosition={{ x: 0, y: 0 }}
            bounds="parent"
            onStop={(e) => e.stopPropagation()}
        >
            <div
                ref={nodeRef}
                className="absolute cursor-move z-10 group/label"
                style={{ left: `${label.x}%`, top: `${label.y}%` }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-orange-500 text-white px-3 py-1.5 rounded-lg shadow-xl text-sm font-bold border-2 border-white flex items-center gap-2 transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform">
                    <span>{label.text}</span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(label.id);
                        }}
                        className="bg-white/20 rounded-full p-0.5 hover:bg-white/40 transition-colors"
                    >
                        <X size={12} />
                    </button>
                </div>
            </div>
        </Draggable>
    );
};

const RoomVisualizer = ({ sqft, image, onImageChange }) => {
    const [labels, setLabels] = useState([]);
    const [isAddingLabel, setIsAddingLabel] = useState(false);
    const [newLabelText, setNewLabelText] = useState('');
    const [clickPos, setClickPos] = useState(null);

    const fileInputRef = useRef(null);
    const imageContainerRef = useRef(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            onImageChange(url);
            setLabels([]); // Reset labels on new image
        }
    };

    const handleImageClick = (e) => {
        if (!imageContainerRef.current || isAddingLabel) return;

        // Don't trigger if clicking on an existing label (handled by stopPropagation)
        const rect = imageContainerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setClickPos({ x, y });
        setIsAddingLabel(true);
    };

    const confirmAddLabel = () => {
        if (newLabelText.trim() && clickPos) {
            const newLabel = {
                id: Date.now(),
                x: clickPos.x,
                y: clickPos.y,
                text: newLabelText
            };
            setLabels([...labels, newLabel]);
        }
        setIsAddingLabel(false);
        setNewLabelText('');
        setClickPos(null);
    };

    const cancelAddLabel = () => {
        setIsAddingLabel(false);
        setNewLabelText('');
        setClickPos(null);
    };

    const deleteLabel = (id) => {
        setLabels(labels.filter(l => l.id !== id));
    };

    const clearImage = () => {
        onImageChange(null);
        setLabels([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="mt-8">
            <div className="flex items-center gap-2 mb-4 text-slate-500 px-2">
                <Camera size={18} className="text-orange-500" />
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Room Visualizer</h2>
            </div>

            {!image ? (
                <div
                    className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center cursor-pointer hover:bg-slate-100 hover:border-orange-300 transition-all group"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                        <ImageIcon className="text-orange-500" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Add Room Photo</h3>
                    <p className="text-sm text-slate-500">Take a photo or upload to visualize</p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                    />
                </div>
            ) : (
                <div className="relative rounded-2xl overflow-hidden shadow-lg bg-black group select-none">
                    <div
                        ref={imageContainerRef}
                        className="relative cursor-crosshair min-h-[300px]"
                        onClick={handleImageClick}
                    >
                        <img
                            src={image}
                            alt="Room"
                            className="w-full h-auto block opacity-90 pointer-events-none"
                        />

                        {/* Labels */}
                        {labels.map((label) => (
                            <DraggableLabel
                                key={label.id}
                                label={label}
                                onDelete={deleteLabel}
                                containerRef={imageContainerRef}
                            />
                        ))}

                        {/* New Label Input Modal */}
                        {isAddingLabel && clickPos && (
                            <div
                                className="absolute z-20 bg-white p-3 rounded-xl shadow-2xl border-2 border-orange-500 w-64 transform -translate-x-1/2 -translate-y-1/2"
                                style={{ left: `${clickPos.x}%`, top: `${clickPos.y}%` }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Add Label</h4>
                                <input
                                    type="text"
                                    autoFocus
                                    value={newLabelText}
                                    onChange={(e) => setNewLabelText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && confirmAddLabel()}
                                    placeholder="e.g. Damage here"
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={confirmAddLabel}
                                        className="flex-1 bg-orange-500 text-white text-xs font-bold py-2 rounded-lg hover:bg-orange-600"
                                    >
                                        Add
                                    </button>
                                    <button
                                        onClick={cancelAddLabel}
                                        className="flex-1 bg-slate-100 text-slate-600 text-xs font-bold py-2 rounded-lg hover:bg-slate-200"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Empty State Hint */}
                        {labels.length === 0 && !isAddingLabel && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
                                <p className="text-white font-bold bg-black/60 px-6 py-3 rounded-full backdrop-blur-md text-sm border border-white/20">
                                    Tap anywhere to add a label
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={clearImage}
                        className="absolute top-4 right-4 bg-slate-900/80 text-white p-2 rounded-full hover:bg-orange-500 transition-colors backdrop-blur-sm border border-white/10 z-30"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default RoomVisualizer;
