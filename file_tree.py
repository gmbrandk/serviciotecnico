import os

# Ignorar extensiones específicas (opcional)
IGNORAR_EXTENSIONES = {".pyc", ".log", ".tmp"}

# Nivel máximo de profundidad (1 = raíz, 2 = subcarpetas, 3 = sub-subcarpetas)
PROFUNDIDAD_MAX = 2



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

        # Ignorar archivos con extensiones específicas
        if os.path.isfile(path) and os.path.splitext(file)[1] in IGNORAR_EXTENSIONES:
            continue

        connector = "├── " if i < len(files) - 1 else "└── "
        lines.append(prefix + connector + file)

        if os.path.isdir(path):
            if nivel < PROFUNDIDAD_MAX:
                extension = "│   " if i < len(files) - 1 else "    "
                lines.extend(build_tree(path, prefix + extension, nivel + 1))
            else:
                # Indicar que hay más contenido oculto en niveles más profundos
                extension = "│   " if i < len(files) - 1 else "    "
                sub_items = os.listdir(path)
                if sub_items:  # Solo mostrar si hay algo
                    lines.append(prefix + extension + "└── ... (oculto)")
    return lines


if __name__ == "__main__":
    tree_lines = build_tree(".")
    with open("estructura.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(tree_lines))

    print(
        f"✅ Árbol generado en 'estructura.txt' (UTF-8) con profundidad máxima de {PROFUNDIDAD_MAX} niveles."
    )
