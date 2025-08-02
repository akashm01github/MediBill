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
  ArrowDownTrayIcon,
  MoonIcon,
  SunIcon,
} from '@heroicons/react/24/outline';
import debounce from 'lodash/debounce';
import { gsap } from 'gsap';
import * as htmlToImage from 'html-to-image';

const initialTestOptions = [];

const MedicalTestCalculator = () => {
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
  const [isDarkMode, setIsDarkMode] = useState(false);

  const cardRef = useRef(null);
  const summaryCardRef = useRef(null);
  const searchInputRef = useRef(null);
  const totalPriceRef = useRef(null);

  // Load dark mode preference from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('isDarkMode');
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  }, []);

  // Save dark mode preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }, [isDarkMode]);

  const handleCaptureImage = () => {
    if (!summaryCardRef.current) {
      console.error('Summary card ref is null');
      toast.error('No content to capture', { autoClose: 2000 });
      return;
    }
    setIsLoading(true);
    htmlToImage
      .toPng(summaryCardRef.current)
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'medical-test-summary.png';
        link.click();
        toast.success('Image downloaded successfully', { autoClose: 2000 });
      })
      .catch((error) => {
        console.error('Error capturing image:', error);
        toast.error('Failed to capture image', { autoClose: 2000 });
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
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
      console.error('Error loading data:', error);
      toast.error('Error loading data', { autoClose: 2000 });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('testOptions', JSON.stringify(testOptions));
      localStorage.setItem('selectedTests', JSON.stringify(selectedTests));
      localStorage.setItem('nextId', nextId.toString());
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Error saving data', { autoClose: 2000 });
    }
  }, [testOptions, selectedTests, nextId]);

  const totalPrice = selectedTests.reduce((total, id) => {
    const test = testOptions.find((t) => t.id === id);
    return total + (test?.price || 0);
  }, 0);

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
            totalPriceRef.current.innerText = `₹${totalPrice}`;
          },
        }
      );
    }
  }, [totalPrice]);

  const handleSearchChange = debounce((value) => {
    setSearchQuery(value);
  }, 300);

  const handleClearSearch = () => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  };

  const handleCheckboxChange = (testId) => {
    const updatedSelected = selectedTests.includes(testId)
      ? selectedTests.filter((id) => id !== testId)
      : [testId, ...selectedTests];
    setSelectedTests(updatedSelected);
    if (cardRef.current) {
      cardRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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

  const handleEditTest = (test) => {
    setEditingTest(test.id);
    setEditName(test.name);
    setEditPrice(test.price.toString());
  };

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

  const handleCancelEdit = () => {
    setEditingTest(null);
    setEditName('');
    setEditPrice('');
  };

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

  const handleClearAll = () => {
    setSelectedTests([]);
    toast.info('All tests deselected', { autoClose: 2000 });
  };

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

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 md:p-8 flex flex-col items-center font-sans antialiased ${
        isDarkMode ? 'bg-[#1A1A1A] text-white' : 'bg-gray-200 text-gray-900'
      }`}
    >
      <style>
        {`
          .neumorphic {
            ${isDarkMode
              ? 'background: #2D2D2D; box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.5), -4px -4px 10px rgba(60, 60, 60, 0.2);'
              : 'background: #e0e5ec; box-shadow: 8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff;'}
            border-radius: 16px;
            border: none;
          }
          .neumorphic-inset {
            ${isDarkMode
              ? 'background: #3A3A3A; box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.7), inset -2px -2px 5px rgba(60, 60, 60, 0.3);'
              : 'background: #e0e5ec; box-shadow: inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff;'}
            border-radius: 12px;
            border: none;
          }
          .neumorphic-button {
            ${isDarkMode
              ? 'background: #2D2D2D; box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5), -2px -2px 5px rgba(60, 60, 60, 0.2);'
              : 'background: #e0e5ec; box-shadow: 4px 4px 8px #d1d9e6, -4px -4px 8px #ffffff;'}
            border-radius: 8px;
            transition: all 0.2s ease;
          }
          .neumorphic-button:hover {
            ${isDarkMode
              ? 'box-shadow: inset 1px 1px 3px rgba(0, 0, 0, 0.7), inset -1px -1px 3px rgba(60, 60, 60, 0.3);'
              : 'box-shadow: inset 2px 2px 4px #d1d9e6, inset -2px -2px 4px #ffffff;'}
            transform: translateY(1px);
          }
          .neumorphic-button:active {
            ${isDarkMode
              ? 'box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.7), inset -2px -2px 5px rgba(60, 60, 60, 0.3);'
              : 'box-shadow: inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff;'}
            transform: translateY(2px);
          }
          .neumorphic-checkbox {
            appearance: none;
            width: 20px;
            height: 20px;
            min-width: 20px;
            min-height: 20px;
            flex-shrink: 0;
            ${isDarkMode
              ? 'background: #3A3A3A; box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.7), inset -2px -2px 5px rgba(60, 60, 60, 0.3);'
              : 'background: #e0e5ec; box-shadow: inset 2px 2px 4px #d1d9e6, inset -2px -2px 4px #ffffff;'}
            border-radius: 50%;
            cursor: pointer;
            position: relative;
            transition: all 0.3s ease;
          }
          .neumorphic-checkbox:checked {
            ${isDarkMode
              ? `
                background: #00C4CC;
                box-shadow: inset 2px 2px 5px #00A1A8, inset -2px -2px 5px #00E6EE,
                            0 0 10px rgba(0, 196, 204, 0.7), 0 0 20px rgba(0, 196, 204, 0.5);
                animation: glow 1.5s ease-in-out infinite alternate;
              `
              : `
                background: #2dd4bf;
                box-shadow: inset 2px 2px 4px #26a69a, inset -2px -2px 4px #4ff9e0;
              `}
          }
          .neumorphic-checkbox:checked::after {
            content: '✔';
            ${isDarkMode ? 'color: #1A1A1A;' : 'color: #f1f5f9;'}
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 12px;
          }
          @keyframes glow {
            from {
              box-shadow: inset 2px 2px 5px #00A1A8, inset -2px -2px 5px #00E6EE,
                          0 0 10px rgba(0, 196, 204, 0.7), 0 0 20px rgba(0, 196, 204, 0.5);
            }
            to {
              box-shadow: inset 2px 2px 5px #00A1A8, inset -2px -2px 5px #00E6EE,
                          0 0 15px rgba(0, 196, 204, 0.9), 0 0 30px rgba(0, 196, 204, 0.7);
            }
          }
          @media (max-width: 640px) {
            .neumorphic-checkbox {
              width: 24px;
              height: 24px;
              min-width: 24px;
              min-height: 24px;
            }
            .neumorphic-checkbox:checked::after {
              font-size: 14px;
            }
          }
          .input-field {
            ${isDarkMode
              ? 'background: #3A3A3A; box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.7), inset -2px -2px 5px rgba(60, 60, 60, 0.3); color: #fff;'
              : 'background: #e0e5ec; box-shadow: inset 2px 2px 4px #d1d9e6, inset -2px -2px 4px #ffffff; color: #333;'}
            border-radius: 12px;
            padding: 8px 12px;
            border: none;
            width: 100%;
          }
          .input-field:focus {
            outline: none;
            ${isDarkMode
              ? 'box-shadow: inset 1px 1px 3px #00C4CC, inset -1px -1px 3px #00E6EE;'
              : 'box-shadow: inset 1px 1px 3px #2dd4bf, inset -1px -1px 3px #4ff9e0;'}
          }
          .select-field {
            ${isDarkMode
              ? 'background: #3A3A3A; box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.7), inset -2px -2px 5px rgba(60, 60, 60, 0.3); color: #fff;'
              : 'background: #e0e5ec; box-shadow: inset 2px 2px 4px #d1d9e6, inset -2px -2px 4px #ffffff; color: #333;'}
            border-radius: 12px;
            padding: 8px 12px;
            border: none;
            width: 150px;
          }
          .select-field:focus {
            outline: none;
            ${isDarkMode
              ? 'box-shadow: inset 1px 1px 3px #00C4CC, inset -1px -1px 3px #00E6EE;'
              : 'box-shadow: inset 1px 1px 3px #2dd4bf, inset -1px -1px 3px #4ff9e0;'}
          }
          .search-container {
            position: relative;
            width: 100%;
          }
          .search-input {
            ${isDarkMode
              ? 'background: #3A3A3A; box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.7), inset -2px -2px 5px rgba(60, 60, 60, 0.3); color: #fff;'
              : 'background: #e0e5ec; box-shadow: inset 2px 2px 4px #d1d9e6, inset -2px -2px 4px #ffffff; color: #333;'}
            border-radius: 12px;
            padding: 10px 40px 10px 40px;
            border: none;
            width: 100%;
            font-size: 16px;
            transition: box-shadow 0.2s ease;
          }
          .search-input:focus {
            outline: none;
            ${isDarkMode
              ? 'box-shadow: inset 1px 1px 3px #00C4CC, inset -1px -1px 3px #00E6EE;'
              : 'box-shadow: inset 1px 1px 3px #2dd4bf, inset -1px -1px 3px #4ff9e0;'}
          }
          .search-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            width: 20px;
            height: 20px;
            ${isDarkMode ? 'color: #A0AEC0;' : 'color: #718096;'}
          }
          .clear-icon {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            width: 20px;
            height: 20px;
            ${isDarkMode ? 'color: #A0AEC0;' : 'color: #718096;'}
            cursor: pointer;
            transition: color 0.2s ease;
          }
          .clear-icon:hover {
            ${isDarkMode ? 'color: #CBD5E0;' : 'color: #4A5568;'}
          }
          .test-card {
            padding: 12px;
            border-radius: 8px;
            transition: all 0.2s ease;
          }
          .test-card:hover {
            ${isDarkMode
              ? 'box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5), -2px -2px 5px rgba(60, 60, 60, 0.2);'
              : 'box-shadow: 4px 4px 8px #d1d9e6, -4px -4px 8px #ffffff;'}
            transform: translateY(-2px);
          }
        `}
      </style>

      <header className="w-full max-w-7xl mb-8 flex justify-between items-center">
        <div className="text-center flex-1">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            <span
              className={`bg-clip-text text-transparent ${
                isDarkMode ? 'bg-gradient-to-r from-blue-400 to-cyan-400' : 'bg-gradient-to-r from-blue-600 to-teal-500'
              }`}
            >
              MediBill
            </span>
          </h1>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-2 text-base sm:text-lg`}>
            Effortless Medical Test Billing
          </p>
        </div>
        <button
          onClick={toggleTheme}
          className="neumorphic-button p-2"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <SunIcon className="w-6 h-6 text-yellow-400" /> : <MoonIcon className="w-6 h-6 text-gray-800" />}
        </button>
      </header>

      {showDeleteConfirm && (
        <div className={`fixed inset-0 ${isDarkMode ? 'bg-black/75' : 'bg-black/50'} flex items-center justify-center z-50`}>
          <div className="neumorphic p-6 w-full max-w-sm">
            <h3 className={isDarkMode ? 'text-lg font-semibold text-white' : 'text-lg font-semibold text-gray-900'}>
              Confirm Deletion
            </h3>
            <p className={isDarkMode ? 'text-gray-400 mt-2 text-sm' : 'text-gray-600 mt-2 text-sm'}>
              Are you sure you want to delete this test?
            </p>
            <div className="flex gap-4 mt-4">
              <button
                onClick={confirmDelete}
                className={`neumorphic-button flex items-center gap-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'} px-4 py-2 text-sm`}
              >
                <TrashIcon className="w-5 h-5" />
                Delete
              </button>
              <button
                onClick={cancelDelete}
                className={`neumorphic-button flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'} px-4 py-2 text-sm`}
              >
                <XMarkIcon className="w-5 h-5" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6">
        <div
          ref={summaryCardRef}
          className="neumorphic p-6 w-full lg:w-1/2"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className={isDarkMode ? 'text-xl font-semibold text-white flex items-center gap-2' : 'text-xl font-semibold text-gray-900 flex items-center gap-2'}>
              <CheckIcon className={isDarkMode ? 'w-6 h-6 text-green-400' : 'w-6 h-6 text-green-600'} />
              Selected Tests
            </h2>
            {selectedTests.length > 0 && (
              <button
                onClick={handleClearAll}
                className={`neumorphic-button text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'} px-3 py-1`}
              >
                Clear All
              </button>
            )}
          </div>
          {isLoading && !summaryCardRef.current ? (
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Loading...</p>
          ) : selectedTests.length === 0 ? (
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>No tests selected</p>
          ) : (
            <div className="space-y-3">
              {selectedTests.map((id) => {
                const test = testOptions.find((t) => t.id === id);
                return (
                  <div
                    key={id}
                    className="neumorphic-inset flex justify-between items-center p-3"
                  >
                    <span className={isDarkMode ? 'text-white font-medium' : 'text-gray-900 font-medium'}>{test?.name}</span>
                    <span className={isDarkMode ? 'text-gray-300 font-semibold' : 'text-gray-700 font-semibold'}>₹{test?.price}</span>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-4 flex justify-between items-center">
            <div className={isDarkMode ? 'text-lg font-bold text-white' : 'text-lg font-bold text-gray-900'}>
              Total: <span ref={totalPriceRef} className={isDarkMode ? 'text-green-600' : 'text-orange-600'}>₹{totalPrice}</span>
            </div>
            <button
              onClick={handleCaptureImage}
              className={`neumorphic-button ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'} p-2`}
              disabled={isLoading}
              title="Download Summary"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="w-full lg:w-1/2 space-y-6">
          <CustomTestForm onAddTest={handleAddCustomTest} testOptions={testOptions} isDarkMode={isDarkMode} />

          <div
            ref={cardRef}
            className="neumorphic p-6 max-h-[60vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className={isDarkMode ? 'text-xl font-semibold text-white flex items-center gap-2' : 'text-xl font-semibold text-gray-900 flex items-center gap-2'}>
                <svg
                  className={isDarkMode ? 'w-6 h-6 text-cyan-400' : 'w-6 h-6 text-blue-600'}
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
                className="select-field"
              >
                <option value="default">Default</option>
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
              </select>
            </div>
            <div className="search-container mb-6">
              <input
                type="text"
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search tests..."
                className="search-input"
                ref={searchInputRef}
              />
              <MagnifyingGlassIcon className="search-icon" />
              {searchQuery && (
                <XMarkIcon
                  className="clear-icon"
                  onClick={handleClearSearch}
                />
              )}
            </div>
            {isLoading ? (
              <p className={isDarkMode ? 'text-gray-400 text-center' : 'text-gray-500 text-center'}>Loading...</p>
            ) : displayedTests.length === 0 ? (
              <p className={isDarkMode ? 'text-gray-400 text-center' : 'text-gray-500 text-center'}>No tests available</p>
            ) : (
              <div className="space-y-4">
                {displayedTests.map((test) => (
                  <div
                    key={test.id}
                    className={`test-card neumorphic-inset flex items-center justify-between p-4 ${
                      selectedTests.includes(test.id) ? (isDarkMode ? 'bg-cyan-400/10' : 'bg-green-100/50') : ''
                    }`}
                  >
                    {editingTest === test.id ? (
                      <div className="w-full space-y-3">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Test name"
                          className="input-field"
                        />
                        <input
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          type="number"
                          placeholder="Price (₹)"
                          className="input-field"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={handleSaveEdit}
                            className={`neumorphic-button flex items-center gap-2 ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'} px-4 py-2 text-sm`}
                          >
                            <CheckIcon className="w-5 h-5" />
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className={`neumorphic-button flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'} px-4 py-2 text-sm`}
                          >
                            <XMarkIcon className="w-5 h-5" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedTests.includes(test.id)}
                            onChange={() => handleCheckboxChange(test.id)}
                            className="neumorphic-checkbox"
                          />
                          <span
                            onClick={() => handleCheckboxChange(test.id)}
                            className={isDarkMode ? 'text-white font-medium text-sm cursor-pointer hover:text-cyan-400' : 'text-gray-900 font-medium text-sm cursor-pointer hover:text-blue-600'}
                          >
                            {test.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={isDarkMode ? 'text-gray-300 font-semibold text-sm' : 'text-gray-700 font-semibold text-sm'}>₹{test.price}</span>
                          <button
                            onClick={() => handleEditTest(test)}
                            className={`neumorphic-button ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'} p-1`}
                            aria-label={`Edit ${test.name}`}
                          >
                            <PencilSquareIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTest(test.id)}
                            className={`neumorphic-button ${isDarkMode ? 'text-red-400' : 'text-red-600'} p-1`}
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
        <p className={isDarkMode ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>
          All rights reserved. Copyright © 2025 <span className="font-semibold text-[#ED3500]">Akash Mukherjee</span>
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
        theme={isDarkMode ? 'dark' : 'light'}
      />
    </div>
  );
};

export default MedicalTestCalculator;