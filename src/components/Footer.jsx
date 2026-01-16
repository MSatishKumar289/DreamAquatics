const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-sky-800 via-sky-700 to-sky-900 text-white py-10 shadow-inner">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2 tracking-[0.3em] uppercase text-white/90">Dream Aquatics</h3>
          <p className="text-sky-100/80 text-sm">
            Exclusive and Exotics
          </p>
          <p className="text-sky-100/60 text-xs mt-4">
            (c) {new Date().getFullYear()} Dream Aquatics. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
