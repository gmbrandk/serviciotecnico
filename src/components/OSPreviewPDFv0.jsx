// OSPreviewPDF.jsx
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';

// Nuevo color corporativo
const primary = '#1A4D8F'; // Azul petróleo profesional
const primaryLight = '#E6EEF7'; // Azul muy suave para fondos/accentos

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#333',
    lineHeight: 1.15,
  },

  /* -------- HEADER DEL NEGOCIO -------- */
  businessHeader: {
    borderBottomWidth: 1.5,
    borderBottomColor: primary,
    paddingBottom: 10,
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  businessLogoContainer: {
    width: 220,
    height: 35,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginRight: 12,
  },

  businessLogo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },

  businessInfo: {
    flex: 1,
    alignItems: 'flex-end',
    textAlign: 'right',
  },

  businessName: {
    fontSize: 14,
    fontWeight: 700,
    color: primary,
    marginBottom: 2,
  },

  businessText: {
    fontSize: 10,
    color: '#666',
  },

  /* -------- HEADER DEL COMPROBANTE -------- */
  header: {
    borderBottomWidth: 1,
    borderBottomColor: primary,
    paddingBottom: 10,
    marginBottom: 20,
  },

  title: {
    fontSize: 16,
    fontWeight: 700,
    color: primary,
    marginBottom: 4,
  },

  code: {
    backgroundColor: primaryLight,
    padding: 4,
    borderLeftWidth: 3,
    borderLeftColor: primary,
    fontSize: 12,
    fontWeight: 700,
    color: primary,
  },

  meta: {
    marginTop: 6,
    fontSize: 11,
    color: '#555',
  },

  /* -------- SECCIONES -------- */
  section: {
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: primary,
    borderLeftWidth: 3,
    borderLeftColor: primary,
    paddingLeft: 6,
    marginBottom: 10,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  gridItem: {
    width: '50%',
    marginBottom: 4,
    fontSize: 11,
    lineHeight: 1.2,
  },

  textBox: {
    backgroundColor: '#f7f7f7',
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ececec',
    fontSize: 11,
    lineHeight: 1.25,
  },

  /* -------- TABLA -------- */
  table: {
    width: '100%',
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: primaryLight,
    borderBottomWidth: 1.5,
    borderBottomColor: primary,
    paddingBottom: 6,
  },

  th: {
    width: '25%',
    fontSize: 11,
    fontWeight: 700,
    color: primary,
  },

  tr: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 6,
  },

  td: {
    width: '25%',
    fontSize: 10.5,
  },

  total: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'right',
    color: primary,
    fontWeight: 700,
  },

  /* -------- FOOTER -------- */
  footer: {
    borderTopWidth: 1,
    borderTopColor: primary,
    paddingTop: 10,
    marginTop: 20,
    fontSize: 10,
    color: '#555',
    lineHeight: 1.2,
  },
});

export default function OSPreviewPDF({ orden, negocio = {} }) {
  const {
    nombre = 'Nombre del Negocio',
    ruc = '',
    direccion = '',
    telefono = '',
    email = '',
    logo = null,
  } = negocio;

  return (
    <Document>
      <Page style={styles.page}>
        {/* HEADER NEGOCIO */}
        <View style={styles.businessHeader}>
          {logo && (
            <View style={styles.businessLogoContainer}>
              <Image src={logo} style={styles.businessLogo} />
            </View>
          )}

          <View style={styles.businessInfo}>
            <Text style={styles.businessName}>{nombre}</Text>
            {ruc && <Text style={styles.businessText}>RUC: {ruc}</Text>}
            {direccion && <Text style={styles.businessText}>{direccion}</Text>}
            {telefono && (
              <Text style={styles.businessText}>Tel: {telefono}</Text>
            )}
            {email && <Text style={styles.businessText}>{email}</Text>}
          </View>
        </View>

        {/* HEADER COMPROBANTE */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Comprobante de Ingreso / Orden de Servicio
          </Text>
          <Text style={styles.code}>{orden.codigo}</Text>
          <Text style={styles.meta}>
            Fecha de ingreso: {new Date(orden.fechaIngreso).toLocaleString()}
          </Text>
          <Text style={styles.meta}>
            Atendido por: {orden.tecnico?.nombre || '—'}
          </Text>
        </View>

        {/* CLIENTE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>

          <View style={styles.grid}>
            <Text style={styles.gridItem}>
              <Text style={{ fontWeight: 700 }}>Nombre: </Text>
              {orden.representante.nombres} {orden.representante.apellidos}
            </Text>
            <Text style={styles.gridItem}>
              <Text style={{ fontWeight: 700 }}>DNI: </Text>
              {orden.representante.dni}
            </Text>
            <Text style={styles.gridItem}>
              <Text style={{ fontWeight: 700 }}>Email: </Text>
              {orden.representante.email}
            </Text>
            <Text style={styles.gridItem}>
              <Text style={{ fontWeight: 700 }}>Teléfono: </Text>
              {orden.representante.telefono}
            </Text>
          </View>
        </View>

        {/* EQUIPO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipo</Text>

          <View style={styles.grid}>
            <Text style={styles.gridItem}>
              <Text style={{ fontWeight: 700 }}>Tipo: </Text>
              {orden.equipo.tipo}
            </Text>
            <Text style={styles.gridItem}>
              <Text style={{ fontWeight: 700 }}>Marca: </Text>
              {orden.equipo.marca}
            </Text>
            <Text style={styles.gridItem}>
              <Text style={{ fontWeight: 700 }}>Modelo: </Text>
              {orden.equipo.modelo}
            </Text>
            <Text style={styles.gridItem}>
              <Text style={{ fontWeight: 700 }}>Serie: </Text>
              {orden.equipo.nroSerie}
            </Text>
          </View>
        </View>

        {/* OBSERVACIONES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observaciones</Text>
          <Text style={styles.textBox}>{orden.observaciones}</Text>
        </View>

        {/* TABLA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Servicios</Text>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.th}>Descripción</Text>
              <Text style={styles.th}>Cant.</Text>
              <Text style={styles.th}>Precio U.</Text>
              <Text style={styles.th}>Subtotal</Text>
            </View>

            {orden.lineasServicio.map((l, i) => (
              <View key={i} style={styles.tr}>
                <Text style={styles.td}>{l.descripcion}</Text>
                <Text style={styles.td}>{l.cantidad}</Text>
                <Text style={styles.td}>S/.{l.precioUnitario}</Text>
                <Text style={styles.td}>S/.{l.subtotal}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.total}>Total: S/.{orden.total}</Text>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text>
            Este comprobante certifica la recepción del equipo para diagnóstico
            y/o reparación. La empresa no se responsabiliza por accesorios no
            declarados.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
