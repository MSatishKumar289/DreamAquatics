import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-sky-800 via-sky-700 to-sky-900 text-white py-10 shadow-inner">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="mb-2 flex items-baseline justify-center leading-none text-white/90">
            <span className="text-2xl font-extrabold tracking-[0.2em]">D</span>
            <span className="-ml-0.5 text-lg font-semibold tracking-[0.2em]">REAM</span>
            <span className="ml-0.5 text-2xl font-extrabold tracking-[0.2em]">A</span>
            <span className="-ml-0.5 text-lg font-semibold tracking-[0.2em]">QUATICS</span>
          </h3>
          <p className="text-sky-100/80 text-sm">
            Exclusive and Exotics
          </p>
          <div className="mt-3">
            <Link
              to="/terms"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-100/80 hover:text-white"
            >
              Terms & Conditions
            </Link>
          </div>
          <p className="text-sky-100/60 text-xs mt-4">
            (c) {new Date().getFullYear()} DreamAquatics. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
