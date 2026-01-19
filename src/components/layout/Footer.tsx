import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-max">
        <div className="section-padding">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center space-x-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                  <span className="text-lg font-bold text-secondary-foreground">
                    S
                  </span>
                </div>
                <span className="text-xl font-bold">SolidUnion</span>
              </Link>
              <p className="text-primary-foreground/80 mb-4 max-w-md">
                Connecter acheteurs, vendeurs, propriétaires et opportunités à
                travers le Congo. Bâtir une communauté plus forte grâce au
                commerce et à la collaboration.
              </p>
              <p className="text-lg font-semibold text-secondary">
                "Ensemble, nous construisons un Congo plus fort."
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Liens Rapides</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/products"
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    Produits
                  </Link>
                </li>
                <li>
                  <Link
                    to="/properties"
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    Biens Immobiliers
                  </Link>
                </li>
                <li>
                  <Link
                    to="/jobs"
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    Emplois
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    À Propos
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-secondary" />
                  <span className="text-primary-foreground/80">
                    Kinshasa, RDC
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-secondary" />
                  <span className="text-primary-foreground/80">
                    contact@solidunion.cd
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-secondary" />
                  <span className="text-primary-foreground/80">
                    +243 123 456 789
                  </span>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <a
                  href="#"
                  className="text-primary-foreground/80 hover:text-secondary transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-primary-foreground/80 hover:text-secondary transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-primary-foreground/80 hover:text-secondary transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-primary-foreground/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-primary-foreground/60 text-sm">
              © 2024 SolidUnion. Tous droits réservés.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                to="/privacy"
                className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors"
              >
                Politique de Confidentialité
              </Link>
              <Link
                to="/terms"
                className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors"
              >
                Conditions d'Utilisation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
