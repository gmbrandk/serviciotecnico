// context/CollapsibleGroupContext.js
import { createContext, useCallback, useContext, useReducer } from 'react';

const CollapsibleGroupContext = createContext(null);

function groupReducer(state, action) {
  switch (action.type) {
    case 'REGISTER': {
      const exists = state.collapsibles.some((c) => c.id === action.payload.id);
      if (exists) return state;
      return {
        ...state,
        collapsibles: [...state.collapsibles, action.payload].sort(
          (a, b) => a.index - b.index
        ),
      };
    }

    case 'OPEN': {
      const { id, index } = action.payload;

      // Cerrar previos (deferimos setOpen para no setState en render)
      state.collapsibles.forEach((col) => {
        // Si es el mismo id, saltar
        if (col.id === id) return;

        // Si fue abierto manualmente por el usuario, respetar
        if (col.openedByUser?.current) return;

        // Si el collapsible está antes en el orden (index menor), cerrarlo
        // Ajusta esta lógica si prefieres basarte en otra cosa (por ejemplo: grupo/parent)
        if (typeof col.index === 'number' && col.index < index) {
          requestAnimationFrame(() => {
            col.setOpen(false);
          });
        }
      });

      // no mutamos la lista, solo devolvemos el estado intacto
      return state;
    }

    default:
      return state;
  }
}

export function CollapsibleGroupProvider({ children }) {
  const [state, dispatch] = useReducer(groupReducer, { collapsibles: [] });

  const registerCollapsible = useCallback((id, index, api) => {
    dispatch({ type: 'REGISTER', payload: { id, index, ...api } });
  }, []);

  const registerOpen = useCallback((id, index) => {
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
