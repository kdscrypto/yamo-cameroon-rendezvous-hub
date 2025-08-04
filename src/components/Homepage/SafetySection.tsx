
const SafetySection = () => {
  return (
    <section className="py-16 px-4 bg-card/30">
      <div className="container mx-auto">
        <div className="bg-card/50 border border-border rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">Sécurité et confidentialité</h2>
          <p className="text-white mb-6 max-w-2xl mx-auto">
            Votre sécurité est notre priorité. Nous mettons en place des mesures strictes 
            pour protéger vos données personnelles et garantir des échanges sécurisés.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-yellow-400 mb-2">🔒 Données protégées</h3>
              <p className="text-white">Vos informations personnelles sont chiffrées et sécurisées</p>
            </div>
            <div>
              <h3 className="font-semibold text-yellow-400 mb-2">✅ Modération active</h3>
              <p className="text-white">Toutes les annonces sont vérifiées avant publication</p>
            </div>
            <div>
              <h3 className="font-semibold text-yellow-400 mb-2">🚫 Anti-spam</h3>
              <p className="text-white">Protection contre les faux profils et arnaques</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SafetySection;
