import { Link } from "react-router-dom";
import { Sparkles, Github, Twitter, Linkedin } from "lucide-react";
import { useComingSoon } from "../../context/ComingSoonContext";

const footerLinks: Record<string, string[]> = {
  Product: ["Features", "Pricing", "Security", "Changelog"],
  Company: ["About", "Blog", "Careers", "Contact"],
  Resources: ["Documentation", "API", "Support", "Status"],
  Legal: ["Privacy", "Terms", "Cookies"],
};

export default function Footer() {
  const { openComingSoon } = useComingSoon();

  const handleLink = (category: string, link: string) => {
    if (link === "Features") {
      document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    openComingSoon({
      title: link,
      description: `${link} for AetherAI Enterprise Hub is being prepared. Check back soon.`,
      feature: category,
    });
  };

  return (
    <footer className="border-t border-white/10 bg-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aether-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white">AetherAI</span>
            </Link>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              AI-powered internal collaboration platform for modern companies.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[
                { Icon: Twitter, label: "Twitter" },
                { Icon: Github, label: "GitHub" },
                { Icon: Linkedin, label: "LinkedIn" },
              ].map(({ Icon, label }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() =>
                    openComingSoon({
                      title: `${label} Profile`,
                      description: `Follow AetherAI on ${label} for product updates and announcements.`,
                      feature: "Social",
                    })
                  }
                  className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-white mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <button
                      type="button"
                      onClick={() => handleLink(category, link)}
                      className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} AetherAI Enterprise Hub. All rights reserved.
          </p>
          <p className="text-sm text-gray-600">
            Built with care for modern enterprises.
          </p>
        </div>
      </div>
    </footer>
  );
}
