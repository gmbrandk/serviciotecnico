import { formatValue } from '../../utils/form-ingreso/formatValue';
import FieldList from './FieldList';

const CLIENTE_VISIBLE_FIELDS = [
  'dni',
  'nombres',
  'apellidos',
  'telefono',
  'email',
  'direccion',
];

export default function ClienteDiffView({ cliente }) {
  if (!cliente) return null;

  if (cliente.mode === 'replace') {
    const data = cliente.data || {};
    const isNew = data.isNew === true;

    return (
      <li>
        <strong>
          {isNew ? 'Cliente nuevo ingresado' : 'Cliente reemplazado'}
        </strong>

        <ul className="diff-sublist">
          {CLIENTE_VISIBLE_FIELDS.map((field) => {
            if (!(field in data)) return null;
            return (
              <li key={field}>
                {field}: <strong>{formatValue(data[field])}</strong>
              </li>
            );
          })}
        </ul>
      </li>
    );
  }

  if (cliente.mode === 'edit') {
    return <FieldList title="Cliente (editado)" fields={cliente.fields} />;
  }

  return null;
}
