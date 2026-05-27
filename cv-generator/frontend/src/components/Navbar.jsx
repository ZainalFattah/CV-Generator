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
    { name: 'AI Chat', path: '/chat' },
    { name: 'Analyze CV', path: '/roast' },
  ];

  return (
    <nav className="bg-surface border-b border-border relative z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" onClick={closeMenu} className="flex-shrink-0 flex items-center group">
              <span className="font-display font-bold text-xl tracking-tight text-text">
                RetroChat<span className="text-accent">AI</span>
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => {
                const isActive = (link.path === '/' && location.pathname === '/' && !location.hash) ||
                                 (link.path !== '/' && location.pathname === link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-1 py-2 font-medium text-sm transition-colors border-b-2 ${
                      isActive
                        ? 'border-accent text-accent'
                        : 'border-transparent text-muted hover:text-text hover:border-slate-300'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-muted hover:text-text hover:bg-slate-50 focus:outline-none transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-surface absolute w-full left-0 shadow-saas-lg">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => {
              const isActive = (link.path === '/' && location.pathname === '/' && !location.hash) ||
                               (link.path !== '/' && location.pathname === link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={closeMenu}
                  className={`block px-3 py-3 rounded-lg font-medium text-base transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-accent'
                      : 'text-muted hover:bg-slate-50 hover:text-text'
                  }`}
                >
                  {link.name}
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
