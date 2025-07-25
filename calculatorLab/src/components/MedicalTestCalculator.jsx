import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomTestForm from './CustomTestForm';
import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline';
import debounce from 'lodash/debounce';
import { gsap } from 'gsap';

// Initial test options
const initialTestOptions = [];

const MedicalTestCalculator = () => {
  // State management
  const [selectedTests, setSelectedTests] = useState([]);
  const [testOptions, setTestOptions] = useState(initialTestOptions);
  const [displayedTests, setDisplayedTests] = useState(initialTestOptions);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('default');
  const [editingTest, setEditingTest] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [nextId, setNextId] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Refs
  const cardRef = useRef(null);
  const summaryCardRef = useRef(null);
  const searchInputRef = useRef(null);
  const totalPriceRef = useRef(null);

  // Load data from localStorage
  useEffect(() => {
    setIsLoading(true);
    try {
      const storedTests = localStorage.getItem('testOptions');
      const storedSelected = localStorage.getItem('selectedTests');
      const storedNextId = localStorage.getItem('nextId');

      if (storedTests) {
        const parsedTests = JSON.parse(storedTests).map((t, index) => ({
          ...t,
          order: t.order ?? index,
        }));
        setTestOptions(parsedTests);
        setDisplayedTests(parsedTests);
      }
      if (storedSelected) setSelectedTests(JSON.parse(storedSelected));
      if (storedNextId) setNextId(Number(storedNextId));
    } catch (error) {
      toast.error('Error loading data', { autoClose: 2000 });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('testOptions', JSON.stringify(testOptions));
      localStorage.setItem('selectedTests', JSON.stringify(selectedTests));
      localStorage.setItem('nextId', nextId.toString());
    } catch (error) {
      toast.error('Error saving data', { autoClose: 2000 });
    }
  }, [testOptions, selectedTests, nextId]);

  // Calculate total price
  const totalPrice = selectedTests.reduce((total, id) => {
    const test = testOptions.find((t) => t.id === id);
    return total + (test?.price || 0);
  }, 0);

  // GSAP Animation for Total Price
  useEffect(() => {
    if (totalPriceRef.current) {
      const currentText = totalPriceRef.current.innerText.replace('₹', '') || '0';
      const startValue = parseFloat(currentText) || 0;

      gsap.fromTo(
        totalPriceRef.current,
        { innerText: startValue },
        {
          innerText: totalPrice,
          duration: 1,
          ease: 'power1.out',
          snap: { innerText: 1 },
          onUpdate: function () {
            totalPriceRef.current.innerText = `₹${Math.round(this.targets()[0].innerText)}`;
          },
          onComplete: () => {
            // Ensure the final value is exact
            totalPriceRef.current.innerText = `₹${totalPrice}`;
          },
        }
      );
    }
  }, [totalPrice]);

  // Debounced search handler
  const handleSearchChange = debounce((value) => {
    setSearchQuery(value);
  }, 300);

  // Handle checkbox toggle
  const handleCheckboxChange = (testId) => {
    const updatedSelected = selectedTests.includes(testId)
      ? selectedTests.filter((id) => id !== testId)
      : [testId, ...selectedTests];
    setSelectedTests(updatedSelected);
    if (cardRef.current) {
      cardRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Add a new custom test
  const handleAddCustomTest = (newTest) => {
    const trimmedName = newTest.name.trim().toLowerCase();
    if (!trimmedName || isNaN(newTest.price) || newTest.price <= 0) {
      toast.error('Please enter valid test name and price', { autoClose: 2000 });
      return;
    }

    const isDuplicate = testOptions.some(
      (test) => test.name.toLowerCase() === trimmedName
    );

    if (isDuplicate) {
      toast.error(`Test "${newTest.name}" already exists`, { autoClose: 2000 });
      return;
    }

    const test = {
      ...newTest,
      id: nextId,
      isCustom: true,
      order: testOptions.length,
    };
    setTestOptions((prev) => [...prev, test]);
    setDisplayedTests((prev) => [...prev, test]);
    setNextId((prev) => prev + 1);
    toast.success(`Test "${newTest.name}" added`, { autoClose: 2000 });

    if (cardRef.current) {
      cardRef.current.scrollTo({
        top: cardRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  // Edit test
  const handleEditTest = (test) => {
    setEditingTest(test.id);
    setEditName(test.name);
    setEditPrice(test.price.toString());
  };

  // Save edited test
  const handleSaveEdit = () => {
    if (!editName.trim() || isNaN(editPrice) || Number(editPrice) <= 0) {
      toast.error('Enter valid name and price', { autoClose: 2000 });
      return;
    }

    const trimmedName = editName.trim().toLowerCase();
    const isDuplicate = testOptions.some(
      (test) => test.name.toLowerCase() === trimmedName && test.id !== editingTest
    );

    if (isDuplicate) {
      toast.error('Test name already exists', { autoClose: 2000 });
      return;
    }

    setTestOptions((prev) =>
      prev.map((test) =>
        test.id === editingTest
          ? { ...test, name: editName.trim(), price: Number(editPrice) }
          : test
      )
    );
    setEditingTest(null);
    setEditName('');
    setEditPrice('');
    toast.success('Test updated', { autoClose: 2000 });
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingTest(null);
    setEditName('');
    setEditPrice('');
  };

  // Delete test
  const handleDeleteTest = (id) => setShowDeleteConfirm(id);

  const confirmDelete = () => {
    const testToDelete = testOptions.find((test) => test.id === showDeleteConfirm);
    setTestOptions((prev) => prev.filter((test) => test.id !== showDeleteConfirm));
    setDisplayedTests((prev) => prev.filter((test) => test.id !== showDeleteConfirm));
    setSelectedTests((prev) => prev.filter((id) => id !== showDeleteConfirm));
    setShowDeleteConfirm(null);
    toast.success(`Test "${testToDelete?.name}" deleted`, { autoClose: 2000 });
  };

  const cancelDelete = () => setShowDeleteConfirm(null);

  // Clear all selected tests
  const handleClearAll = () => {
    setSelectedTests([]);
    toast.info('All tests deselected', { autoClose: 2000 });
  };

  // Sort and filter tests
  useEffect(() => {
    let filtered = [...testOptions];

    if (searchQuery) {
      filtered = filtered.filter((test) =>
        test.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      const aSelected = selectedTests.includes(a.id);
      const bSelected = selectedTests.includes(b.id);

      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;

      if (sortOption === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortOption === 'price') {
        return a.price - b.price;
      }
      return (a.order ?? 0) - (b.order ?? 0);
    });

    setDisplayedTests(filtered);
  }, [testOptions, selectedTests, searchQuery, sortOption]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4 sm:p-6 md:p-8 flex flex-col items-center font-sans antialiased">
      <header className="w-full max-w-7xl mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-700">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">
            MediBill
          </span>
        </h1>
        <p className="text-gray-600 mt-2 text-base sm:text-lg">
          Effortless Medical Test Billing
        </p>
      </header>

      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6">
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-200 w-full max-w-sm">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
              <p className="text-gray-600 mt-2 text-sm">
                Are you sure you want to delete this test?
              </p>
              <div className="flex gap-4 mt-4">
                <button
                  onClick={confirmDelete}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all"
                >
                  <TrashIcon className="w-5 h-5" />
                  Delete
                </button>
                <button
                  onClick={cancelDelete}
                  className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all"
                >
                  <XMarkIcon className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Selected Tests Section */}
        <div
          ref={summaryCardRef}
          className="bg-white p-6 rounded-xl shadow-md border border-gray-100 w-full lg:w-1/2"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <CheckIcon className="w-6 h-6 text-green-600" />
              Selected Tests
            </h2>
            {selectedTests.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-sm text-red-600 hover:text-red-800 transition-all"
              >
                Clear All
              </button>
            )}
          </div>
          {isLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : selectedTests.length === 0 ? (
            <p className="text-gray-500">No tests selected</p>
          ) : (
            <div className="space-y-3">
              {selectedTests.map((id) => {
                const test = testOptions.find((t) => t.id === id);
                return (
                  <div
                    key={id}
                    className="flex justify-between items-center p-3 bg-green-50 rounded-lg"
                  >
                    <span className="text-gray-900 font-medium">{test?.name}</span>
                    <span className="text-gray-700 font-semibold">₹{test?.price}</span>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-4 text-lg font-bold text-gray-900">
            Total: <span ref={totalPriceRef} className="text-orange-600">₹{totalPrice}</span>
          </div>
        </div>

        {/* Test Selection and Form Section */}
        <div className="w-full lg:w-1/2 space-y-6">
          <CustomTestForm onAddTest={handleAddCustomTest} testOptions={testOptions} />

          {/* Available Tests List */}
          <div
            ref={cardRef}
            className="bg-white p-6 rounded-xl shadow-md border border-gray-100 max-h-[60vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                Available Tests
              </h2>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="p-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="default">Default</option>
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
              </select>
            </div>
            <div className="relative mb-4">
              <input
                type="text"
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search tests..."
                className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                ref={searchInputRef}
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            {isLoading ? (
              <p className="text-gray-500 text-center">Loading...</p>
            ) : displayedTests.length === 0 ? (
              <p className="text-gray-500 text-center">No tests available</p>
            ) : (
              <div className="space-y-3">
                {displayedTests.map((test) => (
                  <div
                    key={test.id}
                    className={`p-3 rounded-lg border border-gray-200 flex flex-col gap-3 ${
                      selectedTests.includes(test.id) ? 'bg-green-50' : 'bg-gray-50'
                    }`}
                  >
                    {editingTest === test.id ? (
                      <div className="space-y-3">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Test name"
                          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          type="number"
                          placeholder="Price (₹)"
                          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={handleSaveEdit}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                          >
                            <CheckIcon className="w-5 h-5" />
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                          >
                            <XMarkIcon className="w-5 h-5" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedTests.includes(test.id)}
                            onChange={() => handleCheckboxChange(test.id)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-0"
                          />
                          <span
                            onClick={() => handleCheckboxChange(test.id)}
                            className="text-gray-900 font-medium text-sm cursor-pointer hover:text-blue-600"
                          >
                            {test.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-700 font-semibold text-sm">₹{test.price}</span>
                          <button
                            onClick={() => handleEditTest(test)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            aria-label={`Edit ${test.name}`}
                          >
                            <PencilSquareIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTest(test.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            aria-label={`Delete ${test.name}`}
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="w-full max-w-7xl mt-8 text-center">
        <p className="text-gray-600 text-sm">
          Built by <span className="font-semibold text-blue-700">Akash Mukherjee</span>
        </p>
      </footer>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default MedicalTestCalculator;