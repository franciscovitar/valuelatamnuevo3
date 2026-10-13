# Grupo Value Latam — Preview

Esta rama presenta la nueva web HTML estática **sin modificar producción**.

`site_archive/part-*` contiene el ZIP original adaptado para Vercel, dividido en fragmentos binarios debido a los límites del transporte. `build-preview.sh` recompone el ZIP, verifica SHA-256 y extrae los archivos originales en `dist/`.

**Validar el diseño, el video, enlaces, SEO y el envío de los formularios en Preview. No fusionar a `main` sin aprobación expresa.**
