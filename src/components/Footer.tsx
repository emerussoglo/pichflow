import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        {/* Colonne Logo & Description */}
        <div className="footer-brand">
          <div className="footer-logo"> 
            
            <Link href="/" className="logo" >
        {/* <div className="logo-icon">
          <i className="fa-solid fa-circle-nodes"></i>
        </div> */}
        <span className="logo-text">
          <span className="ft" >ll</span>Pich<span className="blue-text">Flow</span>
        </span>
      </Link>
          </div>
          <p>
            La plateforme tout-en-un pour freelances, particuliers et PME.
Facturation, devis, marketing IA, copywriting et comptabilité automatisée.
          </p>
        </div>

       

        {/* Colonne Légal */}
        <div className="footer-links">
          <h4>Liens utiles</h4>
          <ul>
            <li><Link href="/facturation">Facturation</Link></li>
            <li><Link href="/tos">Conditions d'utilisation</Link></li>
            <li><Link href="/privacy">Politique de confidentialité</Link></li>
            <li><Link href="/support">Support</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p> &copy; 2026 Pichflow. Tous droits réservés </p>
        <div className="social-icons">
          <Link href="https://www.youtube.com/@pichflow"><i className="fa-brands fa-youtube"></i></Link>
          <Link href="https://www.tiktok.com/@pichflow"><i className="fa-brands fa-tiktok"></i></Link>
          <Link href="#"><i className="fa-brands fa-linkedin"></i></Link>
        </div>
      </div>
    </footer>
  );
};