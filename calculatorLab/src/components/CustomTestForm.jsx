import React, { useState, useEffect, useRef } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { gsap } from 'gsap';

const CustomTestForm = ({ onAddTest, testOptions, isDarkMode }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const formRef = useRef(null);
  const overlayRef = useRef(null);

  const isDuplicate = testOptions.some(
    (test) => test.name.toLowerCase() === name.trim().toLowerCase()
  );

  useEffect(() => {
    if (isFormOpen) {
      formRef.current.style.display = 'block';
      overlayRef.current.style.display = 'block';
      gsap.fromTo(
        formRef.current,
        { y: 50, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: 'power2.out',
        }
      );
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
    } else {
      gsap.to(formRef.current, {
        y: 50,
        opacity: 0,
        scale: 0.95,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          formRef.current.style.display = 'none';
        },
      });
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          overlayRef.current.style.display = 'none';
        },
      });
    }
  }, [isFormOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || isNaN(price) || Number(price) <= 0) {
      toast.error('Please enter a valid test name and price', { autoClose: 2000 });
      return;
    }

    if (isDuplicate) {
      toast.error(`Test "${name.trim()}" already exists`, { autoClose: 2000 });
      return;
    }

    onAddTest({ name: name.trim(), price: Number(price) });
    setName('');
    setPrice('');
    setIsFormOpen(false);
  };

  const toggleForm = () => {
    setIsFormOpen(!isFormOpen);
  };

  return (
    <div className="relative">
      <style>
        {`
          .neumorphic {
            ${isDarkMode
              ? 'background: #2D2D2D; box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.5), -4px -4px 10px rgba(60, 60, 60, 0.2);'
              : 'background: #e0e5ec; box-shadow: 4px 4px 8px #d1d9e6, -4px -4px 8px #ffffff;'}
            border-radius: 16px;
            border: none;
          }
          .neumorphic-inset {
            ${isDarkMode
              ? 'background: #3A3A3A; box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.7), inset -2px -2px 5px rgba(60, 60, 60, 0.3);'
              : 'background: #e0e5ec; box-shadow: inset 2px 2px 4px #d1d9e6, inset -2px -2px 4px #ffffff;'}
            border-radius: 12px;
            border: none;
          }
          .neumorphic-button {
            ${isDarkMode
              ? 'background: #2D2D2D; box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5), -2px -2px 5px rgba(60, 60, 60, 0.2);'
              : 'background: #e0e5ec; box-shadow: 2px 2px 4px #d1d9e6, -2px -2px 4px #ffffff;'}
            border-radius: 8px;
            transition: all 0.2s ease;
          }
          .neumorphic-button:hover {
            ${isDarkMode
              ? 'box-shadow: inset 1px 1px 3px rgba(0, 0, 0, 0.7), inset -1px -1px 3px rgba(60, 60, 60, 0.3);'
              : 'box-shadow: inset 1px 1px 2px #d1d9e6, inset -1px -1px 2px #ffffff;'}
            transform: translateY(1px);
          }
          .neumorphic-button:active {
            ${isDarkMode
              ? 'box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.7), inset -2px -2px 5px rgba(60, 60, 60, 0.3);'
              : 'box-shadow: inset 2px 2px 4px #d1d9e6, inset -2px -2px 4px #ffffff;'}
            transform: translateY(2px);
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
        `}
      </style>
      {isFormOpen && (
        <div
          ref={overlayRef}
          className={`fixed inset-0 ${isDarkMode ? 'bg-black/75' : 'bg-black/50'} z-10`}
          onClick={toggleForm}
          aria-label="Close form"
        />
      )}

      <button
        onClick={toggleForm}
        className={`neumorphic-button fixed bottom-6 right-6 ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'} p-3 z-20 flex items-center justify-center`}
        aria-label="Add new test"
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      {isFormOpen && (
        <div
          ref={formRef}
          className="neumorphic fixed bottom-24 right-6 p-6 w-80 z-30"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className={isDarkMode ? 'text-xl font-semibold text-white flex items-center gap-2' : 'text-xl font-semibold text-gray-900 flex items-center gap-2'}>
              <PlusIcon className={isDarkMode ? 'w-6 h-6 text-cyan-400' : 'w-6 h-6 text-blue-600'} />
              Add Custom Test
            </h2>
            <button
              onClick={toggleForm}
              className={`neumorphic-button ${isDarkMode ? 'text-red-400' : 'text-red-600'} p-1 rounded-full`}
              aria-label="Close form"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="testName" className={isDarkMode ? 'block text-sm font-medium text-gray-300' : 'block text-sm font-medium text-gray-700'}>
                Test Name
              </label>
              <input
                id="testName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter test name"
                className={`input-field ${isDuplicate && name.trim() ? (isDarkMode ? 'text-red-400' : 'text-red-500') : ''}`}
              />
              {isDuplicate && name.trim() && (
                <p className={isDarkMode ? 'text-red-400 text-xs mt-1' : 'text-red-500 text-xs mt-1'}>Test name already exists</p>
              )}
            </div>
            <div>
              <label htmlFor="testPrice" className={isDarkMode ? 'block text-sm font-medium text-gray-300' : 'block text-sm font-medium text-gray-700'}>
                Price (₹)
              </label>
              <input
                id="testPrice"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price"
                className="input-field"
              />
            </div>
            <button
              type="submit"
              disabled={isDuplicate || !name.trim() || !price || Number(price) <= 0}
              className={`neumorphic-button w-full flex items-center justify-center gap-2 ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'} px-4 py-2 text-sm ${
                isDuplicate || !name.trim() || !price || Number(price) <= 0
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              <PlusIcon className="w-5 h-5" />
              Add Test
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CustomTestForm;