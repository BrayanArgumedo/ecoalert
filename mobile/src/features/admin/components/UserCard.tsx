// src/features/admin/components/UserCard.tsx
// Tarjeta de usuario para la pantalla de gestión del Admin.
// Muestra avatar (con fallback a iniciales mientras carga), rol con color
// y badge de estado. Si el usuario no es el propio Admin, muestra botones
// para cambiar rol y activar/desactivar la cuenta.

import { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getRolColor } from '../../../core/utils/roles';
import { avatarUrl } from '../../../core/utils/avatar';
import type { Usuario } from '../../../core/services/usersService';

interface UserCardProps {
  item: Usuario;
  currentUserId: string;
  onChangeRole: (user: Usuario) => void;
  onToggleStatus: (user: Usuario) => void;
}

export function initials(nombre: string) {
  return nombre.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

export default function UserCard({ item, currentUserId, onChangeRole, onToggleStatus }: UserCardProps) {
  const rolColor    = getRolColor(item.nombre_rol);
  const isActive    = item.estado === 1;
  const isSelf      = item.id_usuario === currentUserId;
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <View style={{
      backgroundColor: '#ffffff', borderRadius: 16,
      borderWidth: 1, borderColor: '#f0f0f0', overflow: 'hidden',
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    }}>
      <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: rolColor }} />

      <View style={{ padding: 14, paddingLeft: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {/* Avatar */}
          <View style={{
            width: 46, height: 46, borderRadius: 14, overflow: 'hidden',
            backgroundColor: `${rolColor}15`, borderWidth: 1.5, borderColor: `${rolColor}30`,
            alignItems: 'center', justifyContent: 'center',
          }}>
            {/* Fallback inicial (iniciales) — siempre presente */}
            {!imgLoaded && (
              <Text style={{ color: rolColor, fontSize: 15, fontWeight: '800', position: 'absolute' }}>
                {initials(item.nombre)}
              </Text>
            )}
            {item.avatar_seed && (
              <Image
                source={{ uri: avatarUrl(item.avatar_seed, 46) }}
                style={{ width: 46, height: 46, opacity: imgLoaded ? 1 : 0 }}
                onLoad={() => setImgLoaded(true)}
              />
            )}
          </View>

          {/* Info */}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ color: '#111827', fontSize: 15, fontWeight: '700' }} numberOfLines={1}>
                {item.nombre}
              </Text>
              {isSelf && (
                <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, backgroundColor: '#f0fdf4' }}>
                  <Text style={{ color: '#16a34a', fontSize: 10, fontWeight: '700' }}>Tú</Text>
                </View>
              )}
            </View>
            <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 1 }} numberOfLines={1}>
              {item.correo}
            </Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: `${rolColor}12` }}>
                <Text style={{ color: rolColor, fontSize: 11, fontWeight: '700' }}>{item.nombre_rol}</Text>
              </View>
              <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: isActive ? '#f0fdf4' : '#fef2f2' }}>
                <Text style={{ color: isActive ? '#16a34a' : '#dc2626', fontSize: 11, fontWeight: '700' }}>
                  {isActive ? 'Activo' : 'Inactivo'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {!isSelf && (
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <TouchableOpacity
              onPress={() => onChangeRole(item)}
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 10, backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#dbeafe' }}
            >
              <Ionicons name="shield-outline" size={14} color="#2563eb" />
              <Text style={{ color: '#2563eb', fontSize: 12, fontWeight: '700' }}>Cambiar rol</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onToggleStatus(item)}
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 10, backgroundColor: isActive ? '#fef2f2' : '#f0fdf4', borderWidth: 1, borderColor: isActive ? '#fecaca' : '#bbf7d0' }}
            >
              <Ionicons name={isActive ? 'lock-closed-outline' : 'lock-open-outline'} size={14} color={isActive ? '#dc2626' : '#16a34a'} />
              <Text style={{ color: isActive ? '#dc2626' : '#16a34a', fontSize: 12, fontWeight: '700' }}>
                {isActive ? 'Desactivar' : 'Activar'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
