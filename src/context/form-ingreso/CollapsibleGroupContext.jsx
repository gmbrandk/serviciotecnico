// context/CollapsibleGroupContext.js
import { createContext, useCallback, useContext, useReducer } from 'react';

const CollapsibleGroupContext = createContext(null);

function groupReducer(state, action) {
  switch (action.type) {
    // ------------------------------------------------------------
    // REGISTER
    // ------------------------------------------------------------
    case 'REGISTER': {
      console.groupCollapsed(
        `%c📌 REGISTER Collapsible`,
        'background:#223;color:#9cf;padding:2px 6px;border-radius:4px'
      );
      console.log('Payload:', action.payload);

      const exists = state.collapsibles.some((c) => c.id === action.payload.id);
      if (exists) {
        console.log(
          '⛔ Ya existía un collapsible con este id → no se vuelve a registrar'
        );
        console.groupEnd();
        return state;
      }

      const newState = {
        ...state,
        collapsibles: [...state.collapsibles, action.payload].sort(
          (a, b) => a.index - b.index
        ),
      };

      console.log('🆕 Registrado → estado final:', newState.collapsibles);
      console.groupEnd();

      return newState;
    }

    // ------------------------------------------------------------
    // OPEN
    // ------------------------------------------------------------
    case 'OPEN': {
      const { id, index } = action.payload;

      console.groupCollapsed(
        `%c📂 OPEN Collapsible`,
        'background:#311;color:#f88;padding:2px 6px;border-radius:4px'
      );
      console.log('Se abrió el id:', id, 'en index:', index);
      console.log('Estado actual:', state.collapsibles);

      console.groupCollapsed(
        '%c🔍 Evaluando qué otros cerrar...',
        'color:#ccc'
      );

      state.collapsibles.forEach((col) => {
        const reason = [];

        if (col.id === id) {
          reason.push('→ Es el mismo id, NO cerrar');
        } else {
          if (col.openedByUser?.current) {
            reason.push('→ Fue abierto manualmente (openedByUser), NO cerrar');
          } else if (typeof col.index === 'number' && col.index < index) {
            reason.push(
              `→ Index ${col.index} < ${index}, se cierra (colapsable anterior)`
            );

            requestAnimationFrame(() => {
              console.log(`   🔻 Cerrando via setOpen(false):`, col.id);
              col.setOpen(false);
            });
          } else {
            reason.push('→ No cumple condiciones de cierre');
          }
        }

        console.groupCollapsed(
          `%c📁 Collapsible id="${col.id}" index=${col.index}`,
          'color:#7cf'
        );
        reason.forEach((r) => console.log(r));
        console.groupEnd();
      });

      console.groupEnd(); // end "Evaluando qué otros cerrar..."
      console.groupEnd(); // end OPEN group

      return state; // importante: no mutamos la lista
    }

    default:
      return state;
  }
}

export function CollapsibleGroupProvider({ children }) {
  const [state, dispatch] = useReducer(groupReducer, { collapsibles: [] });

  const registerCollapsible = useCallback((id, index, api) => {
    console.groupCollapsed(
      `%c📥 registerCollapsible() llamada`,
      'background:#004;color:#8bf;padding:2px 6px;border-radius:4px'
    );
    console.log('id:', id, 'index:', index, 'api:', api);
    console.groupEnd();

    dispatch({ type: 'REGISTER', payload: { id, index, ...api } });
  }, []);

  const registerOpen = useCallback((id, index) => {
    console.groupCollapsed(
      `%c📤 registerOpen() llamada`,
      'background:#200;color:#faa;padding:2px 6px;border-radius:4px'
    );
    console.log('id:', id, 'index:', index);
    console.groupEnd();

    dispatch({ type: 'OPEN', payload: { id, index } });
  }, []);

  const value = { registerCollapsible, registerOpen };

  return (
    <CollapsibleGroupContext.Provider value={value}>
      {children}
    </CollapsibleGroupContext.Provider>
  );
}

export function useCollapsibleGroup() {
  return useContext(CollapsibleGroupContext);
}
