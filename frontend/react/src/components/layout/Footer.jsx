const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-4">
      <p className="text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Tax Management System KAAC. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
