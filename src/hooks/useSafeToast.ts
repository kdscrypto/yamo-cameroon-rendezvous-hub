// Hook sécurisé qui évite les erreurs si les toasts ne sont pas disponibles
export const useSafeToast = () => {
  try {
    // Essayer d'importer le hook useToast
    const { useToast } = require('@/hooks/use-toast');
    return useToast();
  } catch (error) {
    // Si le hook n'est pas disponible, retourner un objet vide avec des fonctions no-op
    console.warn('Toast hook not available, using fallback');
    return {
      toast: (options: any) => {
        console.log('Toast (fallback):', options?.title || options?.description || 'Notification');
      },
      toasts: [],
      dismiss: () => {},
    };
  }
};