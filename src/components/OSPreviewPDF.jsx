import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 38,
    fontSize: 12,
    fontFamily: 'Helvetica',
    color: '#333',
  },

  /* ------------ EXTRA HEADER ------------ */
  extraHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#EB0901',
    paddingBottom: 14,
    marginBottom: 18,
  },
  extraHeaderTitle: {
    fontSize: 17,
    fontWeight: 700,
    marginBottom: 4,
    color: '#333',
  },
  extraHeaderText: {
    fontSize: 12,
    color: '#666',
  },

  /* ------------ HEADER NORMAL ------------ */
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#EB0901',
    paddingBottom: 14,
    marginBottom: 26,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 6,
  },
  code: {
    backgroundColor: '#EB090112',
    padding: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#EB0901',
    fontSize: 14,
    fontWeight: 700,
    color: '#EB0901',
  },
  meta: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },

  /* ------------ SECCIONES ------------ */
  section: {
    marginBottom: 26,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#666',
    borderLeftWidth: 4,
    borderLeftColor: '#EB0901',
    paddingLeft: 8,
    marginBottom: 14,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
    marginBottom: 6,
    fontSize: 13,
  },

  textBox: {
    backgroundColor: '#f7f7f7',
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ececec',
    fontSize: 13,
    lineHeight: 1.4,
  },

  /* ------------ TABLA ------------ */
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    borderBottomWidth: 2,
    borderBottomColor: '#EB0901',
    paddingBottom: 8,
  },
  th: {
    width: '25%',
    fontSize: 14,
    fontWeight: 700,
    color: '#666',
  },
  tr: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
  },
  td: {
    width: '25%',
    fontSize: 13,
  },

  total: {
    marginTop: 18,
    fontSize: 17,
    textAlign: 'right',
    color: '#EB0901',
    fontWeight: 700,
  },

  /* ------------ FOOTER EXTRA ------------ */
  extraFooter: {
    borderTopWidth: 1,
    borderTopColor: '#EB0901',
    paddingTop: 14,
    marginTop: 26,
    fontSize: 13,
    color: '#666',
  },
});

export default function OSPreviewPDF({ orden }) {
  return (
    <Document>
      <Page style={styles.page}>
        {/* -------- EXTRA HEADER -------- */}
        <View style={styles.extraHeader}>
          <Text style={styles.extraHeaderTitle}>
            Lorem ipsum dolor sit amet
          </Text>
          <Text style={styles.extraHeaderText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
            consequat ante vitae lorem pulvinar, vitae ullamcorper nunc pretium.
          </Text>
        </View>

        {/* -------- HEADER PRINCIPAL -------- */}
        <View style={styles.header}>
          <Text style={styles.title}>Orden de Servicio</Text>
          <Text style={styles.code}>{orden.codigo}</Text>
          <Text style={styles.meta}>
            Fecha de ingreso: {orden.fechaIngreso}
          </Text>
        </View>

        {/* -------- CLIENTE -------- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>

          <View style={styles.grid}>
            <Text style={styles.gridItem}>
              <Text style={{ fontWeight: 700 }}>Nombre: </Text>
              {orden.cliente.nombres} {orden.cliente.apellidos}
            </Text>

            <Text style={styles.gridItem}>
              <Text style={{ fontWeight: 700 }}>Teléfono: </Text>
              {orden.cliente.telefono}
            </Text>

            <Text style={styles.gridItem}>
              <Text style={{ fontWeight: 700 }}>Email: </Text>
              {orden.cliente.email}
            </Text>

            <Text style={styles.gridItem}>
              <Text style={{ fontWeight: 700 }}>Dirección: </Text>
              {orden.cliente.direccion}
            </Text>
          </View>
        </View>

        {/* -------- EQUIPO -------- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipo</Text>
          <View style={styles.grid}>
            <Text style={styles.gridItem}>
              <Text style={{ fontWeight: 700 }}>Marca: </Text>
              {orden.equipo.marca}
            </Text>
            <Text style={styles.gridItem}>
              <Text style={{ fontWeight: 700 }}>Modelo: </Text>
              {orden.equipo.modelo}
            </Text>
            <Text style={styles.gridItem}>
              <Text style={{ fontWeight: 700 }}>N° Serie: </Text>
              {orden.equipo.nroSerie}
            </Text>
            <Text style={styles.gridItem}>
              <Text style={{ fontWeight: 700 }}>CPU: </Text>
              {orden.equipo.cpu}
            </Text>
            <Text style={styles.gridItem}>
              <Text style={{ fontWeight: 700 }}>RAM: </Text>
              {orden.equipo.ram}
            </Text>
            <Text style={styles.gridItem}>
              <Text style={{ fontWeight: 700 }}>Almacenamiento: </Text>
              {orden.equipo.almacenamiento}
            </Text>
            <Text style={styles.gridItem}>
              <Text style={{ fontWeight: 700 }}>GPU: </Text>
              {orden.equipo.gpu}
            </Text>
          </View>
        </View>

        {/* -------- DIAGNÓSTICO -------- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diagnóstico del Cliente</Text>
          <Text style={styles.textBox}>{orden.diagnosticoCliente}</Text>
        </View>

        {/* -------- OBSERVACIONES -------- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observaciones</Text>
          <Text style={styles.textBox}>{orden.observaciones}</Text>
        </View>

        {/* -------- TABLA -------- */}
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
                <Text style={styles.td}>${l.precioUnitario}</Text>
                <Text style={styles.td}>${l.subtotal}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.total}>${orden.total}</Text>
        </View>

        {/* -------- FOOTER EXTRA -------- */}
        <View style={styles.extraFooter}>
          <Text>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus
            feugiat lorem sit amet quam imperdiet, vitae sagittis neque
            tincidunt.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
