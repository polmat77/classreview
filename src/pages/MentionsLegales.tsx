import { Link } from "react-router-dom";
import { ArrowLeft, Building2, Server, Shield, Palette, User, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const MentionsLegales = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Mentions Légales</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="p-8 space-y-8">
            <p className="text-sm text-muted-foreground">
              <strong>Dernière mise à jour : février 2025</strong>
            </p>

            {/* Éditeur du site */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Éditeur du site</h2>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-muted-foreground">
                <p><strong className="text-foreground">Statut :</strong> Personne physique (particulier)</p>
                <p><strong className="text-foreground">Nom et prénom :</strong> Mathieu POL</p>
                <p><strong className="text-foreground">Adresse :</strong> [ADRESSE_PLACEHOLDER]</p>
                <p><strong className="text-foreground">Email :</strong> [EMAIL_PLACEHOLDER]</p>
                <p><strong className="text-foreground">Téléphone :</strong> Non communiqué</p>
              </div>
              <p className="text-xs text-muted-foreground mt-3 italic">
                Conformément à la loi LCEN du 21 juin 2004 (article 6 III), l'éditeur d'un site à caractère 
                professionnel doit obligatoirement indiquer ses nom, prénom et domicile.
              </p>
            </section>

            <Separator />

            {/* Directeur de la publication */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Directeur de la publication</h2>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-muted-foreground"><strong className="text-foreground">Nom :</strong> Mathieu POL</p>
              </div>
            </section>

            <Separator />

            {/* Hébergeur du site web */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <Server className="h-5 w-5 text-cyan-600" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Hébergeur du site web</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-3">(LCEN art. 6 III 1°d)</p>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-muted-foreground">
                <p><strong className="text-foreground">Nom :</strong> Hostinger International Ltd</p>
                <p><strong className="text-foreground">Adresse :</strong> 61 Lordou Vironos Street, 6023 Larnaca, Chypre</p>
                <p>
                  <strong className="text-foreground">Site web :</strong>{" "}
                  <a 
                    href="https://www.hostinger.fr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    https://www.hostinger.fr
                  </a>
                </p>
                <p><strong className="text-foreground">Localisation des serveurs :</strong> Union Européenne (Pays-Bas / Lituanie)</p>
              </div>
            </section>

            <Separator />

            {/* Hébergeur des données */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Shield className="h-5 w-5 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Hébergeur des données</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-3">(Loi SREN du 21 mai 2024)</p>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-muted-foreground">
                <p>
                  <span className="text-green-500 mr-2">✅</span>
                  Les données utilisateur sont stockées <strong className="text-foreground">localement dans le navigateur</strong> (localStorage)
                </p>
                <p>
                  <span className="text-green-500 mr-2">✅</span>
                  <strong className="text-foreground">Aucun hébergeur tiers</strong> pour les données personnelles des élèves
                </p>
                <p>
                  <span className="text-amber-500 mr-2">⚠️</span>
                  Les requêtes IA transitent par : <strong className="text-foreground">Google LLC (API Gemini)</strong> via Lovable AI Gateway
                </p>
              </div>
            </section>

            <Separator />

            {/* Propriété intellectuelle */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Palette className="h-5 w-5 text-amber-600" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Propriété intellectuelle</h2>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-muted-foreground">
                <p>
                  Tous les contenus présents sur ce site (textes, logos, illustrations, code source) sont la 
                  <strong className="text-foreground"> propriété exclusive d'AIProject4You / Mathieu POL</strong>.
                </p>
                <p>
                  Les logos utilisent un style isométrique 3D avec un personnage doré représentant un enseignant.
                </p>
                <p className="text-sm">
                  Toute reproduction, représentation, modification, publication, transmission ou dénaturation, 
                  totale ou partielle, sans autorisation préalable écrite est interdite 
                  (article L.122-4 du Code de la propriété intellectuelle).
                </p>
              </div>
            </section>

            <Separator />

            {/* Crédits */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Crédits</h2>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-muted-foreground">
                <p><strong className="text-foreground">Conception et développement :</strong> Mathieu POL</p>
                <p><strong className="text-foreground">Assistance technique :</strong> Lovable.dev</p>
                <p><strong className="text-foreground">Logos et illustrations :</strong> générés via Banani.co / Banana Pro</p>
              </div>
            </section>

            <Separator />

            {/* Activité */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Activité</h2>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-muted-foreground">
                <p>
                  <strong className="text-foreground">AIProject4You</strong> propose des outils numériques d'aide à la rédaction 
                  d'appréciations scolaires destinés aux enseignants.
                </p>
                <p>
                  Ce site propose une <strong className="text-foreground">offre gratuite</strong> et une 
                  <strong className="text-foreground"> offre payante</strong> (abonnement Pro).
                </p>
                <p className="text-sm italic">
                  En l'absence de structure juridique dédiée, l'activité est exercée à titre personnel.
                </p>
              </div>
            </section>

            {/* Lien retour */}
            <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <Button variant="outline" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour à l'accueil
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/politique-confidentialite">
                  Politique de confidentialité →
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t bg-card py-6 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 AIProject4You - Mathieu POL
        </div>
      </footer>
    </div>
  );
};

export default MentionsLegales;
