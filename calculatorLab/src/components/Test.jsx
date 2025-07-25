import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// Original test options (20 tests)
const testOptions = [
  { name: 'Blood Test', price: 300 },
  { name: 'Lipid Profile', price: 500 },
  { name: 'Urine Analysis', price: 200 },
  { name: 'Thyroid Function Test', price: 400 },
  { name: 'Diabetes HbA1c Test', price: 350 },
  { name: 'Liver Function Test', price: 450 },
  { name: 'Kidney Function Test', price: 400 },
  { name: 'Complete Blood Count', price: 250 },
  { name: 'Vitamin D Test', price: 600 },
  { name: 'Iron Profile', price: 350 },
  { name: 'Electrolyte Panel', price: 300 },
  { name: 'CRP Test', price: 400 },
  { name: 'ESR Test', price: 200 },
  { name: 'Blood Glucose Fasting', price: 150 },
  { name: 'Hormone Panel', price: 700 },
  { name: 'Allergy Test', price: 800 },
  { name: 'Calcium Test', price: 250 },
  { name: 'Magnesium Test', price: 300 },
  { name: 'Prothrombin Time', price: 350 },
  { name: 'Lipase Test', price: 400 },
];

const MedicalTestCalculator = () => {
  const [selectedTests, setSelectedTests] = useState([]);
  const [displayedTests, setDisplayedTests] = useState(testOptions);
  const [searchQuery, setSearchQuery] = useState('');
  const cardRef = useRef(null);
  const summaryCardRef = useRef(null);
  const totalPriceRef = useRef(null);
  const testRefs = useRef([]);
  const searchInputRef = useRef(null);

  // Handle checkbox changes
  const handleCheckboxChange = (testName, index) => {
    const isSelected = selectedTests.includes(testName);
    setSelectedTests((prev) =>
      isSelected
        ? prev.filter((name) => name !== testName)
        : [...prev, testName]
    );

    // Reorder tests: move checked item to top, unchecked back to original position
    setDisplayedTests((prev) => {
      let newOrder = [...prev];
      const testIndex = newOrder.findIndex((t) => t.name === testName);

      if (!isSelected) {
        // Move to top
        const [selectedTest] = newOrder.splice(testIndex, 1);
        newOrder.unshift(selectedTest);
      } else {
        // When deselecting, check if the test matches the search query
        if (searchQuery && !testName.toLowerCase().includes(searchQuery.toLowerCase())) {
          // If it doesn't match the search query, remove it from displayedTests
          newOrder = newOrder.filter((t) => t.name !== testName);
        } else {
          // If it matches or no search query, restore to original position
          const originalIndex = testOptions.findIndex((t) => t.name === testName);
          const [unselectedTest] = newOrder.splice(testIndex, 1);
          newOrder.splice(originalIndex, 0, unselectedTest);
        }
      }

      // Apply search filter to ensure consistency
      newOrder = newOrder.filter((test) =>
        searchQuery ? test.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
      );

      // Sort to keep selected tests at the top
      newOrder.sort((a, b) => {
        const aSelected = selectedTests.includes(a.name);
        const bSelected = selectedTests.includes(b.name);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return 0;
      });

      return newOrder;
    });

    // Animate the checkbox label background
    gsap.to(testRefs.current[index], {
      backgroundColor: isSelected ? '#f9fafb' : '#d1fae5',
      duration: 0.2,
      ease: 'power2.out',
    });

    // Animate the movement of the test item
    gsap.to(testRefs.current[index], {
      y: isSelected ? 0 : -20,
      duration: 0.4,
      ease: 'power3.out',
    });
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter tests based on search query
    let filteredTests = testOptions
      .filter((test) => test.name.toLowerCase().includes(query))
      .sort((a, b) => {
        const aSelected = selectedTests.includes(a.name);
        const bSelected = selectedTests.includes(b.name);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return testOptions.findIndex((t) => t.name === a.name) - testOptions.findIndex((t) => t.name === b.name);
      });

    setDisplayedTests(filteredTests);

    // Animate filtered results
    gsap.fromTo(
      testRefs.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', stagger: 0.05 }
    );
  };

  // Clear search input
  const clearSearch = () => {
    setSearchQuery('');
    setDisplayedTests(
      testOptions.sort((a, b) => {
        const aSelected = selectedTests.includes(a.name);
        const bSelected = selectedTests.includes(b.name);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return testOptions.findIndex((t) => t.name === a.name) - testOptions.findIndex((t) => t.name === b.name);
      })
    );
    gsap.fromTo(
      testRefs.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', stagger: 0.05 }
    );
  };

  // Calculate total price
  const totalPrice = selectedTests.reduce((total, name) => {
    const test = testOptions.find((t) => t.name === name);
    return total + (test?.price || 0);
  }, 0);

  // Animate main card entrance on mount
  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    );
  }, []);

  // Animate summary card entrance on mount
  useEffect(() => {
    gsap.fromTo(
      summaryCardRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.2 }
    );
  }, []);

  // Animate search input focus
  useEffect(() => {
    gsap.fromTo(
      searchInputRef.current,
      { scale: 0.95, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out' }
    );
  }, []);

  // Animate total price update
  useEffect(() => {
    gsap.to(totalPriceRef.current, {
      innerText: totalPrice,
      duration: 0.4,
      snap: { innerText: 1 },
      ease: 'power1.out',
      onUpdate: function () {
        totalPriceRef.current.innerText = `₹${Math.round(this.targets()[0].innerText)}`;
      },
    });
  }, [totalPrice]);

  // Animate test reordering
  useEffect(() => {
    testRefs.current.forEach((el, index) => {
      if (el) {
        gsap.to(el, {
          y: 0,
          duration: 0.4,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      }
    });
  }, [displayedTests]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row items-center justify-center p-4 sm:p-6 gap-6">
       {/* Summary Card */}
      <div
        ref={summaryCardRef}
        className="bg-white shadow-md rounded-xl p-6 sm:p-8 w-full max-w-lg border border-gray-200"
        role="region"
        aria-label="Selected Tests Summary"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Selected Tests</h2>
          <p className="text-sm text-gray-600 mt-1">
            Review your selected tests and total cost
          </p>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {selectedTests.length === 0 ? (
            <p className="text-center text-gray-600">No tests selected</p>
          ) : (
            selectedTests.map((testName) => {
              const test = testOptions.find((t) => t.name === testName);
              return (
                <div
                  key={testName}
                  className="flex items-center justify-between p-3 rounded-lg bg-emerald-50"
                >
                  <span className="text-base font-medium text-gray-700">{testName}</span>
                  <span className="text-sm font-semibold text-gray-600">₹{test?.price}</span>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900">
            Total Price: <span ref={totalPriceRef} className="text-blue-600">₹0</span>
          </h3>
        </div>
      </div>
      {/* Main Selection Card */}
      <div
        ref={cardRef}
        className="bg-white shadow-md rounded-xl p-6 sm:p-8 w-full max-w-lg border border-gray-200"
        role="region"
        aria-label="Medical Test Calculator"
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">Maji Brother's Lab</h1>
          <p className="text-sm text-gray-600 mt-1">
            Select your medical tests to calculate the total cost
          </p>
        </div>

        {/* Search Input */}
        <div className="mb-4 relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search tests..."
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700 placeholder-gray-400"
            aria-label="Search medical tests"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <form className="space-y-3 max-h-[400px] overflow-y-auto">
          {displayedTests.length === 0 ? (
            <p className="text-center text-gray-600">No tests found</p>
          ) : (
            displayedTests.map((test, index) => (
              <div
                key={test.name}
                ref={(el) => (testRefs.current[index] = el)}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors duration-200 ${
                  selectedTests.includes(test.name) ? 'bg-emerald-50' : 'bg-gray-50'
                } hover:bg-gray-100`}
                role="option"
                aria-selected={selectedTests.includes(test.name)}
              >
                <label className="flex items-center gap-3 text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTests.includes(test.name)}
                    onChange={() => handleCheckboxChange(test.name, index)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    aria-label={`Select ${test.name}`}
                  />
                  <span className="text-base font-medium">{test.name}</span>
                </label>
                <span className="text-sm font-semibold text-gray-600">₹{test.price}</span>
              </div>
            ))
          )}
        </form>
      </div>

     
    </div>
  );
};

export default MedicalTestCalculator;