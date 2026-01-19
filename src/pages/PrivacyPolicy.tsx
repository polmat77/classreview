import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Server, Globe, UserCheck, Cookie, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PrivacyPolicy = () => {
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
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Politique de confidentialité</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none p-8">
            <p className="text-sm text-muted-foreground mb-8">
              <strong>Dernière mise à jour : janvier 2025</strong>
            </p>

            {/* Section 1 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                <span className="text-primary">1.</span> Présentation de l'application
              </h2>
              <p className="text-muted-foreground">
                <strong>ClassCouncil AI</strong> est une application web destinée aux professeurs principaux 
                pour les aider à préparer les conseils de classe. Elle permet d'analyser les résultats 
                des élèves et de générer des appréciations personnalisées à l'aide de l'intelligence artificielle.
              </p>
            </section>

            <Separator className="my-6" />

            {/* Section 2 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                <span className="text-primary">2.</span> Responsable du traitement
              </h2>
              <p className="text-muted-foreground">
                Cette application est un outil mis à disposition des enseignants. L'utilisateur 
                (professeur principal) est considéré comme responsable des données qu'il importe 
                dans l'application dans le cadre de ses missions éducatives.
              </p>
            </section>

            <Separator className="my-6" />

            {/* Section 3 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                <span className="text-primary">3.</span> Données traitées
              </h2>
              <p className="text-muted-foreground mb-4">
                L'application peut traiter les données suivantes, issues des fichiers importés par l'utilisateur :
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type de donnée</TableHead>
                    <TableHead>Exemples</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Identité</TableCell>
                    <TableCell>Noms, prénoms des élèves</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Scolarité</TableCell>
                    <TableCell>Classe, niveau</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Résultats</TableCell>
                    <TableCell>Notes, moyennes par matière</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Appréciations</TableCell>
                    <TableCell>Commentaires des professeurs</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Attributions</TableCell>
                    <TableCell>Avertissements, encouragements, félicitations</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-amber-700 dark:text-amber-400 text-sm">
                  ⚠️ <strong>Ces données concernent potentiellement des mineurs</strong> et bénéficient 
                  d'une protection renforcée.
                </p>
              </div>
            </section>

            <Separator className="my-6" />

            {/* Section 4 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                <Server className="h-6 w-6 text-primary" />
                <span className="text-primary">4.</span> Comment vos données sont-elles traitées ?
              </h2>
              
              <h3 className="text-lg font-semibold mt-6 mb-3">4.1 Traitement local (dans votre navigateur)</h3>
              <p className="text-muted-foreground mb-4">
                Les opérations suivantes sont effectuées <strong>localement sur votre ordinateur</strong>, 
                sans transmission à un serveur externe :
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✅</span>
                  Lecture et analyse des fichiers importés (CSV, PDF)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✅</span>
                  Calcul des moyennes générales et par matière
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✅</span>
                  Analyse des appréciations pour détecter les problèmes de conduite
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✅</span>
                  Suggestion automatique des attributions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✅</span>
                  Stockage temporaire des données pendant votre session
                </li>
              </ul>
              <p className="text-muted-foreground mt-4 font-medium">
                Aucune de ces données n'est envoyée à nos serveurs.
              </p>

              <h3 className="text-lg font-semibold mt-8 mb-3">4.2 Génération des appréciations par Intelligence Artificielle</h3>
              <p className="text-muted-foreground mb-4">
                Lorsque vous utilisez la fonctionnalité de <strong>génération automatique d'appréciations</strong>, 
                certaines données sont transmises à un service d'IA externe.
              </p>

              <h4 className="font-semibold mt-4 mb-2">Prestataire utilisé</h4>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Fournisseur</TableCell>
                    <TableCell>OpenAI (ChatGPT)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Siège social</TableCell>
                    <TableCell>San Francisco, États-Unis 🇺🇸</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Localisation des serveurs</TableCell>
                    <TableCell>États-Unis</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Politique de confidentialité</TableCell>
                    <TableCell>
                      <a 
                        href="https://openai.com/privacy" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        openai.com/privacy
                      </a>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <h4 className="font-semibold mt-6 mb-2">Données transmises à OpenAI</h4>
              <p className="text-muted-foreground mb-4">
                Pour protéger la vie privée des élèves, nous appliquons une <strong>stratégie d'anonymisation</strong> :
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Donnée</TableHead>
                    <TableHead>Transmise à OpenAI ?</TableHead>
                    <TableHead>Détail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Nom de famille</TableCell>
                    <TableCell><span className="text-red-500">❌ Non</span></TableCell>
                    <TableCell>Jamais transmis</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Prénom</TableCell>
                    <TableCell><span className="text-amber-500">⚠️ Optionnel</span></TableCell>
                    <TableCell>Peut être remplacé par "{"{prénom}"}"</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Classe</TableCell>
                    <TableCell><span className="text-red-500">❌ Non</span></TableCell>
                    <TableCell>Non transmis</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Moyenne générale</TableCell>
                    <TableCell><span className="text-green-500">✅ Oui</span></TableCell>
                    <TableCell>Nécessaire pour contextualiser</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Mots-clés de conduite</TableCell>
                    <TableCell><span className="text-green-500">✅ Oui</span></TableCell>
                    <TableCell>Ex: "bavard", "travail insuffisant"</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Attribution choisie</TableCell>
                    <TableCell><span className="text-green-500">✅ Oui</span></TableCell>
                    <TableCell>Ex: "Encouragements"</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Ton souhaité</TableCell>
                    <TableCell><span className="text-green-500">✅ Oui</span></TableCell>
                    <TableCell>Ex: "Bienveillant"</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Exemple de données envoyées à l'API</h4>
                <pre className="text-sm text-muted-foreground bg-background p-3 rounded overflow-x-auto">
{`Génère une appréciation de conseil de classe.
Moyenne : 12.5/20
Attribution : Encouragements
Ton : Bienveillant
Contexte : L'élève fait des efforts mais des difficultés
persistent en mathématiques.`}
                </pre>
                <p className="text-sm text-muted-foreground mt-2 font-medium">
                  Le nom et les informations directement identifiantes de l'élève ne sont PAS inclus dans la requête.
                </p>
              </div>

              <h4 className="font-semibold mt-6 mb-2">Utilisation des données par OpenAI</h4>
              <p className="text-muted-foreground">
                Conformément à la politique d'OpenAI pour les utilisateurs de l'API :
              </p>
              <ul className="space-y-2 text-muted-foreground mt-2">
                <li>• Les données envoyées via l'API <strong>ne sont pas utilisées pour entraîner les modèles</strong></li>
                <li>• Les données sont conservées <strong>30 jours maximum</strong> pour détecter les abus, puis supprimées</li>
                <li>• OpenAI est certifié <strong>SOC 2 Type II</strong> pour la sécurité des données</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                📄 Plus d'informations :{" "}
                <a 
                  href="https://openai.com/policies/api-data-usage-policies" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  OpenAI API Data Usage Policy
                </a>
              </p>
            </section>

            <Separator className="my-6" />

            {/* Section 5 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                <Globe className="h-6 w-6 text-primary" />
                <span className="text-primary">5.</span> Transfert de données hors Union Européenne
              </h2>
              <p className="text-muted-foreground mb-4">
                L'utilisation de l'API OpenAI implique un <strong>transfert de données vers les États-Unis</strong>.
              </p>

              <h3 className="text-lg font-semibold mt-4 mb-2">Base légale du transfert</h3>
              <p className="text-muted-foreground">Ce transfert est encadré par :</p>
              <ul className="space-y-2 text-muted-foreground mt-2">
                <li>• Les <strong>Clauses Contractuelles Types (CCT)</strong> de la Commission Européenne</li>
                <li>• Le <strong>Data Processing Addendum (DPA)</strong> d'OpenAI</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-2">Mesures de protection supplémentaires</h3>
              <p className="text-muted-foreground">Pour limiter les risques liés à ce transfert :</p>
              <ol className="space-y-2 text-muted-foreground mt-2 list-decimal list-inside">
                <li><strong>Anonymisation</strong> : Les noms des élèves ne sont jamais transmis</li>
                <li><strong>Minimisation</strong> : Seules les données strictement nécessaires sont envoyées</li>
                <li><strong>Chiffrement</strong> : Toutes les communications utilisent le protocole HTTPS/TLS</li>
              </ol>
            </section>

            <Separator className="my-6" />

            {/* Section 6 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                <Lock className="h-6 w-6 text-primary" />
                <span className="text-primary">6.</span> Stockage des données
              </h2>

              <h3 className="text-lg font-semibold mt-4 mb-2">Sur nos serveurs</h3>
              <p className="text-muted-foreground">
                <strong>Aucune donnée n'est stockée sur nos serveurs.</strong> ClassCouncil AI est une 
                application "stateless" qui ne conserve pas vos informations.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">Dans votre navigateur</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Donnée</TableHead>
                    <TableHead>Stockage</TableHead>
                    <TableHead>Durée</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Données des élèves</TableCell>
                    <TableCell>Mémoire vive (RAM)</TableCell>
                    <TableCell>Jusqu'à fermeture/rechargement de la page</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Préférences utilisateur</TableCell>
                    <TableCell>localStorage</TableCell>
                    <TableCell>Permanent (jusqu'à effacement manuel)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Acceptation du bandeau RGPD</TableCell>
                    <TableCell>localStorage</TableCell>
                    <TableCell>Permanent</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <p className="text-muted-foreground mt-4">
                <strong>Pour effacer toutes vos données</strong> : fermez l'onglet ou rechargez la page. 
                Les données importées seront immédiatement supprimées.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">Chez OpenAI</h3>
              <p className="text-muted-foreground">
                Les requêtes API sont conservées <strong>30 jours maximum</strong> par OpenAI pour la 
                détection d'abus, puis automatiquement supprimées.
              </p>
            </section>

            <Separator className="my-6" />

            {/* Section 7 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-primary">7.</span> Sécurité
              </h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mesure</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>🔒 HTTPS</TableCell>
                    <TableCell>Toutes les connexions sont chiffrées</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>🖥️ Traitement local</TableCell>
                    <TableCell>La majorité des opérations restent sur votre ordinateur</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>🎭 Anonymisation</TableCell>
                    <TableCell>Les noms d'élèves ne quittent pas votre navigateur</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>🚫 Pas de base de données</TableCell>
                    <TableCell>Aucun stockage permanent de données personnelles</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </section>

            <Separator className="my-6" />

            {/* Section 8 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                <UserCheck className="h-6 w-6 text-primary" />
                <span className="text-primary">8.</span> Vos droits (RGPD)
              </h2>
              <p className="text-muted-foreground mb-4">
                Conformément au Règlement Général sur la Protection des Données, vous disposez des droits suivants :
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Droit</TableHead>
                    <TableHead>Comment l'exercer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Accès</TableCell>
                    <TableCell>Les données sont visibles dans l'application</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Rectification</TableCell>
                    <TableCell>Modifiez directement dans l'application</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Effacement</TableCell>
                    <TableCell>Rechargez la page ou fermez l'onglet</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Opposition</TableCell>
                    <TableCell>N'utilisez pas la fonction de génération IA</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Portabilité</TableCell>
                    <TableCell>Exportez vos données depuis l'application</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <p className="text-muted-foreground mt-4">
                Étant donné que nous ne stockons aucune donnée de manière permanente, ces droits s'exercent 
                principalement <strong>directement dans votre navigateur</strong>.
              </p>
            </section>

            <Separator className="my-6" />

            {/* Section 9 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                <span className="text-primary">9.</span> Utilisation des données de mineurs
              </h2>
              <p className="text-muted-foreground mb-4">
                ClassCouncil AI traite des données d'élèves, potentiellement <strong>mineurs de moins de 18 ans</strong>.
              </p>

              <h3 className="text-lg font-semibold mt-4 mb-2">Responsabilités de l'utilisateur</h3>
              <p className="text-muted-foreground mb-2">
                En tant que professeur utilisant cette application, vous vous engagez à :
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✅</span>
                  Utiliser l'application uniquement dans le cadre de vos fonctions éducatives
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✅</span>
                  Respecter le règlement intérieur de votre établissement concernant les outils numériques
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✅</span>
                  Ne pas partager les appréciations générées en dehors du cadre scolaire autorisé
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✅</span>
                  Vérifier et corriger les appréciations générées avant utilisation officielle
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✅</span>
                  Ne pas importer de données d'élèves inutiles au traitement
                </li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-2">Pas de collecte directe auprès des mineurs</h3>
              <p className="text-muted-foreground">
                Cette application est destinée aux <strong>enseignants adultes</strong>. 
                Aucune donnée n'est collectée directement auprès des élèves.
              </p>
            </section>

            <Separator className="my-6" />

            {/* Section 10 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                <Cookie className="h-6 w-6 text-primary" />
                <span className="text-primary">10.</span> Cookies et traceurs
              </h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Utilisé ?</TableHead>
                    <TableHead>Détail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Cookies de traçage</TableCell>
                    <TableCell><span className="text-red-500">❌ Non</span></TableCell>
                    <TableCell>Aucun cookie publicitaire</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Cookies analytiques</TableCell>
                    <TableCell><span className="text-red-500">❌ Non</span></TableCell>
                    <TableCell>Pas de Google Analytics ou équivalent</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>localStorage</TableCell>
                    <TableCell><span className="text-green-500">✅ Oui</span></TableCell>
                    <TableCell>Uniquement pour vos préférences</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <p className="text-muted-foreground mt-4 font-medium">
                Aucun cookie n'est déposé sur votre navigateur.
              </p>
            </section>

            <Separator className="my-6" />

            {/* Section 11 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                <span className="text-primary">11.</span> Modifications de cette politique
              </h2>
              <p className="text-muted-foreground">
                Cette politique de confidentialité peut être mise à jour pour refléter :
              </p>
              <ul className="space-y-2 text-muted-foreground mt-2">
                <li>• Des évolutions de l'application</li>
                <li>• Des changements réglementaires</li>
                <li>• Des modifications de nos prestataires</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                La date de dernière mise à jour est indiquée en haut de cette page. En cas de modification 
                substantielle, un nouveau bandeau d'information pourra être affiché.
              </p>
            </section>

            <Separator className="my-6" />

            {/* Section 12 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                <Mail className="h-6 w-6 text-primary" />
                <span className="text-primary">12.</span> Contact
              </h2>
              <p className="text-muted-foreground">
                Pour les questions spécifiques à OpenAI, consultez leur politique :
              </p>
              <p className="mt-2">
                🔗{" "}
                <a 
                  href="https://openai.com/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  openai.com/privacy
                </a>
              </p>
            </section>

            <Separator className="my-6" />

            {/* Section 13 - Summary */}
            <section className="mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                <span className="text-primary">13.</span> Résumé
              </h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Réponse</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Mes fichiers sont-ils uploadés sur un serveur ?</TableCell>
                    <TableCell><span className="text-red-500">❌ Non</span>, traitement local</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Les noms des élèves sont-ils envoyés à ChatGPT ?</TableCell>
                    <TableCell><span className="text-red-500">❌ Non</span>, données anonymisées</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Mes données sont-elles conservées ?</TableCell>
                    <TableCell><span className="text-red-500">❌ Non</span>, effacées à la fermeture</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Y a-t-il des cookies ?</TableCell>
                    <TableCell><span className="text-red-500">❌ Non</span></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Puis-je utiliser l'app sans l'IA ?</TableCell>
                    <TableCell><span className="text-green-500">✅ Oui</span>, la génération IA est optionnelle</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </section>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t bg-card py-6 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 ClassCouncil AI
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
