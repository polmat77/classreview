import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Home } from "lucide-react";
import { STRIPE_PLANS, StripePlanKey } from "@/config/stripe";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const navigate = useNavigate();
  const { profile, refreshProfile, isAuthenticated } = useAuth();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Refresh profile to get updated balance after webhook processes
    const refresh = async () => {
      await refreshProfile();
      setLoaded(true);
    };
    if (isAuthenticated) {
      // Small delay to allow webhook to process
      const timer = setTimeout(refresh, 2000);
      return () => clearTimeout(timer);
    } else {
      setLoaded(true);
    }
  }, [isAuthenticated, refreshProfile]);

  const currentPlan = profile?.plan as StripePlanKey | undefined;
  const planInfo = currentPlan && currentPlan in STRIPE_PLANS
    ? STRIPE_PLANS[currentPlan as keyof typeof STRIPE_PLANS]
    : null;

  // Calculate expiration
  const now = new Date();
  const month = now.getMonth();
  const expiryYear = month >= 8 ? now.getFullYear() + 1 : now.getFullYear();

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8 rounded-[20px] text-center shadow-lg">
        {/* Animated checkmark */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center animate-[scale-in_0.5s_ease-out]">
            <CheckCircle className="h-12 w-12 text-secondary" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Merci pour votre achat ! 🎉
        </h1>
        <p className="text-muted-foreground mb-6">
          Votre compte a été crédité
          {planInfo ? ` de ${planInfo.students} élèves` : ""}
        </p>

        {/* Summary card */}
        {loaded && profile && (
          <div className="bg-muted/50 rounded-xl p-5 mb-6 text-left space-y-2">
            {planInfo && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pack acheté</span>
                <span className="font-medium">{planInfo.name}</span>
              </div>
            )}
            {planInfo && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Élèves crédités</span>
                <span className="font-medium">{planInfo.students}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Solde total</span>
              <span className="font-bold text-primary">
                {(profile.free_students_remaining ?? 0) + (profile.students_balance ?? 0)} élèves
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Valable jusqu'au</span>
              <span className="font-medium">31 août {expiryYear}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Button
            className="w-full bg-gradient-to-r from-accent to-accent-hover text-white"
            onClick={() => navigate("/classcouncil-ai/app")}
          >
            Commencer à générer <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" /> Retour à l'accueil
            </Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          Un email de confirmation vous a été envoyé.
        </p>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
