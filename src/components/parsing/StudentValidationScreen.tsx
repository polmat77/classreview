import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Check, X, Edit2, Plus, Trash2, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

export interface ValidatedStudent {
  id: string;
  nom: string;
  prenom: string;
  moyenne: number | null;
  isValid: boolean;
  isEditing: boolean;
}

interface StudentValidationScreenProps {
  students: ValidatedStudent[];
  rawText: string;
  onStudentsChange: (students: ValidatedStudent[]) => void;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
}

export const StudentValidationScreen: React.FC<StudentValidationScreenProps> = ({
  students,
  rawText,
  onStudentsChange,
  onConfirm,
  onCancel,
  title = "Vérification des élèves détectés"
}) => {
  const [showRawText, setShowRawText] = useState(false);
  const [newStudent, setNewStudent] = useState<{ nom: string; prenom: string; moyenne: string }>({
    nom: '',
    prenom: '',
    moyenne: ''
  });

  const getStatusIndicator = (student: ValidatedStudent) => {
    const hasName = student.nom && student.nom.length >= 2;
    const hasPrenom = student.prenom && student.prenom.length >= 2;
    const hasMoyenne = student.moyenne !== null && student.moyenne >= 0 && student.moyenne <= 20;

    if (hasName && hasPrenom && hasMoyenne) {
      return { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950', label: 'Complet' };
    } else if (hasName && hasPrenom) {
      return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950', label: 'Partiel' };
    } else {
      return { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950', label: 'Incomplet' };
    }
  };

  const handleEdit = (id: string) => {
    onStudentsChange(students.map(s => 
      s.id === id ? { ...s, isEditing: true } : s
    ));
  };

  const handleSave = (id: string, updatedData: { nom: string; prenom: string; moyenne: string }) => {
    onStudentsChange(students.map(s => {
      if (s.id === id) {
        const moyenneNum = updatedData.moyenne ? parseFloat(updatedData.moyenne.replace(',', '.')) : null;
        return {
          ...s,
          nom: updatedData.nom,
          prenom: updatedData.prenom,
          moyenne: moyenneNum,
          isEditing: false,
          isValid: updatedData.nom.length >= 2 && updatedData.prenom.length >= 2
        };
      }
      return s;
    }));
  };

  const handleDelete = (id: string) => {
    onStudentsChange(students.filter(s => s.id !== id));
  };

  const handleAddStudent = () => {
    if (newStudent.nom.length >= 2 && newStudent.prenom.length >= 2) {
      const moyenneNum = newStudent.moyenne ? parseFloat(newStudent.moyenne.replace(',', '.')) : null;
      const newId = `manual_${Date.now()}`;
      onStudentsChange([
        ...students,
        {
          id: newId,
          nom: newStudent.nom.toUpperCase(),
          prenom: newStudent.prenom,
          moyenne: moyenneNum,
          isValid: true,
          isEditing: false
        }
      ]);
      setNewStudent({ nom: '', prenom: '', moyenne: '' });
    }
  };

  const validCount = students.filter(s => {
    const status = getStatusIndicator(s);
    return status.label === 'Complet';
  }).length;

  const partialCount = students.filter(s => {
    const status = getStatusIndicator(s);
    return status.label === 'Partiel';
  }).length;

  const invalidCount = students.filter(s => {
    const status = getStatusIndicator(s);
    return status.label === 'Incomplet';
  }).length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>
          Vérifiez que tous les élèves ont été correctement détectés avant de continuer.
          Vous pouvez modifier, supprimer ou ajouter des élèves manuellement.
        </CardDescription>
        
        {/* Summary badges */}
        <div className="flex gap-2 pt-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {validCount} complets
          </Badge>
          {partialCount > 0 && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {partialCount} partiels
            </Badge>
          )}
          {invalidCount > 0 && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800">
              <AlertCircle className="h-3 w-3 mr-1" />
              {invalidCount} incomplets
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Students table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">État</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Prénom</TableHead>
                <TableHead className="w-24 text-right">Moyenne</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const status = getStatusIndicator(student);
                const StatusIcon = status.icon;

                if (student.isEditing) {
                  return (
                    <EditableStudentRow
                      key={student.id}
                      student={student}
                      onSave={handleSave}
                      onCancel={() => onStudentsChange(students.map(s => 
                        s.id === student.id ? { ...s, isEditing: false } : s
                      ))}
                    />
                  );
                }

                return (
                  <TableRow key={student.id} className={status.bg}>
                    <TableCell>
                      <StatusIcon className={`h-4 w-4 ${status.color}`} />
                    </TableCell>
                    <TableCell className="font-medium">{student.nom}</TableCell>
                    <TableCell>{student.prenom}</TableCell>
                    <TableCell className="text-right">
                      {student.moyenne !== null ? (
                        <span className={student.moyenne < 10 ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                          {student.moyenne.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(student.id)}
                          className="h-8 w-8"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(student.id)}
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              
              {/* Add new student row */}
              <TableRow className="bg-muted/30">
                <TableCell>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </TableCell>
                <TableCell>
                  <Input
                    value={newStudent.nom}
                    onChange={(e) => setNewStudent({ ...newStudent, nom: e.target.value })}
                    placeholder="NOM"
                    className="h-8 uppercase"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={newStudent.prenom}
                    onChange={(e) => setNewStudent({ ...newStudent, prenom: e.target.value })}
                    placeholder="Prénom"
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={newStudent.moyenne}
                    onChange={(e) => setNewStudent({ ...newStudent, moyenne: e.target.value })}
                    placeholder="12,50"
                    className="h-8 text-right"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddStudent}
                    disabled={newStudent.nom.length < 2 || newStudent.prenom.length < 2}
                    className="h-8"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Raw text collapsible (for debugging) */}
        <Collapsible open={showRawText} onOpenChange={setShowRawText}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between text-muted-foreground hover:text-foreground">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Voir le texte brut extrait (debug)
              </span>
              {showRawText ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto max-h-64 whitespace-pre-wrap">
              {rawText.substring(0, 5000)}
              {rawText.length > 5000 && '\n\n... (texte tronqué)'}
            </pre>
          </CollapsibleContent>
        </Collapsible>

        {/* Action buttons */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button onClick={onConfirm} className="bg-primary">
            <Check className="h-4 w-4 mr-2" />
            Tout semble correct → Continuer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Editable row component
interface EditableStudentRowProps {
  student: ValidatedStudent;
  onSave: (id: string, data: { nom: string; prenom: string; moyenne: string }) => void;
  onCancel: () => void;
}

const EditableStudentRow: React.FC<EditableStudentRowProps> = ({ student, onSave, onCancel }) => {
  const [editData, setEditData] = useState({
    nom: student.nom,
    prenom: student.prenom,
    moyenne: student.moyenne !== null ? student.moyenne.toString().replace('.', ',') : ''
  });

  return (
    <TableRow className="bg-blue-50 dark:bg-blue-950">
      <TableCell>
        <Edit2 className="h-4 w-4 text-blue-500" />
      </TableCell>
      <TableCell>
        <Input
          value={editData.nom}
          onChange={(e) => setEditData({ ...editData, nom: e.target.value })}
          className="h-8 uppercase"
          autoFocus
        />
      </TableCell>
      <TableCell>
        <Input
          value={editData.prenom}
          onChange={(e) => setEditData({ ...editData, prenom: e.target.value })}
          className="h-8"
        />
      </TableCell>
      <TableCell>
        <Input
          value={editData.moyenne}
          onChange={(e) => setEditData({ ...editData, moyenne: e.target.value })}
          className="h-8 text-right"
        />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex gap-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSave(student.id, editData)}
            className="h-8 w-8 text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-8 w-8 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default StudentValidationScreen;
