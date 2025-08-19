import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-max">
        <div className="section-padding">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand & Mission */}
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center space-x-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                  <span className="text-lg font-bold text-secondary-foreground">S</span>
                </div>
                <span className="text-xl font-bold">SolidUnion</span>
              </Link>
              <p className="text-primary-foreground/80 mb-4 max-w-md">
                Connecting buyers, sellers, landlords, and opportunities across Congo. 
                Building a stronger community through commerce and collaboration.
              </p>
              <p className="text-lg font-semibold text-secondary">
                "Together, we build a stronger Congo."
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/products" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    Products
                  </Link>
                </li>
                <li>
                  <Link to="/properties" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    Properties
                  </Link>
                </li>
                <li>
                  <Link to="/jobs" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    Jobs
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-secondary" />
                  <span className="text-primary-foreground/80">Kinshasa, DRC</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-secondary" />
                  <span className="text-primary-foreground/80">contact@solidunion.cd</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-secondary" />
                  <span className="text-primary-foreground/80">+243 123 456 789</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4 mt-6">
                <a href="#" className="text-primary-foreground/80 hover:text-secondary transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-primary-foreground/80 hover:text-secondary transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-primary-foreground/80 hover:text-secondary transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-primary-foreground/60 text-sm">
              © 2024 SolidUnion. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;