# Meoulab — Μικροβιολογικό Διαγνωστικό Κέντρο

Στατικός ιστότοπος (HTML + CSS + vanilla JavaScript, χωρίς build) για το εργαστήριο
**Meoulab — Μαρία Μαίου - Ζιώγκου**, Ιατρός Μικροβιολόγος - Βιοπαθολόγος, Τρίκαλα.

## Σελίδες
- `index.html` — Αρχική
- `omada.html` — Η Ομάδα Μας
- `aimolipsies.html` — Αιμοληψίες
- `exetaseis.html` — Εργαστηριακές Εξετάσεις
- `asfalistika.html` — Ασφαλιστικά Ταμεία
- `epikoinonia.html` — Επικοινωνία (φόρμα + χάρτες)

## Δομή
- `css/style.css` — όλα τα στυλ (design system)
- `js/main.js` — carousel, μενού, φόρμα, animations
- `assets/` — λογότυπα, εικόνες, illustrations

## Τοπική προεπισκόπηση
Άνοιξε τα αρχεία μέσω τοπικού server (όχι με διπλό κλικ, για να δουλεύει η φόρμα):
```
python -m http.server 4173
```
και άνοιξε http://127.0.0.1:4173/

## Hosting
Συμβατό με GitHub Pages & Cloudflare Pages (χωρίς ρυθμίσεις build).
Η φόρμα επικοινωνίας στέλνει email μέσω FormSubmit (χρειάζεται εφάπαξ ενεργοποίηση).
