import { Link } from 'react-router-dom';
import { useState } from 'react';
import dropdownIcon from '../assets/Icons/dropdown.png';

const Footer = () => {
  const [feedbackText, setFeedbackText] = useState('');
  const [openMobileSection, setOpenMobileSection] = useState('about');

  const feedbackHref = `https://wa.me/918667418965?text=${encodeURIComponent(
    feedbackText.trim()
      ? `Hi DreamAquatics, I want to share my feedback:\n${feedbackText.trim()}`
      : 'Hi DreamAquatics, I want to share my feedback.'
  )}`;

  const mobileSections = [
    { id: 'about', title: 'About Us' },
    { id: 'shop', title: 'Shop' },
    { id: 'care', title: 'Customer Care' },
    { id: 'touch', title: 'Get In Touch' },
    { id: 'feedback', title: 'Share Your Feedback' },
    { id: 'disclaimer', title: 'Address & Disclaimer' },
  ];

  return (
    <footer className="bg-gradient-to-r from-sky-800 via-sky-700 to-sky-900 py-10 text-white shadow-inner">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-white/25 pb-3 text-center text-xs uppercase tracking-[0.24em] text-sky-100/80">
          DreamAquatics
        </div>

        <div className="mt-8 hidden gap-8 sm:grid-cols-2 lg:grid lg:grid-cols-5">
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">About Us</h4>
            <div className="mt-4 space-y-2 text-sm text-sky-100/85">
              <p>DreamAquatics</p>
              <p>Exclusive and Exotics</p>
              <p>Premium Aquarium Studio</p>
              <p>Custom Builds and Maintenance</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Shop</h4>
            <div className="mt-4 space-y-2 text-sm">
              <Link to="/category/fishes" className="block text-sky-100/85 hover:text-white">Fishes</Link>
              <Link to="/category/live-plants" className="block text-sky-100/85 hover:text-white">Live Plants</Link>
              <Link to="/category/accessories" className="block text-sky-100/85 hover:text-white">Tanks & Accessories</Link>
              <Link to="/category/tank" className="block text-sky-100/85 hover:text-white">Fish Food & Medicines</Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Customer Care</h4>
            <div className="mt-4 space-y-2 text-sm">
              <Link to="/terms" className="block text-sky-100/85 hover:text-white">Terms and Conditions</Link>
              <a href="https://wa.me/918667418965" target="_blank" rel="noopener noreferrer" className="block text-sky-100/85 hover:text-white">
                WhatsApp Support
              </a>
              <a href="tel:+918667418965" className="block text-sky-100/85 hover:text-white">
                Call Support
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Get In Touch</h4>
            <div className="mt-4 space-y-2 text-sm text-sky-100/85">
              <a href="tel:+918667418965" className="block hover:text-white">+91 86674 18965</a>
              <a href="https://wa.me/918667418965" target="_blank" rel="noopener noreferrer" className="block hover:text-white">
                WhatsApp Us
              </a>
              <p>India</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Share Your Feedback</h4>
            <div className="mt-4">
              <p className="text-sm leading-relaxed text-sky-100/80">
                Tell us what you loved, what can be better, and what you want to see next.
              </p>
              <textarea
                value={feedbackText}
                onChange={(event) => setFeedbackText(event.target.value)}
                placeholder="Type your feedback"
                rows={3}
                className="mt-3 w-full rounded-md border border-white/45 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-sky-100/70 focus:outline-none focus:ring-2 focus:ring-white/40"
              />
              <a
                href={feedbackHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-md border border-white/45 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Share on WhatsApp
                <span aria-hidden="true">-></span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 border-y border-white/25 lg:hidden">
          {mobileSections.map((section) => (
            <div key={section.id} className="border-b border-white/20 last:border-b-0">
              <button
                type="button"
                onClick={() => setOpenMobileSection((prev) => (prev === section.id ? '' : section.id))}
                className="flex w-full items-center justify-between py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-white"
              >
                <span>{section.title}</span>
                <img
                  src={dropdownIcon}
                  alt=""
                  aria-hidden="true"
                  className={`h-3 w-3 object-contain transition-transform duration-200 ${
                    openMobileSection === section.id ? 'rotate-180' : 'rotate-0'
                  }`}
                />
              </button>

              {openMobileSection === section.id && section.id === 'about' && (
                <div className="space-y-1 pb-3 text-sm text-sky-100/85">
                  <p>DreamAquatics</p>
                  <p>Exclusive and Exotics</p>
                  <p>Premium Aquarium Studio</p>
                  <p>Custom Builds and Maintenance</p>
                </div>
              )}

              {openMobileSection === section.id && section.id === 'shop' && (
                <div className="space-y-1 pb-3 text-sm">
                  <Link to="/category/fishes" className="block text-sky-100/85 hover:text-white">Fishes</Link>
                  <Link to="/category/live-plants" className="block text-sky-100/85 hover:text-white">Live Plants</Link>
                  <Link to="/category/accessories" className="block text-sky-100/85 hover:text-white">Tanks & Accessories</Link>
                  <Link to="/category/tank" className="block text-sky-100/85 hover:text-white">Fish Food & Medicines</Link>
                </div>
              )}

              {openMobileSection === section.id && section.id === 'care' && (
                <div className="space-y-1 pb-3 text-sm">
                  <Link to="/terms" className="block text-sky-100/85 hover:text-white">Terms and Conditions</Link>
                  <a href="https://wa.me/918667418965" target="_blank" rel="noopener noreferrer" className="block text-sky-100/85 hover:text-white">
                    WhatsApp Support
                  </a>
                  <a href="tel:+918667418965" className="block text-sky-100/85 hover:text-white">
                    Call Support
                  </a>
                </div>
              )}

              {openMobileSection === section.id && section.id === 'touch' && (
                <div className="space-y-1 pb-3 text-sm text-sky-100/85">
                  <a href="tel:+918667418965" className="block hover:text-white">+91 86674 18965</a>
                  <a href="https://wa.me/918667418965" target="_blank" rel="noopener noreferrer" className="block hover:text-white">
                    WhatsApp Us
                  </a>
                  <p>India</p>
                </div>
              )}

              {openMobileSection === section.id && section.id === 'feedback' && (
                <div className="pb-3">
                  <textarea
                    value={feedbackText}
                    onChange={(event) => setFeedbackText(event.target.value)}
                    placeholder="Type your feedback"
                    rows={3}
                    className="w-full rounded-md border border-white/45 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-sky-100/70 focus:outline-none focus:ring-2 focus:ring-white/40"
                  />
                  <a
                    href={feedbackHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-2 rounded-md border border-white/45 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Share on WhatsApp
                    <span aria-hidden="true">-></span>
                  </a>
                </div>
              )}

              {openMobileSection === section.id && section.id === 'disclaimer' && (
                <div className="space-y-2 pb-3 text-xs leading-relaxed text-sky-100/85">
                  <p>
                    Address: AM Complex, Near to Veveham Kids School, Anna Nagar, Dharapuram Main Road, Dharapuram-638656, Tamil Nadu
                  </p>
                  <p>* Images are for reference. Actual product appearance may vary. *</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-white/25 pt-4 text-center text-xs text-sky-100/70">
          <p className="mb-2 hidden text-sky-100/85 lg:block">
            Address: AM Complex, Near to Veveham Kids School, Anna Nagar, Dharapuram Main Road, Dharapuram-638656, Tamil Nadu
          </p>
          (c) {new Date().getFullYear()} DreamAquatics. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
