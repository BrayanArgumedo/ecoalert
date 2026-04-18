import { useState, useEffect } from 'react';
import {
  getEmergencyTypes, createEmergencyType, updateEmergencyType, deleteEmergencyType,
} from '../../../core/services/emergencyTypesService';
import type { TipoEmergencia } from '../../../core/services/emergencyTypesService';

export function useEmergencyTypes() {
  const [types,   setTypes]   = useState<TipoEmergencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // Modal crear/editar
  const [formModal,  setFormModal]  = useState(false);
  const [editing,    setEditing]    = useState<TipoEmergencia | null>(null);
  const [formNombre, setFormNombre] = useState('');
  const [formDesc,   setFormDesc]   = useState('');
  const [formError,  setFormError]  = useState<string | null>(null);
  const [saving,     setSaving]     = useState(false);

  // Modal eliminar
  const [deleteModal,  setDeleteModal]  = useState(false);
  const [deleting,     setDeleting]     = useState(false);
  const [targetDelete, setTargetDelete] = useState<TipoEmergencia | null>(null);

  const loadTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      setTypes(await getEmergencyTypes());
    } catch {
      setError('No se pudo cargar los tipos de emergencia');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTypes(); }, []);

  const openCreate = () => {
    setEditing(null);
    setFormNombre('');
    setFormDesc('');
    setFormError(null);
    setFormModal(true);
  };

  const openEdit = (tipo: TipoEmergencia) => {
    setEditing(tipo);
    setFormNombre(tipo.nombre);
    setFormDesc(tipo.descripcion ?? '');
    setFormError(null);
    setFormModal(true);
  };

  const openDelete = (tipo: TipoEmergencia) => {
    setTargetDelete(tipo);
    setDeleteModal(true);
  };

  const handleSave = async () => {
    if (!formNombre.trim()) { setFormError('El nombre es obligatorio'); return; }
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        const updated = await updateEmergencyType(editing.id_tipo, {
          nombre: formNombre.trim(),
          descripcion: formDesc.trim() || undefined,
        });
        setTypes((prev) => prev.map((t) => t.id_tipo === updated.id_tipo ? updated : t));
      } else {
        const created = await createEmergencyType({
          nombre: formNombre.trim(),
          descripcion: formDesc.trim() || undefined,
        });
        setTypes((prev) => [...prev, created]);
      }
      setFormModal(false);
    } catch (err: any) {
      setFormError(err?.response?.data?.message ?? 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!targetDelete) return;
    setDeleting(true);
    try {
      await deleteEmergencyType(targetDelete.id_tipo);
      setTypes((prev) => prev.filter((t) => t.id_tipo !== targetDelete.id_tipo));
      setDeleteModal(false);
    } catch {
      // mantener modal abierto
    } finally {
      setDeleting(false);
    }
  };

  return {
    types, loading, error, loadTypes,
    formModal, setFormModal, editing, formNombre, setFormNombre,
    formDesc, setFormDesc, formError, setFormError, saving,
    openCreate, openEdit, handleSave,
    deleteModal, setDeleteModal, deleting, targetDelete, openDelete, handleDelete,
  };
}
