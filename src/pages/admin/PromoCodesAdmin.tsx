import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminPromoCode, PromoCode } from '@/hooks/useAdminPromoCode';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Download, 
  Loader2, 
  Trash2, 
  Edit, 
  ArrowLeft,
  BarChart3,
  Gift,
  Users,
  Calendar,
  Sparkles,
  Zap,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function PromoCodesAdmin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const {
    isAdmin,
    isCheckingAdmin,
    codes,
    stats,
    isLoading,
    error,
    fetchCodes,
    fetchStats,
    createCode,
    updateCode,
    deleteCode,
    generateBatch,
    exportCsv,
  } = useAdminPromoCode();

  // Form state for creating codes
  const [newCode, setNewCode] = useState({
    code: '',
    type: 'free_credits' as 'free_credits' | 'discount',
    value: 10,
    max_uses: null as number | null,
    max_uses_per_user: 1,
    valid_until: '',
    description: '',
  });

  // Form state for batch generation
  const [batchForm, setBatchForm] = useState({
    prefix: 'GIFT-',
    count: 10,
    value: 25,
  });

  // Edit modal state
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    if (isAdmin) {
      fetchCodes();
      fetchStats();
    }
  }, [isAdmin, fetchCodes, fetchStats]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Show loading state
  if (authLoading || isCheckingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  // Show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Shield className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Accès réservé</h1>
        <p className="text-muted-foreground mb-6">Cette page est réservée aux administrateurs.</p>
        <Button onClick={() => navigate('/')} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'accueil
        </Button>
      </div>
    );
  }

  const handleCreateCode = async () => {
    if (!newCode.code.trim()) {
      toast({ title: 'Erreur', description: 'Le code est requis', variant: 'destructive' });
      return;
    }

    const result = await createCode({
      code: newCode.code,
      type: newCode.type,
      value: newCode.value,
      max_uses: newCode.max_uses,
      max_uses_per_user: newCode.max_uses_per_user,
      valid_until: newCode.valid_until || null,
      description: newCode.description || undefined,
    });

    if (result) {
      toast({ title: 'Succès', description: `Code ${result.code} créé !` });
      setNewCode({
        code: '',
        type: 'free_credits',
        value: 10,
        max_uses: null,
        max_uses_per_user: 1,
        valid_until: '',
        description: '',
      });
    }
  };

  const handleGenerateBatch = async () => {
    if (!batchForm.prefix.trim()) {
      toast({ title: 'Erreur', description: 'Le préfixe est requis', variant: 'destructive' });
      return;
    }

    const generatedCodes = await generateBatch({
      prefix: batchForm.prefix,
      count: batchForm.count,
      value: batchForm.value,
    });

    if (generatedCodes.length > 0) {
      toast({ 
        title: 'Succès', 
        description: `${generatedCodes.length} codes générés !` 
      });
    }
  };

  const handleUpdateCode = async () => {
    if (!editingCode) return;

    const result = await updateCode(editingCode.id, {
      is_active: editingCode.is_active,
      max_uses: editingCode.max_uses,
      valid_until: editingCode.valid_until,
      description: editingCode.description,
    });

    if (result) {
      toast({ title: 'Succès', description: 'Code mis à jour !' });
      setEditingCode(null);
    }
  };

  const handleDeleteCode = async (id: string) => {
    const success = await deleteCode(id);
    if (success) {
      toast({ title: 'Succès', description: 'Code supprimé !' });
      setDeleteConfirm(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground">Gestion des Codes Promo</h1>
              <p className="text-xs text-muted-foreground">Administration</p>
            </div>
          </div>
          <Button onClick={exportCsv} variant="outline" size="sm" disabled={codes.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Gift className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.activeCodes}</p>
                  <p className="text-xs text-muted-foreground">Codes actifs</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Sparkles className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalCreditsAwarded}</p>
                  <p className="text-xs text-muted-foreground">Crédits offerts</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalRedemptions}</p>
                  <p className="text-xs text-muted-foreground">Utilisations</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <Calendar className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.thisMonthRedemptions}</p>
                  <p className="text-xs text-muted-foreground">Ce mois</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
            {error}
          </div>
        )}

        <Tabs defaultValue="codes" className="space-y-6">
          <TabsList>
            <TabsTrigger value="codes">
              <BarChart3 className="h-4 w-4 mr-2" />
              Tous les codes
            </TabsTrigger>
            <TabsTrigger value="create">
              <Plus className="h-4 w-4 mr-2" />
              Créer un code
            </TabsTrigger>
            <TabsTrigger value="batch">
              <Zap className="h-4 w-4 mr-2" />
              Génération batch
            </TabsTrigger>
          </TabsList>

          {/* Codes List */}
          <TabsContent value="codes">
            <Card className="p-0 overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-accent" />
                </div>
              ) : codes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Gift className="h-12 w-12 mb-4 opacity-50" />
                  <p>Aucun code promo créé</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Valeur</TableHead>
                        <TableHead>Utilisations</TableHead>
                        <TableHead>Expire</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {codes.map((code) => (
                        <TableRow key={code.id}>
                          <TableCell>
                            <code className="px-2 py-1 rounded bg-muted font-mono text-sm">
                              {code.code}
                            </code>
                          </TableCell>
                          <TableCell>
                            <Badge variant={code.type === 'free_credits' ? 'default' : 'secondary'}>
                              {code.type === 'free_credits' ? 'Crédits' : 'Réduction'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {code.type === 'free_credits' 
                              ? `${code.value} élèves` 
                              : `${code.value}%`
                            }
                          </TableCell>
                          <TableCell>
                            {code.current_uses}/{code.max_uses ?? '∞'}
                          </TableCell>
                          <TableCell>{formatDate(code.valid_until)}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                code.is_active 
                                  ? 'border-success text-success' 
                                  : 'border-muted-foreground text-muted-foreground'
                              )}
                            >
                              {code.is_active ? 'Actif' : 'Inactif'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingCode(code)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteConfirm(code.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Create Code Form */}
          <TabsContent value="create">
            <Card className="p-6 max-w-xl">
              <h3 className="text-lg font-semibold mb-6">Créer un nouveau code</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Code promo *</Label>
                    <Input
                      id="code"
                      value={newCode.code}
                      onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                      placeholder="PROF2025"
                      className="uppercase font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={newCode.type}
                      onValueChange={(value: 'free_credits' | 'discount') => 
                        setNewCode({ ...newCode, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free_credits">Crédits gratuits</SelectItem>
                        <SelectItem value="discount">Réduction (%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="value">
                      {newCode.type === 'free_credits' ? 'Nombre d\'élèves' : 'Pourcentage'} *
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      min={1}
                      max={newCode.type === 'discount' ? 100 : 10000}
                      value={newCode.value}
                      onChange={(e) => setNewCode({ ...newCode, value: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_uses">Limite globale</Label>
                    <Input
                      id="max_uses"
                      type="number"
                      min={1}
                      value={newCode.max_uses ?? ''}
                      onChange={(e) => setNewCode({ 
                        ...newCode, 
                        max_uses: e.target.value ? parseInt(e.target.value) : null 
                      })}
                      placeholder="Illimité"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max_uses_per_user">Limite par utilisateur</Label>
                    <Input
                      id="max_uses_per_user"
                      type="number"
                      min={1}
                      value={newCode.max_uses_per_user}
                      onChange={(e) => setNewCode({ 
                        ...newCode, 
                        max_uses_per_user: parseInt(e.target.value) || 1 
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valid_until">Date d'expiration</Label>
                    <Input
                      id="valid_until"
                      type="date"
                      value={newCode.valid_until}
                      onChange={(e) => setNewCode({ ...newCode, valid_until: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (interne)</Label>
                  <Input
                    id="description"
                    value={newCode.description}
                    onChange={(e) => setNewCode({ ...newCode, description: e.target.value })}
                    placeholder="Campagne rentrée 2025"
                  />
                </div>

                <Button 
                  onClick={handleCreateCode} 
                  disabled={isLoading || !newCode.code.trim()}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Créer le code
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Batch Generation */}
          <TabsContent value="batch">
            <Card className="p-6 max-w-xl">
              <h3 className="text-lg font-semibold mb-2">Générer des codes uniques</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Créez plusieurs codes uniques en une seule fois. Parfait pour les campagnes marketing.
              </p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prefix">Préfixe</Label>
                    <Input
                      id="prefix"
                      value={batchForm.prefix}
                      onChange={(e) => setBatchForm({ ...batchForm, prefix: e.target.value.toUpperCase() })}
                      placeholder="GIFT-"
                      className="uppercase font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="count">Nombre de codes</Label>
                    <Input
                      id="count"
                      type="number"
                      min={1}
                      max={500}
                      value={batchForm.count}
                      onChange={(e) => setBatchForm({ ...batchForm, count: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="batchValue">Crédits par code</Label>
                    <Input
                      id="batchValue"
                      type="number"
                      min={1}
                      value={batchForm.value}
                      onChange={(e) => setBatchForm({ ...batchForm, value: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/50 text-sm">
                  <p className="text-muted-foreground">
                    ⚡ Exemple de codes générés : <code className="font-mono">{batchForm.prefix}A7X9K2</code>, <code className="font-mono">{batchForm.prefix}B3M4N8</code>...
                  </p>
                </div>

                <Button 
                  onClick={handleGenerateBatch} 
                  disabled={isLoading || !batchForm.prefix.trim()}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  Générer {batchForm.count} codes
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Modal */}
      <Dialog open={!!editingCode} onOpenChange={() => setEditingCode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le code</DialogTitle>
            <DialogDescription>
              Code : <code className="font-mono">{editingCode?.code}</code>
            </DialogDescription>
          </DialogHeader>
          
          {editingCode && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-active">Actif</Label>
                <Switch
                  id="edit-active"
                  checked={editingCode.is_active}
                  onCheckedChange={(checked) => 
                    setEditingCode({ ...editingCode, is_active: checked })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-max-uses">Limite globale</Label>
                <Input
                  id="edit-max-uses"
                  type="number"
                  min={editingCode.current_uses}
                  value={editingCode.max_uses ?? ''}
                  onChange={(e) => setEditingCode({ 
                    ...editingCode, 
                    max_uses: e.target.value ? parseInt(e.target.value) : null 
                  })}
                  placeholder="Illimité"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-valid-until">Date d'expiration</Label>
                <Input
                  id="edit-valid-until"
                  type="date"
                  value={editingCode.valid_until?.split('T')[0] ?? ''}
                  onChange={(e) => setEditingCode({ 
                    ...editingCode, 
                    valid_until: e.target.value || null 
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editingCode.description ?? ''}
                  onChange={(e) => setEditingCode({ 
                    ...editingCode, 
                    description: e.target.value || null 
                  })}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCode(null)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateCode} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce code ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Les statistiques d'utilisation seront perdues.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteConfirm && handleDeleteCode(deleteConfirm)}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
