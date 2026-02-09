
# Plan : Systeme de Codes Promo avec Interface Admin

## Resume

Ce plan decrit l'implementation d'un systeme complet de codes promotionnels permettant d'offrir des credits gratuits ou des reductions. Il inclut une interface d'administration securisee accessible uniquement par vous (admin unique).

---

## 1. Architecture Base de Donnees

### Nouvelle table `promo_codes`

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid (PK) | Identifiant unique |
| code | text UNIQUE | Code a saisir (ex: "PROF2025") |
| type | text | `free_credits` ou `discount` |
| value | integer | Nombre d'eleves offerts OU pourcentage |
| max_uses | integer | Limite globale (null = illimite) |
| current_uses | integer | Compteur d'utilisations |
| max_uses_per_user | integer | Limite par utilisateur (default: 1) |
| valid_from | timestamptz | Date de debut |
| valid_until | timestamptz | Date d'expiration |
| is_active | boolean | Actif/inactif |
| description | text | Note interne (campagne, etc.) |
| created_at | timestamptz | Date de creation |

### Nouvelle table `promo_code_redemptions`

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid (PK) | Identifiant unique |
| user_id | uuid | Reference vers profiles |
| promo_code_id | uuid | Reference vers promo_codes |
| redeemed_at | timestamptz | Date d'utilisation |
| credits_awarded | integer | Credits accordes |
| UNIQUE(user_id, promo_code_id) | | Un code par utilisateur |

### Nouvelle table `user_roles`

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid (PK) | Identifiant unique |
| user_id | uuid | Reference vers auth.users |
| role | app_role (enum) | 'admin', 'user' |
| UNIQUE(user_id, role) | | Un role par utilisateur |

### Politiques RLS

- `promo_codes` : Lecture publique des codes actifs (pour validation)
- `promo_code_redemptions` : Utilisateurs voient uniquement leurs propres utilisations
- `user_roles` : Lecture reservee aux admins via fonction securisee

---

## 2. Securite Admin

### Fonction `has_role` (Security Definer)

```text
Fonction SQL qui verifie si un utilisateur a un role specifique
sans creer de recursion RLS.

Usage : public.has_role(auth.uid(), 'admin') → boolean
```

### Attribution du role admin

Votre compte sera configure comme admin via une insertion SQL directe apres la creation des tables. Votre `user_id` sera recupere depuis la table `profiles`.

---

## 3. Edge Function `redeem-promo-code`

### Endpoint

`POST /functions/v1/redeem-promo-code`

### Logique serveur

```text
1. Valider JWT (authentification requise)
2. Recevoir { code: string }
3. Verifier le code :
   - Existe dans promo_codes
   - is_active = true
   - valid_from <= now() <= valid_until
   - current_uses < max_uses (ou max_uses null)
4. Verifier l'utilisateur :
   - Pas deja utilise ce code (via promo_code_redemptions)
5. Appliquer le bonus :
   - type = 'free_credits' : Ajouter `value` au students_balance
   - type = 'discount' : Retourner le pourcentage (pour futur Stripe)
6. Creer l'entree dans promo_code_redemptions
7. Incrementer current_uses du code (atomique)
8. Retourner le succes avec details
```

### Reponses

| Code | Signification |
|------|---------------|
| SUCCESS | Code applique, X eleves ajoutes |
| INVALID | Code invalide ou inexistant |
| EXPIRED | Code expire |
| EXHAUSTED | Limite d'utilisation atteinte |
| ALREADY_USED | Vous avez deja utilise ce code |
| AUTH_REQUIRED | Connexion requise |

---

## 4. Edge Function `admin-promo-codes`

### Endpoint

`POST /functions/v1/admin-promo-codes`

### Actions disponibles

| Action | Description |
|--------|-------------|
| list | Lister tous les codes avec statistiques |
| create | Creer un nouveau code |
| update | Modifier un code existant |
| delete | Supprimer un code |
| generate_batch | Generer X codes uniques automatiquement |

### Securite

- Verification du role admin via `has_role(user_id, 'admin')`
- Toute requete non-admin retourne une erreur 403

---

## 5. Interface Utilisateur

### Composant `PromoCodeInput`

Champ de saisie avec bouton "Appliquer" :

```text
┌────────────────────────────────────────────────┐
│  🎁 Vous avez un code promo ?                  │
│  ┌─────────────────────────┐ ┌──────────────┐  │
│  │ PROF2025                │ │  Appliquer   │  │
│  └─────────────────────────┘ └──────────────┘  │
│                                                │
│  [Message succes/erreur]                       │
└────────────────────────────────────────────────┘
```

### Emplacements

1. **Page `/pricing`** : Section dediee sous les cartes
2. **`UserMenu`** : Option "Code promo" dans le dropdown utilisateur
3. **`UpgradeModal`** : Lien "J'ai un code promo"

### Etats visuels

- Chargement : Spinner sur le bouton
- Succes : Animation confetti + message vert
- Erreur : Message rouge avec explication

---

## 6. Interface Admin

### Page `/admin/promo-codes`

Accessible uniquement aux utilisateurs avec role `admin`.

#### Section 1 : Creation de code

```text
┌─────────────────────────────────────────────────────────────┐
│  CREER UN NOUVEAU CODE                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Code promo *           Type *                              │
│  ┌─────────────────┐    ○ Credits gratuits                  │
│  │ PROF2025        │    ○ Reduction (%)                     │
│  └─────────────────┘                                        │
│                                                             │
│  Valeur *              Description                          │
│  ┌─────────────────┐   ┌─────────────────────────────────┐  │
│  │ 50              │   │ Campagne rentree 2025            │  │
│  └─────────────────┘   └─────────────────────────────────┘  │
│                                                             │
│  Limite globale        Limite par utilisateur               │
│  ┌─────────────────┐   ┌─────────────────────────────────┐  │
│  │ 100 (illimite)  │   │ 1                               │  │
│  └─────────────────┘   └─────────────────────────────────┘  │
│                                                             │
│  Date debut            Date expiration                      │
│  ┌─────────────────┐   ┌─────────────────────────────────┐  │
│  │ 2025-01-01      │   │ 2025-12-31 (optionnel)          │  │
│  └─────────────────┘   └─────────────────────────────────┘  │
│                                                             │
│            [ Creer le code ]                                │
└─────────────────────────────────────────────────────────────┘
```

#### Section 2 : Generateur batch

```text
┌─────────────────────────────────────────────────────────────┐
│  GENERER DES CODES UNIQUES                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Prefixe        Nombre de codes    Valeur (credits)         │
│  ┌──────────┐   ┌─────────────┐    ┌─────────────────────┐  │
│  │ GIFT-    │   │ 50          │    │ 25                  │  │
│  └──────────┘   └─────────────┘    └─────────────────────┘  │
│                                                             │
│  ⚡ Generera : GIFT-A7X9K2, GIFT-B3M4N8, etc.               │
│                                                             │
│            [ Generer 50 codes ]                             │
└─────────────────────────────────────────────────────────────┘
```

#### Section 3 : Liste des codes

```text
┌─────────────────────────────────────────────────────────────────────────┐
│  VOS CODES PROMO                                    [Exporter CSV]      │
├───────────┬──────────┬────────┬────────────┬────────┬─────────┬─────────┤
│ Code      │ Type     │ Valeur │ Utilise    │ Limite │ Expire  │ Actions │
├───────────┼──────────┼────────┼────────────┼────────┼─────────┼─────────┤
│ PROF2025  │ Credits  │ 50     │ 23/100     │ 100    │ Dec 25  │ ✏️ 🗑️  │
│ BIENVENUE │ Credits  │ 10     │ 156/-      │ -      │ -       │ ✏️ 🗑️  │
│ GIFT-A7X9 │ Credits  │ 25     │ 0/1        │ 1      │ Dec 25  │ ✏️ 🗑️  │
│ BETA20    │ Discount │ 20%    │ 12/50      │ 50     │ Mar 25  │ ✏️ 🗑️  │
└───────────┴──────────┴────────┴────────────┴────────┴─────────┴─────────┘
```

#### Section 4 : Statistiques

```text
┌─────────────────────────────────────────────────────────────┐
│  📊 STATISTIQUES                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Codes actifs : 12        Credits offerts : 2,450           │
│  Utilisations : 89        Ce mois : 34                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Hook `usePromoCode`

```text
Fonctions exposees :
- redeemCode(code: string) → Promise<RedemptionResult>
- isLoading : boolean
- error : string | null
- lastRedemption : { code, credits, timestamp } | null

RedemptionResult :
- success : boolean
- creditsAwarded : number
- message : string
- error?: string
```

---

## 8. Hook `useAdminPromoCode`

```text
Fonctions exposees :
- isAdmin : boolean
- codes : PromoCode[]
- createCode(data) → Promise
- updateCode(id, data) → Promise
- deleteCode(id) → Promise
- generateBatch(prefix, count, value) → Promise<string[]>
- exportCsv() → void
- stats : { totalCodes, totalCredits, totalRedemptions }
```

---

## 9. Fichiers a Creer

| Fichier | Description |
|---------|-------------|
| `supabase/functions/redeem-promo-code/index.ts` | Edge Function redemption |
| `supabase/functions/admin-promo-codes/index.ts` | Edge Function admin |
| `src/components/promo/PromoCodeInput.tsx` | Champ de saisie code |
| `src/components/promo/PromoCodeSuccess.tsx` | Animation succes |
| `src/hooks/usePromoCode.ts` | Hook redemption |
| `src/hooks/useAdminPromoCode.ts` | Hook admin |
| `src/pages/admin/PromoCodesAdmin.tsx` | Page admin complete |
| `src/components/admin/PromoCodeForm.tsx` | Formulaire creation |
| `src/components/admin/PromoCodeTable.tsx` | Table des codes |
| `src/components/admin/PromoCodeStats.tsx` | Statistiques |
| `src/components/admin/BatchGenerator.tsx` | Generateur batch |

---

## 10. Fichiers a Modifier

| Fichier | Modification |
|---------|--------------|
| `src/App.tsx` | Ajouter route `/admin/promo-codes` |
| `src/pages/Pricing.tsx` | Ajouter section PromoCodeInput |
| `src/components/auth/UserMenu.tsx` | Ajouter option "Code promo" |
| `src/components/credits/UpgradeModal.tsx` | Ajouter lien code promo |
| `src/contexts/AuthContext.tsx` | Ajouter `isAdmin` et hook role |

---

## 11. Migration SQL

```text
1. Creer enum app_role ('admin', 'user')
2. Creer table user_roles avec contraintes
3. Creer fonction has_role() security definer
4. Creer table promo_codes avec index sur code
5. Creer table promo_code_redemptions avec contrainte unique
6. Activer RLS sur les nouvelles tables
7. Creer les policies appropriees
8. Inserer votre user_id comme admin
```

---

## 12. Flux Utilisateur

### Redemption d'un code

```text
Utilisateur connecte
       │
       ▼
Saisit "PROF2025" dans PromoCodeInput
       │
       ▼
Appel Edge Function redeem-promo-code
       │
       ├── Succes ───────────────────────▶ Animation confetti
       │                                    + 50 eleves ajoutes
       │                                    + Toast de confirmation
       │                                    + Badge mis a jour
       │
       └── Erreur ───────────────────────▶ Message explicatif
                                            (expire, deja utilise, etc.)
```

### Administration

```text
Admin connecte
       │
       ▼
Acces /admin/promo-codes
       │
       ├── Creer code fixe (PROF2025)
       │
       ├── Generer 50 codes uniques (GIFT-XXXXX)
       │
       ├── Voir statistiques d'utilisation
       │
       └── Exporter liste CSV
```

---

## Section Technique

### Securite

- Toute la validation des codes est cote serveur (Edge Function)
- Le role admin est verifie via fonction SQL `has_role()` (pas de localStorage)
- Les updates sont atomiques pour eviter les race conditions
- Rate limiting recommande sur l'endpoint de redemption

### Generation de codes uniques

```text
Format : PREFIX-XXXXXX
- PREFIX : Defini par l'admin (ex: GIFT, PROMO, VIP)
- XXXXXX : 6 caracteres alphanumeriques (A-Z, 0-9, sans ambigus)
- Caracteres exclus : 0, O, I, L, 1 (pour eviter confusion)
- Verification d'unicite avant insertion
```

### Points d'attention

1. Votre email devra etre configure comme admin apres la migration
2. Les codes discount ne sont pas encore fonctionnels (attente Stripe)
3. L'export CSV inclura tous les codes pour archivage
4. La page admin sera accessible via un lien discret (pas dans le menu public)
