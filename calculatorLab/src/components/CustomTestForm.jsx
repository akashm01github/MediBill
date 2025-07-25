// CustomTestForm.jsx
import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const CustomTestForm = ({ onAddTest, testOptions }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || isNaN(price) || Number(price) <= 0) {
      toast.error('Please enter a valid test name and price', { autoClose: 2000 });
      return;
    }

    onAddTest({ name, price: Number(price) });
    setName('');
    setPrice('');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <PlusIcon className="w-6 h-6 text-blue-600" />
        Add Custom Test
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="testName" className="block text-sm font-medium text-gray-700">
            Test Name
          </label>
          <input
            id="testName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter test name"
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div>
          <label htmlFor="testPrice" className="block text-sm font-medium text-gray-700">
            Price (₹)
          </label>
          <input
            id="testPrice"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price"
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
        >
          <PlusIcon className="w-5 h-5" />
          Add Test
        </button>
      </form>
    </div>
  );
};

export default CustomTestForm;