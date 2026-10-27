import { Globe } from 'lucide-react';

export default function Footer() {
  const footerLinks = [
    ['FAQ', 'Investor Relations', 'Ways to Watch', 'Corporate Information', 'Netflix Originals'],
    ['Help Center', 'Jobs', 'Terms of Use', 'Contact Us'],
    ['Account', 'Redeem Gift Cards', 'Privacy', 'Speed Test'],
    ['Media Center', 'Buy Gift Cards', 'Cookie Preferences', 'Legal Notices'],
  ];

  return (
    <footer className="w-full bg-[#141414] text-[#808080] text-xs px-4 md:px-12 py-12 md:py-16 mt-16 border-t border-[#222]">
      <div className="max-w-5xl mx-auto space-y-6">
        <p className="hover:underline cursor-pointer">
          Questions? Call <span className="hover:underline">1-800-012-3456</span>
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {footerLinks.map((col, cIdx) => (
            <ul key={cIdx} className="space-y-3">
              {col.map(link => (
                <li key={link}>
                  <a href="#footer" className="hover:underline transition-colors hover:text-[#b3b3b3]">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          ))}
        </div>

        {/* Language Selector */}
        <div className="pt-2">
          <div className="inline-flex items-center gap-2 border border-[#333] px-3 py-1.5 rounded text-white bg-black/40">
            <Globe className="w-4 h-4 text-gray-400" />
            <select
              defaultValue="English"
              className="bg-transparent border-none text-xs focus:outline-none cursor-pointer"
              aria-label="Select display language"
            >
              <option value="English" className="bg-[#141414]">English</option>
              <option value="Español" className="bg-[#141414]">Español</option>
              <option value="Français" className="bg-[#141414]">Français</option>
              <option value="Deutsch" className="bg-[#141414]">Deutsch</option>
            </select>
          </div>
        </div>

        {/* Service Code & Copyright */}
        <div className="space-y-3 text-[11px] text-[#666]">
          <button className="border border-[#333] px-2 py-1 hover:text-white transition-colors">
            Service Code: 948-204
          </button>
          <p>© 1997-2026 Netflix Clone, Inc. Built for demonstrative entertainment purposes.</p>
        </div>
      </div>
    </footer>
  );
}
