"""Check repository conventions for changed frontend files."""

from __future__ import annotations

import argparse
import json
import re
import sys
import tempfile
from pathlib import Path


APP_ROOTS = {"uis/website", "uis/backoffice"}
SOURCE_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"}
ALLOWED_JS_CONFIGS = {
    "eslint.config.js",
    "next.config.js",
    "postcss.config.js",
    "tailwind.config.js",
}
INLINE_STYLE = re.compile(r"\bstyle\s*=\s*(?:\{|['\"])", re.IGNORECASE)
STYLE_ELEMENT = re.compile(r"<\s*style\b", re.IGNORECASE)


def check_frontend(root: Path, app: str, files: list[str]) -> list[str]:
    errors: list[str] = []
    repo_root = root.resolve()
    app_path = (repo_root / app).resolve()

    if app not in APP_ROOTS:
        return [f"La app debe estar en una de estas rutas: {', '.join(sorted(APP_ROOTS))}."]
    if not app_path.is_dir():
        errors.append(f"No existe el directorio de la app: {app}.")

    if not (app_path / "README.md").is_file():
        errors.append(f"Falta README.md en {app}.")

    package_file = app_path / "package.json"
    if not package_file.is_file():
        errors.append(f"Falta package.json en {app}.")
    else:
        try:
            package_data = json.loads(package_file.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            errors.append(f"No se pudo leer {app}/package.json: {error}.")
        else:
            scripts = package_data.get("scripts", {})
            for required_script in ("lint", "build"):
                if not scripts.get(required_script):
                    errors.append(f"Falta el script npm `{required_script}` en {app}/package.json.")
            dependencies = {
                **package_data.get("dependencies", {}),
                **package_data.get("devDependencies", {}),
            }
            if "tailwindcss" not in dependencies:
                errors.append(f"Falta la dependencia `tailwindcss` en {app}/package.json.")

    if not files:
        errors.append("Debes indicar los archivos frontend modificados con --files.")

    for file_name in files:
        file_path = (repo_root / file_name).resolve()
        try:
            relative_path = file_path.relative_to(repo_root)
        except ValueError:
            errors.append(f"El archivo está fuera del repositorio: {file_name}.")
            continue

        try:
            file_path.relative_to(app_path)
        except ValueError:
            errors.append(f"El archivo no pertenece a la app seleccionada ({app}): {file_name}.")
            continue

        if not file_path.is_file():
            errors.append(f"No existe el archivo indicado: {file_name}.")
            continue

        if file_path.suffix.lower() not in SOURCE_EXTENSIONS:
            continue

        if file_path.suffix.lower() in {".js", ".jsx", ".mjs", ".cjs"} and file_path.name not in ALLOWED_JS_CONFIGS:
            errors.append(f"El código frontend debe usar TypeScript, no `{relative_path}`.")

        try:
            source = file_path.read_text(encoding="utf-8")
        except OSError as error:
            errors.append(f"No se pudo leer {relative_path}: {error}.")
            continue

        if INLINE_STYLE.search(source) or STYLE_ELEMENT.search(source):
            errors.append(f"No se permiten estilos inline ni elementos <style>: {relative_path}.")
        if file_path.suffix.lower() == ".tsx" and not re.search(r"\bclassName\s*=", source):
            errors.append(f"El componente TSX debe aplicar clases Tailwind mediante className: {relative_path}.")

    return errors


def run_self_test() -> int:
    with tempfile.TemporaryDirectory() as temporary_directory:
        root = Path(temporary_directory)
        app = root / "uis" / "website"
        source_file = app / "app" / "page.tsx"
        source_file.parent.mkdir(parents=True)
        (app / "README.md").write_text("# Test app\n", encoding="utf-8")
        (app / "package.json").write_text(
            json.dumps(
                {
                    "scripts": {"lint": "eslint", "build": "next build"},
                    "devDependencies": {"tailwindcss": "^4"},
                }
            ),
            encoding="utf-8",
        )
        source_file.write_text('<main className="mx-auto">Test</main>\n', encoding="utf-8")

        valid_errors = check_frontend(root, "uis/website", ["uis/website/app/page.tsx"])
        assert not valid_errors, f"El caso válido falló: {valid_errors}"

        misplaced_errors = check_frontend(root, "uis/website", ["uis/backoffice/app/page.tsx"])
        assert any("no pertenece" in error for error in misplaced_errors), misplaced_errors

        package_file = app / "package.json"
        package_file.write_text(
            json.dumps({"scripts": {"lint": "eslint", "build": "next build"}}),
            encoding="utf-8",
        )
        tailwind_errors = check_frontend(root, "uis/website", ["uis/website/app/page.tsx"])
        assert any("tailwindcss" in error for error in tailwind_errors), tailwind_errors
        package_file.write_text(
            json.dumps(
                {
                    "scripts": {"lint": "eslint", "build": "next build"},
                    "devDependencies": {"tailwindcss": "^4"},
                }
            ),
            encoding="utf-8",
        )

        javascript_file = app / "app" / "legacy.js"
        javascript_file.write_text("export const value = 1;\n", encoding="utf-8")
        javascript_errors = check_frontend(root, "uis/website", ["uis/website/app/legacy.js"])
        assert any("debe usar TypeScript" in error for error in javascript_errors), javascript_errors

        source_file.write_text("<main>Test</main>\n", encoding="utf-8")
        missing_classes = check_frontend(root, "uis/website", ["uis/website/app/page.tsx"])
        assert any("className" in error for error in missing_classes), missing_classes

        source_file.write_text('<main style={{ color: "red" }}>Test</main>\n', encoding="utf-8")
        inline_style_errors = check_frontend(root, "uis/website", ["uis/website/app/page.tsx"])
        assert any("estilos inline" in error for error in inline_style_errors), inline_style_errors

    print("Autocontrol aprobado: caso válido y 5 violaciones rechazadas.")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path("."), help="Raíz del repositorio.")
    parser.add_argument("--app", choices=sorted(APP_ROOTS), help="Ruta de la app frontend objetivo.")
    parser.add_argument("--files", nargs="*", default=[], help="Archivos frontend modificados, relativos al repo.")
    parser.add_argument("--self-test", action="store_true", help="Ejecuta casos sintéticos del checker.")
    arguments = parser.parse_args()

    if arguments.self_test:
        return run_self_test()
    if not arguments.app:
        parser.error("--app es obligatorio salvo que uses --self-test.")

    errors = check_frontend(arguments.root, arguments.app, arguments.files)
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1

    print(f"Preflight estático aprobado para {arguments.app} ({len(arguments.files)} archivo(s)).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())