"use client";
import { useState } from "react";
import Link from "next/link";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => {
    setIsOpen(false);
  }; 

  return ( 
    <header className="header">
      <Link href="/" className="logo" onClick={closeMenu}>
        {/* <div className="logo-icon">
          <i className="fa-solid fa-circle-nodes"></i> 
        </div> */ }
        <span className="logo-text">
          <span className="ft" >ll</span>Pich<span className="blue-text">Flow</span>
        </span>
      </Link>

      <nav className={`nav-menu ${isOpen ? "open" : ""}`}>
        <ul className="nav-links">
          {/* Modification ici : ajout du slash '/' devant l'ancre */}
          <li> 
            <Link href="/#features" onClick={closeMenu}>Fonctionnalités</Link>
          </li>
          <li>
            <Link href="/#pricing" onClick={closeMenu}>Tarifs</Link>
          </li>
          <li>
            <Link href="/#testimonials" onClick={closeMenu}>Témoignages</Link>
          </li>
          {/* Si tu as une section témoignages plus tard, fais pareil : /#testimonials */}
        </ul>
  
        <div className="nav-auth">
          <Link href="/connexion" className="btn-text" onClick={closeMenu}>
            <i className="fa-solid fa-right-to-bracket"></i> Connexion
          </Link>
          <Link href="/inscription" className="btn-primary" onClick={closeMenu}>
            Inscription <i className="fa-solid fa-user-plus"></i>
          </Link>
        </div>
      </nav>
  
      <div className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
        <i className={`fa-solid ${isOpen ?  "fa-xmark " : "fa-bars"}`}></i>
      </div>
    </header>
  );
}; 