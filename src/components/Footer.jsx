const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">Dream Aquatics</h3>
          <p className="text-gray-400 text-sm">
            Premium aquarium products and supplies
          </p>
          <p className="text-gray-500 text-xs mt-4">
            © {new Date().getFullYear()} Dream Aquatics. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
