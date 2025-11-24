import React, { useState, useEffect } from 'react';
import Calculator from './components/Calculator';
import ProjectDashboard from './components/ProjectDashboard';
import { generateProjectPDF } from './utils/pdfGenerator';

function App() {
  const [rooms, setRooms] = useState([]);
  const [projectSettings, setProjectSettings] = useState({
    businessName: '',
    phoneNumber: '',
    email: ''
  });
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'editor'
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('floorSnapProject');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setRooms(parsed.rooms || []);
        setProjectSettings(parsed.settings || { businessName: '', phoneNumber: '', email: '' });
      } catch (e) {
        console.error("Failed to load saved project data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save data to localStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    const dataToSave = {
      rooms,
      settings: projectSettings
    };
    localStorage.setItem('floorSnapProject', JSON.stringify(dataToSave));
  }, [rooms, projectSettings, isLoaded]);

  const handleAddRoom = () => {
    setEditingRoomId(null);
    setCurrentView('editor');
  };

  const handleEditRoom = (id) => {
    setEditingRoomId(id);
    setCurrentView('editor');
  };

  const handleDeleteRoom = (id) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      setRooms(rooms.filter(r => r.id !== id));
    }
  };

  const handleSaveRoom = (roomData) => {
    if (editingRoomId) {
      // Update existing room
      setRooms(rooms.map(r => r.id === editingRoomId ? roomData : r));
    } else {
      // Add new room
      setRooms([...rooms, roomData]);
    }
    setCurrentView('dashboard');
    setEditingRoomId(null);
  };

  const handleCancelEdit = () => {
    setCurrentView('dashboard');
    setEditingRoomId(null);
  };

  const handleUpdateSettings = (newSettings) => {
    setProjectSettings(newSettings);
  };

  const handleGeneratePDF = () => {
    generateProjectPDF(projectSettings, rooms);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {currentView === 'dashboard' ? (
        <ProjectDashboard
          rooms={rooms}
          onAddRoom={handleAddRoom}
          onEditRoom={handleEditRoom}
          onDeleteRoom={handleDeleteRoom}
          onGeneratePDF={handleGeneratePDF}
          settings={projectSettings}
          onUpdateSettings={handleUpdateSettings}
        />
      ) : (
        <Calculator
          initialData={editingRoomId ? rooms.find(r => r.id === editingRoomId) : null}
          onSave={handleSaveRoom}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
}

export default App;
