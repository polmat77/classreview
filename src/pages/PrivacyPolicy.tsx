import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Server, Globe, UserCheck, Cookie, Mail, Bot, Building2, GraduationCap } from "lucide-react";
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
              <strong>Dernière mise à jour : février 2025</strong>
            </p>

            {/* Section 1 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                <span className="text-primary">1.</span> Présentation de l'application
              </h2>
              <p className="text-muted-foreground">
                <strong>AIProject4You</strong> propose une suite d'outils IA destinés aux enseignants français :
              </p>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                <li>• <strong>ClassCouncil AI</strong> : aide à la préparation des conseils de classe et génération d'appréciations</li>
                <li>• <strong>ReportCardAI</strong> : génération d'appréciations pour les bulletins scolaires</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Ces outils permettent d'analyser les résultats des élèves et de générer des appréciations 
                personnalisées à l'aide de l'intelligence artificielle.
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
              <p className="text-muted-foreground mt-4">
                <strong>Éditeur :</strong> Mathieu POL (voir <Link to="/mentions-legales" className="text-primary hover:underline">mentions légales</Link>)
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

            {/* Section 4 - Traitement IA (NOUVELLE SECTION ENRICHIE) */}
            <section className="mb-8" id="ia">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                <Bot className="h-6 w-6 text-primary" />
                <span className="text-primary">4.</span> Traitement des données par l'Intelligence Artificielle
              </h2>
              
              <h3 className="text-lg font-semibold mt-6 mb-3">4.1 Fonctionnement de nos outils IA</h3>
              <p className="text-muted-foreground mb-4">
                Nos outils (ClassCouncil AI, ReportCardAI) utilisent l'intelligence artificielle pour 
                générer des suggestions d'appréciations scolaires. Voici comment vos données sont traitées :
              </p>

              <h4 className="font-semibold mt-6 mb-2">Anonymisation systématique avant envoi</h4>
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg mb-4">
                <p className="text-emerald-700 dark:text-emerald-400 font-medium mb-2">
                  ✅ Aucune donnée personnelle identifiante n'est transmise à l'IA
                </p>
                <p className="text-muted-foreground text-sm">
                  Avant tout envoi à notre service d'IA :
                </p>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-red-500">❌</span>
                  Les <strong>prénoms</strong> des élèves sont remplacés par des balises génériques <code className="bg-muted px-1 rounded">{"{prénom}"}</code>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">❌</span>
                  Les <strong>noms de famille</strong> ne sont <strong>jamais</strong> transmis
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">❌</span>
                  Les <strong>notes chiffrées</strong> sont converties en descripteurs qualitatifs (ex: "excellent", "satisfaisant", "en progression")
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">❌</span>
                  Les <strong>identifiants de classe</strong> et <strong>noms d'établissement</strong> ne sont pas transmis
                </li>
              </ul>

              <h4 className="font-semibold mt-6 mb-2">Service d'IA utilisé</h4>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Modèle</TableCell>
                    <TableCell>Google Gemini 2.5 Flash</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Fournisseur</TableCell>
                    <TableCell>Google LLC via Lovable AI Gateway</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Certification</TableCell>
                    <TableCell>EU-US Data Privacy Framework</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Entraînement des modèles</TableCell>
                    <TableCell><span className="text-red-500">❌</span> Les données API ne sont PAS utilisées pour entraîner les modèles</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Conservation</TableCell>
                    <TableCell>Aucun historique de conversation conservé côté serveur</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <h4 className="font-semibold mt-6 mb-2">Traitement local privilégié</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✅</span>
                  Toutes les données saisies sont stockées <strong>uniquement dans votre navigateur</strong> (localStorage)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✅</span>
                  Aucune base de données centralisée ne conserve les informations de vos élèves
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✅</span>
                  La suppression des données se fait via le bouton "Réinitialiser" ou en effaçant les données de navigation
                </li>
              </ul>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Exemple de données envoyées à l'API</h4>
                <pre className="text-sm text-muted-foreground bg-background p-3 rounded overflow-x-auto">
{`Génère une appréciation de bulletin scolaire.
Niveau de résultats : satisfaisant
Comportement : bon investissement, quelques bavardages
Ton souhaité : Bienveillant
Contexte : L'élève fait des efforts réguliers.`}
                </pre>
                <p className="text-sm text-muted-foreground mt-2 font-medium">
                  ⚠️ Le nom, prénom et notes exactes de l'élève ne sont PAS inclus dans la requête.
                </p>
              </div>
            </section>

            <Separator className="my-6" />

            {/* Section 5 - Sous-traitants (NOUVELLE) */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                <Building2 className="h-6 w-6 text-primary" />
                <span className="text-primary">5.</span> Sous-traitants et transferts de données
              </h2>
              
              <h3 className="text-lg font-semibold mt-4 mb-3">Liste des sous-traitants</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sous-traitant</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>Données concernées</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Hostinger International Ltd</TableCell>
                    <TableCell>Hébergement web</TableCell>
                    <TableCell>UE (Lituanie/Pays-Bas)</TableCell>
                    <TableCell>Logs de connexion</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Google LLC</TableCell>
                    <TableCell>API Intelligence Artificielle (Gemini)</TableCell>
                    <TableCell>UE/US (DPF certifié)</TableCell>
                    <TableCell>Requêtes anonymisées uniquement</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Lovable</TableCell>
                    <TableCell>Passerelle API</TableCell>
                    <TableCell>UE</TableCell>
                    <TableCell>Requêtes anonymisées en transit</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <h3 className="text-lg font-semibold mt-6 mb-2">Garanties pour les transferts hors UE</h3>
              <p className="text-muted-foreground">Les transferts vers les États-Unis (Google) sont encadrés par :</p>
              <ul className="space-y-2 text-muted-foreground mt-2">
                <li>• Le <strong>EU-US Data Privacy Framework</strong> (décision d'adéquation du 10 juillet 2023)</li>
                <li>• Les <strong>clauses contractuelles types</strong> de la Commission européenne</li>
                <li>• L'engagement de Google à <strong>ne pas utiliser les données API pour l'entraînement</strong></li>
              </ul>

              <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-foreground font-medium">
                  🔒 Aucune vente de données
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Nous ne vendons, ne louons et ne partageons jamais vos données avec des tiers 
                  à des fins commerciales ou publicitaires.
                </p>
              </div>
            </section>

            <Separator className="my-6" />

            {/* Section 6 - Cadre éducatif (NOUVELLE) */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="text-primary">6.</span> Conformité au cadre éducatif français
              </h2>
              
              <h3 className="text-lg font-semibold mt-4 mb-3">Respect du Cadre d'usage de l'IA en éducation (juin 2025)</h3>
              <p className="text-muted-foreground mb-4">
                Nos outils sont conçus dans le respect du cadre publié par le Ministère de l'Éducation nationale :
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✅</span>
                  <div>
                    <strong className="text-foreground">Assistance, non substitution :</strong> L'IA génère des suggestions 
                    que l'enseignant valide, modifie ou rejette. La décision finale reste humaine.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✅</span>
                  <div>
                    <strong className="text-foreground">Supervision humaine :</strong> Chaque appréciation doit être relue 
                    et validée par l'enseignant avant utilisation.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✅</span>
                  <div>
                    <strong className="text-foreground">Transparence :</strong> Nous documentons clairement le fonctionnement 
                    de nos algorithmes et le traitement des données.
                  </div>
                </li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-2">Recommandations de la CNIL suivies</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Anonymisation des données avant tout envoi à des services tiers</li>
                <li>• Information claire des utilisateurs sur le traitement</li>
                <li>• Possibilité de suppression immédiate des données (bouton "Réinitialiser")</li>
                <li>• Pas de profilage ni de décision automatisée sans intervention humaine</li>
              </ul>
            </section>

            <Separator className="my-6" />

            {/* Section 7 - Traitement local */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                <Server className="h-6 w-6 text-primary" />
                <span className="text-primary">7.</span> Traitement local (dans votre navigateur)
              </h2>
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
            </section>

            <Separator className="my-6" />

            {/* Section 8 - Transferts hors UE */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                <Globe className="h-6 w-6 text-primary" />
                <span className="text-primary">8.</span> Transfert de données hors Union Européenne
              </h2>
              <p className="text-muted-foreground mb-4">
                L'utilisation de l'API Google Gemini peut impliquer un <strong>transfert de données vers les États-Unis</strong>.
              </p>

              <h3 className="text-lg font-semibold mt-4 mb-2">Base légale du transfert</h3>
              <p className="text-muted-foreground">Ce transfert est encadré par :</p>
              <ul className="space-y-2 text-muted-foreground mt-2">
                <li>• Le <strong>EU-US Data Privacy Framework</strong> (décision d'adéquation)</li>
                <li>• Les <strong>Clauses Contractuelles Types (CCT)</strong> de la Commission Européenne</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-2">Mesures de protection supplémentaires</h3>
              <ol className="space-y-2 text-muted-foreground mt-2 list-decimal list-inside">
                <li><strong>Anonymisation</strong> : Les noms des élèves ne sont jamais transmis</li>
                <li><strong>Minimisation</strong> : Seules les données strictement nécessaires sont envoyées</li>
                <li><strong>Chiffrement</strong> : Toutes les communications utilisent le protocole HTTPS/TLS</li>
              </ol>
            </section>

            <Separator className="my-6" />

            {/* Section 9 - Stockage */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                <Lock className="h-6 w-6 text-primary" />
                <span className="text-primary">9.</span> Stockage des données
              </h2>

              <h3 className="text-lg font-semibold mt-4 mb-2">Sur nos serveurs</h3>
              <p className="text-muted-foreground">
                <strong>Aucune donnée n'est stockée sur nos serveurs.</strong> Nos applications sont 
                "stateless" et ne conservent pas vos informations.
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
                    <TableCell>localStorage</TableCell>
                    <TableCell>Jusqu'à réinitialisation manuelle</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Préférences utilisateur</TableCell>
                    <TableCell>localStorage</TableCell>
                    <TableCell>Permanent (jusqu'à effacement manuel)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Consentement RGPD</TableCell>
                    <TableCell>localStorage</TableCell>
                    <TableCell>Permanent (avec date de consentement)</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <p className="text-muted-foreground mt-4">
                <strong>Pour effacer toutes vos données</strong> : utilisez le bouton "Réinitialiser" 
                dans l'application ou effacez les données de votre navigateur.
              </p>
            </section>

            <Separator className="my-6" />

            {/* Section 10 - Sécurité */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-primary">10.</span> Sécurité
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

            {/* Section 11 - Droits RGPD */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                <UserCheck className="h-6 w-6 text-primary" />
                <span className="text-primary">11.</span> Vos droits selon le RGPD
              </h2>
              <p className="text-muted-foreground mb-4">
                Conformément au Règlement Général sur la Protection des Données (UE 2016/679), vous disposez des droits suivants :
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Droit</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Comment l'exercer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Accès</TableCell>
                    <TableCell>Obtenir confirmation que des données vous concernant sont traitées</TableCell>
                    <TableCell>Les données sont visibles dans l'application</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Rectification</TableCell>
                    <TableCell>Corriger des données inexactes</TableCell>
                    <TableCell>Modifiez directement dans l'application</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Effacement</TableCell>
                    <TableCell>Demander la suppression de vos données</TableCell>
                    <TableCell>Bouton "Réinitialiser" ou effacer données navigateur</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Opposition</TableCell>
                    <TableCell>Vous opposer au traitement de vos données</TableCell>
                    <TableCell>N'utilisez pas la fonction de génération IA</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Portabilité</TableCell>
                    <TableCell>Récupérer vos données dans un format structuré</TableCell>
                    <TableCell>Exportez vos données depuis l'application</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Comment exercer vos droits</h4>
                <p className="text-muted-foreground text-sm">
                  Comme nos outils fonctionnent en traitement local (localStorage), vos données d'élèves 
                  ne sont stockées que sur votre appareil. Pour les supprimer, utilisez simplement le 
                  bouton "Réinitialiser" dans l'application.
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  Vous pouvez également contacter la CNIL :{" "}
                  <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    www.cnil.fr
                  </a>
                </p>
              </div>
            </section>

            <Separator className="my-6" />

            {/* Section 12 - Mineurs */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                <span className="text-primary">12.</span> Utilisation des données de mineurs
              </h2>
              <p className="text-muted-foreground mb-4">
                Nos outils traitent des données d'élèves, potentiellement <strong>mineurs de moins de 18 ans</strong>.
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
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-2">Pas de collecte directe auprès des mineurs</h3>
              <p className="text-muted-foreground">
                Cette application est destinée aux <strong>enseignants adultes</strong>. 
                Aucune donnée n'est collectée directement auprès des élèves.
              </p>
            </section>

            <Separator className="my-6" />

            {/* Section 13 - Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                <Cookie className="h-6 w-6 text-primary" />
                <span className="text-primary">13.</span> Cookies et traceurs
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
                    <TableCell>Uniquement pour vos préférences et données de session</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <p className="text-muted-foreground mt-4 font-medium">
                Aucun cookie n'est déposé sur votre navigateur.
              </p>
            </section>

            <Separator className="my-6" />

            {/* Section 14 - Modifications */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                <span className="text-primary">14.</span> Modifications de cette politique
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

            {/* Section 15 - Contact */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                <Mail className="h-6 w-6 text-primary" />
                <span className="text-primary">15.</span> Contact
              </h2>
              <p className="text-muted-foreground">
                Pour toute question concernant cette politique de confidentialité, consultez nos{" "}
                <Link to="/mentions-legales" className="text-primary hover:underline">
                  mentions légales
                </Link>
                {" "}pour les coordonnées de contact.
              </p>
              <p className="text-muted-foreground mt-4">
                Pour les questions relatives au RGPD, vous pouvez également contacter la CNIL :{" "}
                <a 
                  href="https://www.cnil.fr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  www.cnil.fr
                </a>
              </p>
            </section>

            <Separator className="my-6" />

            {/* Section 16 - Résumé */}
            <section className="mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                <span className="text-primary">16.</span> Résumé
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
                    <TableCell>Les noms des élèves sont-ils envoyés à l'IA ?</TableCell>
                    <TableCell><span className="text-red-500">❌ Non</span>, données anonymisées</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Quelle IA est utilisée ?</TableCell>
                    <TableCell>Google Gemini 2.5 Flash (via Lovable AI Gateway)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Mes données sont-elles conservées ?</TableCell>
                    <TableCell><span className="text-red-500">❌ Non</span>, uniquement en local (navigateur)</TableCell>
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
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
            <span>|</span>
            <Link to="/mentions-legales" className="hover:text-foreground transition-colors">Mentions légales</Link>
            <span>|</span>
            <span>© 2025 AIProject4You - Mathieu POL</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
