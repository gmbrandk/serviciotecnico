// context/CollapsibleGroupContext.js
import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  useRef,
} from 'react';

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

    default:
      return state;
  }
}

export function CollapsibleGroupProvider({ children }) {
  const [state, dispatch] = useReducer(groupReducer, {
    collapsibles: [],
  });

  // 🔒 flag global: solo el usuario puede provocar cierres
  const userActionRef = useRef(false);

  const registerCollapsible = useCallback((id, index, api) => {
    dispatch({ type: 'REGISTER', payload: { id, index, ...api } });
  }, []);

  const registerOpen = useCallback(
    (id, index) => {
      userActionRef.current = true;

      state.collapsibles.forEach((col) => {
        if (col.id === id) return;

        // ❗ SOLO cerrar si fue acción del usuario
        if (!col.openedByUser?.current && col.index < index) {
          console.log('🔻 [GROUP] cerrando', col.id);
          col.setOpen(false);
        }
      });

      // reset flag
      requestAnimationFrame(() => {
        userActionRef.current = false;
      });
    },
    [state.collapsibles]
  );

  return (
    <CollapsibleGroupContext.Provider
      value={{ registerCollapsible, registerOpen }}
    >
      {children}
    </CollapsibleGroupContext.Provider>
  );
}

export function useCollapsibleGroup() {
  return useContext(CollapsibleGroupContext);
}
