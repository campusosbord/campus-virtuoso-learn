
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Course, CourseForm } from '@/types/admin';

interface CourseFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingCourse?: Course | null;
  onSave: (formData: CourseForm, editingCourse?: Course) => Promise<boolean>;
}

const CourseFormDialog = ({ isOpen, onOpenChange, editingCourse, onSave }: CourseFormDialogProps) => {
  const [formData, setFormData] = useState<CourseForm>({
    title: editingCourse?.title || '',
    description: editingCourse?.description || '',
    status: editingCourse?.status || 'draft',
    start_date: editingCourse?.start_date ? editingCourse.start_date.split('T')[0] : '',
    end_date: editingCourse?.end_date ? editingCourse.end_date.split('T')[0] : ''
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'draft',
      start_date: '',
      end_date: ''
    });
  };

  const handleSave = async () => {
    const success = await onSave(formData, editingCourse || undefined);
    if (success) {
      onOpenChange(false);
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingCourse ? 'Editar Curso' : 'Crear Nuevo Curso'}
          </DialogTitle>
          <DialogDescription>
            {editingCourse 
              ? 'Modifica los datos del curso'
              : 'Completa los datos para crear un nuevo curso'
            }
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Título del curso"
            />
          </div>
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción del curso"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Fecha de Inicio</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="end_date">Fecha de Fin</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="status">Estado</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: 'active' | 'expired' | 'draft') => 
                setFormData(prev => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingCourse ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourseFormDialog;
