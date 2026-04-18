import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StatusBar, Platform, Modal, FlatList, ActivityIndicator, Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCreateIncident } from '../../src/features/incidents/hooks/useCreateIncident';
import SectionCard from '../../src/shared/components/SectionCard';

type IoniconsName = keyof typeof Ionicons.glyphMap;

const TIPO_ICON: Record<string, IoniconsName> = {
  Terremoto:                 'pulse-outline',
  'Inundación':              'water-outline',
  Derrumbe:                  'alert-circle-outline',
  'Huracán':                 'thunderstorm-outline',
  'Incendio Forestal':       'flame-outline',
  Deslizamiento:             'trending-down-outline',
  'Tormenta Eléctrica':      'flash-outline',
  'Contaminación Ambiental': 'leaf-outline',
};

const SERVICIO_ICON: Record<string, IoniconsName> = {
  Bomberos:            'flame-outline',
  Policia:             'shield-outline',
  'Asistencia Medica': 'medkit-outline',
};

export default function CreateIncidentScreen() {
  const router = useRouter();
  const {
    tipos, servicios, loadingData,
    tipoSeleccionado, descripcion, setDescripcion,
    direccion, setDireccion,
    hayHeridos, setHayHeridos,
    cantHeridos, setCantHeridos,
    serviciosSel, toggleServicio,
    modalTipo, setModalTipo,
    busquedaTipo, setBusquedaTipo,
    tiposFiltrados, seleccionarTipo,
    loading, error, exito,
    handleSubmit, resetForm,
  } = useCreateIncident();

  // ── Pantalla de éxito ────────────────────────────────────────────
  if (exito) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f8faf9' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8faf9" translucent={false} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <View style={{ width: 88, height: 88, borderRadius: 28, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginBottom: 24, shadowColor: '#16a34a', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 14, elevation: 8 }}>
            <Ionicons name="checkmark-circle" size={48} color="#16a34a" />
          </View>
          <Text style={{ color: '#111827', fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 10 }}>¡Emergencia reportada!</Text>
          <Text style={{ color: '#6b7280', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 36 }}>
            Tu reporte fue enviado. Los servicios de respuesta serán notificados.
          </Text>
          <TouchableOpacity onPress={() => { resetForm(); router.replace('/(tabs)/home'); }} activeOpacity={0.85} style={{ width: '100%' }}>
            <LinearGradient colors={['#15803d', '#16a34a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 15 }}>Ver mis reportes</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={resetForm} style={{ marginTop: 14, alignItems: 'center' }}>
            <Text style={{ color: '#16a34a', fontSize: 14, fontWeight: '600' }}>Reportar otra emergencia</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8faf9' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8faf9" translucent={false} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ══ Header ══════════════════════════════════════════════════ */}
        <LinearGradient
          colors={['#dcfce7', '#f0fdf4', '#ffffff']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ paddingTop: Platform.OS === 'ios' ? 56 : 48, paddingHorizontal: 20, paddingBottom: 24, overflow: 'hidden' }}
        >
          <View style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(34,197,94,0.12)' }} />
          <View style={{ position: 'absolute', top: 20, right: 80, width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(134,239,172,0.2)' }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(220,38,38,0.1)', borderWidth: 1.5, borderColor: 'rgba(220,38,38,0.25)', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="warning" size={22} color="#dc2626" />
            </View>
            <View>
              <Text style={{ color: '#111827', fontSize: 22, fontWeight: '800' }}>Reportar emergencia</Text>
              <Text style={{ color: '#9ca3af', fontSize: 13, marginTop: 1 }}>Completa los datos del incidente</Text>
            </View>
          </View>
        </LinearGradient>

        {loadingData
          ? <View style={{ alignItems: 'center', paddingTop: 60 }}><ActivityIndicator size="large" color="#16a34a" /><Text style={{ color: '#9ca3af', marginTop: 14, fontSize: 14 }}>Cargando datos...</Text></View>
          : (
            <View style={{ paddingHorizontal: 20, paddingTop: 20, gap: 16 }}>

              {/* Tipo de emergencia */}
              <SectionCard title="Tipo de emergencia" icon="alert-circle-outline" required>
                <TouchableOpacity
                  onPress={() => setModalTipo(true)}
                  activeOpacity={0.8}
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1.5, borderColor: tipoSeleccionado ? '#16a34a' : '#e5e7eb', paddingHorizontal: 14, height: 52 }}
                >
                  <Ionicons name={tipoSeleccionado ? (TIPO_ICON[tipoSeleccionado.nombre] ?? 'alert-circle-outline') : 'alert-circle-outline'} size={18} color={tipoSeleccionado ? '#16a34a' : '#9ca3af'} style={{ marginRight: 10 }} />
                  <Text style={{ flex: 1, fontSize: 15, color: tipoSeleccionado ? '#111827' : '#9ca3af' }}>
                    {tipoSeleccionado?.nombre ?? 'Selecciona el tipo'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#9ca3af" />
                </TouchableOpacity>
              </SectionCard>

              {/* Descripción */}
              <SectionCard title="Descripción" icon="document-text-outline" required>
                <TextInput
                  value={descripcion}
                  onChangeText={(v) => { setDescripcion(v); }}
                  placeholder="Describe lo que está ocurriendo con el mayor detalle posible..."
                  placeholderTextColor="#9ca3af"
                  multiline numberOfLines={4} textAlignVertical="top"
                  style={{ backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1.5, borderColor: '#e5e7eb', paddingHorizontal: 14, paddingVertical: 12, color: '#111827', fontSize: 14, lineHeight: 22, minHeight: 100 }}
                />
              </SectionCard>

              {/* Dirección */}
              <SectionCard title="Dirección" icon="location-outline" subtitle="Opcional — ayuda a localizar el incidente">
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1.5, borderColor: '#e5e7eb', paddingHorizontal: 14, height: 52 }}>
                  <Ionicons name="location-outline" size={18} color="#9ca3af" style={{ marginRight: 10 }} />
                  <TextInput value={direccion} onChangeText={setDireccion} placeholder="Calle, barrio, referencia..." placeholderTextColor="#9ca3af" style={{ flex: 1, color: '#111827', fontSize: 15 }} />
                </View>
              </SectionCard>

              {/* Heridos */}
              <SectionCard title="¿Hay personas heridas?" icon="medkit-outline">
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: hayHeridos ? 14 : 0 }}>
                  <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500' }}>{hayHeridos ? 'Sí, hay heridos' : 'No hay heridos'}</Text>
                  <Switch value={hayHeridos} onValueChange={(v) => { setHayHeridos(v); if (!v) setCantHeridos(''); }} trackColor={{ false: '#e5e7eb', true: '#bbf7d0' }} thumbColor={hayHeridos ? '#16a34a' : '#9ca3af'} />
                </View>
                {hayHeridos && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1.5, borderColor: '#fca5a5', paddingHorizontal: 14, height: 52 }}>
                    <Ionicons name="people-outline" size={18} color="#dc2626" style={{ marginRight: 10 }} />
                    <TextInput value={cantHeridos} onChangeText={(v) => setCantHeridos(v.replace(/[^0-9]/g, ''))} placeholder="Número de heridos" placeholderTextColor="#9ca3af" keyboardType="numeric" style={{ flex: 1, color: '#111827', fontSize: 15 }} />
                  </View>
                )}
              </SectionCard>

              {/* Servicios requeridos */}
              <SectionCard title="Servicios requeridos" icon="call-outline" required subtitle="Selecciona todos los que apliquen">
                <View style={{ gap: 10 }}>
                  {servicios.map((s) => {
                    const activo = serviciosSel.includes(s.id_servicio);
                    return (
                      <TouchableOpacity key={s.id_servicio} onPress={() => toggleServicio(s.id_servicio)} activeOpacity={0.8}
                        style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: activo ? '#f0fdf4' : '#f9fafb', borderRadius: 12, borderWidth: 1.5, borderColor: activo ? '#16a34a' : '#e5e7eb', paddingHorizontal: 14, paddingVertical: 13 }}
                      >
                        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: activo ? '#dcfce7' : '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                          <Ionicons name={SERVICIO_ICON[s.nombre] ?? 'construct-outline'} size={18} color={activo ? '#16a34a' : '#6b7280'} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: activo ? '#15803d' : '#111827', fontWeight: '700', fontSize: 14 }}>{s.nombre}</Text>
                          <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 1 }}>Rol: {s.nombre_rol}</Text>
                        </View>
                        <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: activo ? '#16a34a' : '#d1d5db', backgroundColor: activo ? '#16a34a' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                          {activo && <Ionicons name="checkmark" size={13} color="white" />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </SectionCard>

              {/* Error */}
              {error !== '' && (
                <View style={{ backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fca5a5', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="alert-circle-outline" size={16} color="#dc2626" />
                    <Text style={{ color: '#dc2626', fontSize: 13, flex: 1 }}>{error}</Text>
                  </View>
                </View>
              )}

              {/* Botón enviar */}
              <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
                <LinearGradient colors={['#15803d', '#16a34a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10, shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 }}
                >
                  {loading ? <ActivityIndicator color="white" /> : <><Ionicons name="send-outline" size={18} color="white" /><Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>Enviar reporte</Text></>}
                </LinearGradient>
              </TouchableOpacity>

            </View>
          )
        }
      </ScrollView>

      {/* ══ Modal selector tipo emergencia ══════════════════════════ */}
      <Modal visible={modalTipo} animationType="slide" transparent onRequestClose={() => setModalTipo(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setModalTipo(false)} />
          <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderBottomWidth: 0, borderColor: '#e5e7eb', maxHeight: '72%' }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#e5e7eb', alignSelf: 'center', marginTop: 14, marginBottom: 18 }} />
            <Text style={{ color: '#111827', fontSize: 17, fontWeight: '800', paddingHorizontal: 24, marginBottom: 14 }}>Tipo de emergencia</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1.5, borderColor: '#e5e7eb', marginHorizontal: 20, marginBottom: 10, paddingHorizontal: 14, height: 46 }}>
              <Ionicons name="search-outline" size={16} color="#9ca3af" />
              <TextInput value={busquedaTipo} onChangeText={setBusquedaTipo} placeholder="Buscar tipo..." placeholderTextColor="#9ca3af" style={{ flex: 1, color: '#111827', fontSize: 14 }} autoFocus />
              {busquedaTipo.length > 0 && <TouchableOpacity onPress={() => setBusquedaTipo('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}><Ionicons name="close-circle" size={16} color="#9ca3af" /></TouchableOpacity>}
            </View>
            <FlatList
              data={tiposFiltrados}
              keyExtractor={(item) => item.id_tipo}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const sel = tipoSeleccionado?.id_tipo === item.id_tipo;
                return (
                  <TouchableOpacity onPress={() => seleccionarTipo(item)}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 14, borderRadius: 12, marginBottom: 4, backgroundColor: sel ? '#f0fdf4' : 'transparent', borderWidth: sel ? 1.5 : 0, borderColor: '#16a34a' }}
                  >
                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: sel ? '#dcfce7' : '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                      <Ionicons name={TIPO_ICON[item.nombre] ?? 'alert-circle-outline'} size={18} color={sel ? '#16a34a' : '#6b7280'} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: sel ? '#15803d' : '#111827', fontWeight: sel ? '700' : '500', fontSize: 14 }}>{item.nombre}</Text>
                      {item.descripcion && <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }} numberOfLines={1}>{item.descripcion}</Text>}
                    </View>
                    {sel && <Ionicons name="checkmark-circle" size={18} color="#16a34a" />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
