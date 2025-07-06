
const ReferralLoadingState = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Chargement des données de parrainage...</p>
      </div>
    </div>
  );
};

export default ReferralLoadingState;
