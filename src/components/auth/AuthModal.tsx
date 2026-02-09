import { useState } from 'react';
import { X, Mail, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Google icon SVG component
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

// Apple icon SVG component
const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, signInWithGoogle, signInWithApple, signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingApple, setIsLoadingApple] = useState(false);
  const [isLoadingMagicLink, setIsLoadingMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoadingGoogle(true);
    try {
      await signInWithGoogle();
      closeAuthModal();
    } catch (err) {
      toast.error('Erreur lors de la connexion Google');
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoadingApple(true);
    try {
      await signInWithApple();
      closeAuthModal();
    } catch (err) {
      toast.error('Erreur lors de la connexion Apple');
    } finally {
      setIsLoadingApple(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Veuillez entrer votre adresse email');
      return;
    }

    setIsLoadingMagicLink(true);
    try {
      const { error } = await signInWithMagicLink(email);
      if (error) {
        toast.error('Erreur lors de l\'envoi du lien magique');
      } else {
        setMagicLinkSent(true);
        toast.success('Lien magique envoyé ! Vérifiez votre boîte mail.');
      }
    } catch (err) {
      toast.error('Erreur lors de l\'envoi du lien magique');
    } finally {
      setIsLoadingMagicLink(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeAuthModal();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleOverlayClick}
    >
      <div className="relative w-full max-w-md bg-white rounded-[20px] shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-[#1a2332] mb-2">
              Connectez-vous pour générer
            </h2>
            <p className="text-sm text-slate-500">
              Créez un compte gratuit — <span className="text-amber-600 font-medium">5 élèves offerts</span> pour tester
            </p>
          </div>

          {magicLinkSent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-[#1a2332] mb-2">
                Vérifiez votre boîte mail
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Nous avons envoyé un lien de connexion à <strong>{email}</strong>
              </p>
              <Button
                variant="ghost"
                onClick={() => setMagicLinkSent(false)}
                className="text-amber-600 hover:text-amber-700"
              >
                Utiliser une autre adresse
              </Button>
            </div>
          ) : (
            <>
              {/* Google Sign In */}
              <Button
                onClick={handleGoogleSignIn}
                disabled={isLoadingGoogle}
                className="w-full h-12 bg-white hover:bg-slate-50 text-slate-700 font-medium border border-slate-300 rounded-xl shadow-sm transition-all hover:shadow-md disabled:opacity-50"
              >
                {isLoadingGoogle ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <GoogleIcon />
                    <span className="ml-3">Continuer avec Google</span>
                  </>
                )}
              </Button>

              {/* Apple Sign In */}
              <Button
                onClick={handleAppleSignIn}
                disabled={isLoadingApple}
                className="w-full h-12 mt-3 bg-black hover:bg-black/90 text-white font-medium border border-black rounded-xl shadow-sm transition-all hover:shadow-md disabled:opacity-50"
              >
                {isLoadingApple ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <AppleIcon />
                    <span className="ml-3">Continuer avec Apple</span>
                  </>
                )}
              </Button>

              {/* Separator */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-slate-400">ou</span>
                </div>
              </div>

              {/* Magic Link Form */}
              <form onSubmit={handleMagicLink} className="space-y-4">
                <Input
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl border-slate-300 focus:border-amber-500 focus:ring-amber-500"
                  disabled={isLoadingMagicLink}
                />
                <Button
                  type="submit"
                  disabled={isLoadingMagicLink || !email.trim()}
                  className="w-full h-12 bg-transparent hover:bg-slate-50 text-[#2c3e50] font-medium border-2 border-[#2c3e50] rounded-xl transition-all disabled:opacity-50"
                >
                  {isLoadingMagicLink ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      Recevoir un lien magique
                    </>
                  )}
                </Button>
              </form>
            </>
          )}

          {/* Legal Text */}
          <p className="mt-6 text-xs text-center text-slate-400 leading-relaxed">
            En continuant, vous acceptez nos{' '}
            <a href="/mentions-legales" className="text-amber-600 hover:underline">
              CGV
            </a>{' '}
            et notre{' '}
            <a href="/confidentialite" className="text-amber-600 hover:underline">
              politique de confidentialité
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
