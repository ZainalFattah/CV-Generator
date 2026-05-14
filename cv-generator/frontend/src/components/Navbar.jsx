import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/#about' },
  ];

  return (
    <nav className="border-b-2 border-border bg-surface text-text relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" onClick={closeMenu} className="flex-shrink-0 flex items-center group">
              <span className="font-display font-bold text-xl uppercase tracking-widest text-accent group-hover:text-white transition-colors">RetroChat AI</span>
              <span className="ml-2 blink text-accent group-hover:text-white">_</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => {
                const isActive = (link.path === '/' && location.pathname === '/' && !location.hash) ||
                                 (link.path === '/#about' && location.hash === '#about');
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-3 py-2 uppercase font-bold text-sm tracking-wider transition-colors ${
                      isActive
                        ? 'bg-border text-bg'
                        : 'text-text hover:bg-[#001100] hover:text-white border border-transparent hover:border-border'
                    }`}
                  >
                    {isActive ? `[ ${link.name} ]` : link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-text hover:text-white hover:bg-[#001100] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-border transition-colors border border-transparent hover:border-border"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6 text-accent" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6 text-accent" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-surface absolute w-full left-0">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => {
              const isActive = (link.path === '/' && location.pathname === '/' && !location.hash) ||
                               (link.path === '/#about' && location.hash === '#about');
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={closeMenu}
                  className={`block px-3 py-2 uppercase font-bold text-base tracking-wider transition-colors ${
                    isActive
                      ? 'bg-border text-bg'
                      : 'text-text hover:bg-[#001100] hover:text-white border border-transparent hover:border-border'
                  }`}
                >
                  {isActive ? `> ${link.name}` : link.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
