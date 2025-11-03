import os
import fnmatch

# ==============================
# ⚙️ Configuración
# ==============================
PROFUNDIDAD_MAX = 7  # Nivel máximo de profundidad
MOSTRAR_NODE_MODULES = True  # Mostrar "node_modules" pero no su contenido

# Carpetas que deben mostrarse pero no explorarse
CARPETAS_OCULTAS_PARCIALMENTE = {
    "node_modules",
    ".git",
    "dist",
    "build",
    ".venv",
    "__pycache__",
    "backend",
}


# ==============================
# 🧩 Cargar patrones de exclusión
# ==============================
def cargar_patrones_ignorados():
    """Carga patrones desde .gitignore o usa lista por defecto."""
    patrones = []
    if os.path.exists(".gitignore"):
        with open(".gitignore", "r", encoding="utf-8") as f:
            for linea in f:
                linea = linea.strip()
                if linea and not linea.startswith("#"):
                    patrones.append(linea)
    else:
        patrones = [
            "node_modules",
            "dist",
            "*.log",
            "*.tmp",
            "*.local",
            ".vscode/*",
            ".idea",
            ".DS_Store",
            "__pycache__",
            ".git",
        ]
    return patrones


IGNORAR_PATRONES = cargar_patrones_ignorados()


def esta_ignorado(path):
    """
    Devuelve True si un archivo o carpeta debe ser ignorado
    según los patrones de IGNORAR_PATRONES.
    """
    nombre = os.path.basename(path)
    for patron in IGNORAR_PATRONES:
        # Coincidencia exacta
        if nombre == patron:
            return True
        # Coincidencia tipo glob
        if fnmatch.fnmatch(nombre, patron) or fnmatch.fnmatch(path, patron):
            return True
        # Coincidencia con patrones tipo "carpeta/*"
        if patron.endswith("/*") and nombre == patron[:-2]:
            return True
    return False


# ==============================
# 🌳 Generador del árbol
# ==============================
def build_tree(directory, prefix="", nivel=1):
    lines = []
    if nivel > PROFUNDIDAD_MAX:
        return lines

    try:
        files = sorted(os.listdir(directory))
    except PermissionError:
        return lines

    for i, file in enumerate(files):
        path = os.path.join(directory, file)

        # --- Comportamiento especial para node_modules ---
        if file == "node_modules":
            if MOSTRAR_NODE_MODULES:
                connector = "├── " if i < len(files) - 1 else "└── "
                lines.append(prefix + connector + file)
                extension = "│   " if i < len(files) - 1 else "    "
                lines.append(prefix + extension + "└── ... (contenido omitido)")
            continue  # No explorar

        # --- Carpetas parcialmente ocultas (fallback general) ---
        if file in CARPETAS_OCULTAS_PARCIALMENTE and file != "node_modules":
            connector = "├── " if i < len(files) - 1 else "└── "
            lines.append(prefix + connector + file)
            extension = "│   " if i < len(files) - 1 else "    "
            lines.append(prefix + extension + "└── ... (contenido omitido)")
            continue

        # --- Ignorar según .gitignore ---
        if esta_ignorado(path):
            continue

        connector = "├── " if i < len(files) - 1 else "└── "
        lines.append(prefix + connector + file)

        # --- Si es carpeta, explorar o marcar contenido oculto ---
        if os.path.isdir(path):
            if nivel < PROFUNDIDAD_MAX:
                extension = "│   " if i < len(files) - 1 else "    "
                lines.extend(build_tree(path, prefix + extension, nivel + 1))
            else:
                extension = "│   " if i < len(files) - 1 else "    "
                try:
                    sub_items = os.listdir(path)
                    if sub_items:
                        lines.append(prefix + extension + "└── ... (oculto)")
                except PermissionError:
                    pass

    return lines


# ==============================
# 🧾 Ejecución principal
# ==============================
if __name__ == "__main__":
    tree_lines = build_tree(".")
    with open("estructura.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(tree_lines))

    print(
        f"✅ Árbol generado en 'estructura.txt' con profundidad máxima de {PROFUNDIDAD_MAX} niveles.\n"
        f"📦 node_modules {'visible' if MOSTRAR_NODE_MODULES else 'oculta'}.\n"
        f"🚫 Se aplicaron {len(IGNORAR_PATRONES)} patrones de exclusión.\n"
        f"🗂️ Carpetas parcialmente ocultas: {', '.join(sorted(CARPETAS_OCULTAS_PARCIALMENTE))}"
    )
