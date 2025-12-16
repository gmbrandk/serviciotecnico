// src\styles\form-ingreso\index.js

// 🌍 globales (normal CSS, no modules)
// import './base.css';
import './layout.css';

// 🎨 CSS Modules aislados (estos exportan objetos con nombres hashed)
import { default as autocompleteStyles } from './Autocomplete.module.css';
import { default as buttonsStyles } from './Buttons.module.css';
import { default as fieldsetStyle } from './Fieldset.module.css';
import { default as inputsStyles } from './Inputs.module.css';
import { default as lineaServicioStyles } from './LineaServicio.module.css';
import { default as formIngresoPageStyles } from './formIngresoPage.module.css';
export {
  autocompleteStyles,
  buttonsStyles,
  fieldsetStyle,
  formIngresoPageStyles,
  inputsStyles,
  lineaServicioStyles,
};
