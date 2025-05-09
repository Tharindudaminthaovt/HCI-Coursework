import React, { useState } from 'react';

const FurnitureSelector = ({ availableFurniture, onSelectFurniture }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  
  const productTypes = ['All', ...new Set(availableFurniture.map(item => item.productType))];
  
  const filteredFurniture = availableFurniture.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === '' || selectedType === 'All' || 
                        item.productType === selectedType;
    
    return matchesSearch && matchesType;
  });
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-2/3">
          <input
            type="text"
            placeholder="Search furniture..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="w-full md:w-1/3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {productTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredFurniture.map(item => (
          <div 
            key={item._id}
            className="border rounded p-3 flex flex-col items-center cursor-pointer hover:bg-gray-50"
            onClick={() => onSelectFurniture(item)}
          >
            <img 
              src={`http://localhost:3001/${item.image}`}
              alt={item.title}
              className="w-32 h-32 object-contain mb-2"
              onError={(e) => {
                console.error(`Failed to load image: ${item.image}`);
                e.target.src = '/placeholder-furniture.png';
              }}
            />
            <div className="text-center">
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-gray-500">{item.productType}</p>
              <p className="text-sm font-medium">${item.price.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
      
      {filteredFurniture.length === 0 && (
        <div className="text-center py-4">
          <p>No furniture items found</p>
        </div>
      )}
    </div>
  );
};

export default FurnitureSelector;