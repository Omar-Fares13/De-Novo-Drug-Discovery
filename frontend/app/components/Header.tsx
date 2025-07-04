import React from 'react';

const Header = () => {
  return (
    <header className="sticky top-0 w-full bg-white/10 backdrop-blur-lg shadow-md px-8 py-3 flex items-center justify-between z-50">
      {/* Logo */}
      <h1 className="text-xl font-bold text-white tracking-wide">HOPE</h1>

      {/* Navigation */}
      <nav>
        <ul className="flex items-center gap-6">
          <li>
            <button className="text-white font-semibold hover:text-blue-300 transition">Login</button>
          </li>
          <li>
            <button className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition">
              Try Now
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
