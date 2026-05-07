import * as Print from 'expo-print';
import type { Statistics } from '../hooks/useStatistics';
import type { Incidencia } from '../../../core/services/incidentsService';

const GREEN  = '#15803d';
const AMBER  = '#d97706';
const BLUE   = '#2563eb';
const RED    = '#dc2626';
const GRAY   = '#6b7280';

const ESTADO_COLOR: Record<string, string> = {
  pendiente:  AMBER,
  en_proceso: BLUE,
  resuelta:   GREEN,
};

const ESTADO_LABEL: Record<string, string> = {
  pendiente:  'Pendiente',
  en_proceso: 'En proceso',
  resuelta:   'Resuelta',
};

const PRIORIDAD_COLOR: Record<string, string> = {
  Normal:  GREEN,
  Alta:    AMBER,
  Crítica: RED,
};

function barRow(label: string, count: number, pctWidth: number, color: string) {
  return `
    <tr>
      <td style="padding:5px 8px 5px 0;font-size:12px;color:#374151;white-space:nowrap;width:140px">${label}</td>
      <td style="padding:5px 0;width:100%">
        <div style="background:#f3f4f6;border-radius:4px;height:16px;width:100%;position:relative">
          <div style="background:${color};border-radius:4px;height:16px;width:${Math.max(pctWidth, 2)}%"></div>
        </div>
      </td>
      <td style="padding:5px 0 5px 10px;font-size:12px;font-weight:700;color:${color};text-align:right;white-space:nowrap">${count}</td>
    </tr>`;
}

function section(number: number, title: string, content: string) {
  return `
    <div style="margin-bottom:28px">
      <div style="border-bottom:2px solid #e5e7eb;padding-bottom:6px;margin-bottom:14px;display:flex;align-items:center;gap:8px">
        <span style="background:${GREEN};color:white;border-radius:4px;padding:2px 7px;font-size:11px;font-weight:700">${number}</span>
        <span style="font-size:14px;font-weight:700;color:#111827;text-transform:uppercase;letter-spacing:0.5px">${title}</span>
      </div>
      ${content}
    </div>`;
}

export async function generatePdfUri(stats: Statistics, rawData: Incidencia[]): Promise<string> {
  const now   = new Date();
  const fecha = now.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
  const hora  = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  // ── Sección 1: Resumen ──────────────────────────────────────────
  const cardStyle = (color: string) =>
    `border:1.5px solid ${color}20;border-radius:8px;padding:12px 16px;background:${color}08;flex:1;min-width:100px`;

  const resumen = `
    <div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap">
      <div style="${cardStyle(GREEN)}">
        <div style="font-size:11px;color:${GRAY};margin-bottom:4px">TOTAL INCIDENCIAS</div>
        <div style="font-size:26px;font-weight:800;color:${GREEN}">${stats.total}</div>
      </div>
      <div style="${cardStyle(AMBER)}">
        <div style="font-size:11px;color:${GRAY};margin-bottom:4px">PENDIENTES</div>
        <div style="font-size:26px;font-weight:800;color:${AMBER}">${stats.pendientes}</div>
      </div>
      <div style="${cardStyle(BLUE)}">
        <div style="font-size:11px;color:${GRAY};margin-bottom:4px">EN PROCESO</div>
        <div style="font-size:26px;font-weight:800;color:${BLUE}">${stats.enProceso}</div>
      </div>
      <div style="${cardStyle(GREEN)}">
        <div style="font-size:11px;color:${GRAY};margin-bottom:4px">RESUELTAS</div>
        <div style="font-size:26px;font-weight:800;color:${GREEN}">${stats.resueltas}</div>
      </div>
    </div>
    <div style="background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:8px;padding:12px 16px;text-align:center">
      <div style="font-size:11px;color:${GRAY};margin-bottom:2px">TASA DE RESOLUCIÓN</div>
      <div style="font-size:32px;font-weight:800;color:${GREEN}">${stats.tasaRes}%</div>
    </div>
    ${stats.incConHeridos > 0 ? `
    <div style="margin-top:10px;background:#fef2f2;border:1.5px solid #fca5a5;border-radius:8px;padding:10px 16px;display:flex;gap:24px">
      <div><div style="font-size:11px;color:${GRAY}">INCIDENCIAS CON HERIDOS</div><div style="font-size:20px;font-weight:800;color:${RED}">${stats.incConHeridos}</div></div>
      <div><div style="font-size:11px;color:${GRAY}">TOTAL HERIDOS REPORTADOS</div><div style="font-size:20px;font-weight:800;color:${RED}">${stats.totalHeridos}</div></div>
    </div>` : ''}`;

  // ── Sección 2: Por tipo ─────────────────────────────────────────
  const porTipo = `
    <table style="width:100%;border-collapse:collapse">
      ${stats.porTipo.map((s) => barRow(s.label, s.count, s.pct, GREEN)).join('')}
    </table>`;

  // ── Sección 3: Por estado ───────────────────────────────────────
  const porEstado = `
    <table style="width:100%;border-collapse:collapse">
      ${stats.porEstado.map((s) => {
        const key = s.label === 'Pendiente' ? 'pendiente' : s.label === 'En proceso' ? 'en_proceso' : 'resuelta';
        return barRow(s.label, s.count, s.pct, ESTADO_COLOR[key] ?? GRAY);
      }).join('')}
    </table>`;

  // ── Sección 4: Por prioridad ────────────────────────────────────
  const porPrioridad = `
    <table style="width:100%;border-collapse:collapse">
      ${stats.porPrioridad.map((s) => barRow(s.label, s.count, s.pct, PRIORIDAD_COLOR[s.label] ?? GRAY)).join('')}
    </table>`;

  // ── Sección 5: Por localidad ────────────────────────────────────
  const porLocalidad = `
    <table style="width:100%;border-collapse:collapse">
      ${stats.porLocalidad.slice(0, 10).map((s) => barRow(s.label, s.count, s.pct, '#7c3aed')).join('')}
    </table>`;

  // ── Sección 6: Por servicio ─────────────────────────────────────
  const porServicio = `
    <table style="width:100%;border-collapse:collapse">
      ${stats.porServicio.map((s) => barRow(s.label, s.count, s.pct, BLUE)).join('')}
    </table>`;

  // ── Sección 7: Tabla de incidencias ────────────────────────────
  const thStyle = `style="background:#15803d;color:white;padding:8px 10px;font-size:11px;font-weight:700;text-align:left"`;
  const tdStyle = (idx: number) =>
    `style="padding:7px 10px;font-size:11px;border-bottom:1px solid #f3f4f6;background:${idx % 2 === 0 ? '#ffffff' : '#f9fafb'}"`;

  const tablaIncidencias = `
    <div style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb">
        <thead>
          <tr>
            <th ${thStyle}>#</th>
            <th ${thStyle}>Tipo</th>
            <th ${thStyle}>Estado</th>
            <th ${thStyle}>Prioridad</th>
            <th ${thStyle}>Reportado por</th>
            <th ${thStyle}>Localidad</th>
            <th ${thStyle}>Dirección</th>
            <th ${thStyle}>Fecha</th>
          </tr>
        </thead>
        <tbody>
          ${rawData.map((inc, idx) => {
            const f = new Date(inc.fecha_reporte).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: '2-digit' });
            const estadoColor = ESTADO_COLOR[inc.estado] ?? GRAY;
            const estadoLbl   = ESTADO_LABEL[inc.estado] ?? inc.estado;
            const priColor    = inc.prioridad === 'alta' ? AMBER : GREEN;
            return `
              <tr>
                <td ${tdStyle(idx)} style="color:${GRAY};font-weight:600;padding:7px 10px;font-size:11px;border-bottom:1px solid #f3f4f6;background:${idx % 2 === 0 ? '#ffffff' : '#f9fafb'}">${idx + 1}</td>
                <td ${tdStyle(idx)}>${inc.nombre_tipo}</td>
                <td ${tdStyle(idx)}><span style="color:${estadoColor};font-weight:700">${estadoLbl}</span></td>
                <td ${tdStyle(idx)}><span style="color:${priColor};font-weight:700;text-transform:capitalize">${inc.prioridad}</span></td>
                <td ${tdStyle(idx)}>${inc.nombre_usuario}</td>
                <td ${tdStyle(idx)}>${inc.localidad_usuario}</td>
                <td ${tdStyle(idx)}>${inc.direccion ?? '—'}</td>
                <td ${tdStyle(idx)}>${f}</td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;

  // ── HTML completo ───────────────────────────────────────────────
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #111827; background: #fff; padding: 32px; font-size: 13px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>

  <!-- Encabezado -->
  <div style="background:${GREEN};color:white;border-radius:10px;padding:20px 24px;margin-bottom:28px;display:flex;justify-content:space-between;align-items:flex-start">
    <div>
      <div style="font-size:22px;font-weight:800;letter-spacing:-0.5px">🌿 EcoAlert</div>
      <div style="font-size:12px;opacity:0.85;margin-top:2px">Gestión de Emergencias Ambientales — Cereté, Córdoba</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:14px;font-weight:700">Reporte de Estadísticas</div>
      <div style="font-size:11px;opacity:0.85;margin-top:2px">Generado: ${fecha}, ${hora}</div>
    </div>
  </div>

  ${section(1, 'Resumen Ejecutivo', resumen)}
  ${section(2, 'Distribución por Tipo de Emergencia', porTipo)}
  ${section(3, 'Distribución por Estado', porEstado)}
  ${section(4, 'Distribución por Prioridad', porPrioridad)}
  ${section(5, 'Top Localidades con más Incidencias', porLocalidad)}
  ${section(6, 'Servicios más Requeridos', porServicio)}
  ${section(7, `Listado Completo de Incidencias (${rawData.length})`, tablaIncidencias)}

  <!-- Footer -->
  <div style="margin-top:32px;padding-top:14px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;color:${GRAY};font-size:10px">
    <span>EcoAlert · Gestión de Emergencias Ambientales · Cereté, Córdoba</span>
    <span>${fecha} ${hora}</span>
  </div>

</body>
</html>`;

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  return uri;
}
