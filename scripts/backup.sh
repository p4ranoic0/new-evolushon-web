#!/usr/bin/env bash
set -euo pipefail
umask 077
# Ejecutar en el Mac. Credenciales por entorno o archivo de opciones externo al repo.
: "${BACKUP_DB_HOST:?Configura BACKUP_DB_HOST}"
: "${BACKUP_DB_NAME:?Configura BACKUP_DB_NAME}"
: "${BACKUP_DB_USER:?Configura BACKUP_DB_USER}"
: "${BACKUP_DB_PASSWORD:?Configura BACKUP_DB_PASSWORD}"
: "${BACKUP_SSH_HOST:?Configura usuario@host SSH/SFTP}"
: "${BACKUP_UPLOADS_DIR:?Configura la ruta absoluta remota de uploads}"
[[ "$BACKUP_DB_NAME" =~ ^[a-zA-Z0-9_]+$ ]] || { echo 'Nombre de base inválido' >&2; exit 1; }
[[ "$BACKUP_SSH_HOST" =~ ^[a-zA-Z0-9_.@-]+$ ]] || { echo 'Host SSH inválido' >&2; exit 1; }
[[ "$BACKUP_UPLOADS_DIR" =~ ^/[a-zA-Z0-9_./-]+$ ]] || { echo 'Ruta de uploads inválida' >&2; exit 1; }
[[ "$BACKUP_UPLOADS_DIR" != '/' && "$BACKUP_UPLOADS_DIR" != *'/../'* ]] || exit 1
backup_root="${BACKUP_ROOT:-$HOME/Library/CloudStorage/OneDrive-Personal/TRABAJOS/evolushon/backups}"
mkdir -p "$backup_root"
backup_day="$(date +%F)"
[[ ! -e "$backup_root/$backup_day" ]] || backup_day="$(date +%F-%H%M%S)"
backup_stage="$(mktemp -d "$backup_root/.partial.XXXXXX")"
backup_config="$(mktemp)"
trap 'rm -f "$backup_config"' EXIT
export EVO_BACKUP_CONFIG="$backup_config"
python3 - <<'PY'
import os
from pathlib import Path
def quote(value):
    return '"'+value.replace('\\','\\\\').replace('"','\\"').replace('\n','\\n').replace('\r','\\r')+'"'
values={'host':os.environ['BACKUP_DB_HOST'],'user':os.environ['BACKUP_DB_USER'],'password':os.environ['BACKUP_DB_PASSWORD'],'port':os.environ.get('BACKUP_DB_PORT','3306'),'ssl-mode':os.environ.get('BACKUP_SSL_MODE','REQUIRED')}
Path(os.environ['EVO_BACKUP_CONFIG']).write_text('[client]\n'+''.join(k+'='+quote(v)+'\n' for k,v in values.items()))
PY
{
  mysqldump --defaults-extra-file="$backup_config" --single-transaction --no-tablespaces --column-statistics=0 --set-gtid-purged=OFF --ignore-table="$BACKUP_DB_NAME.google_reviews_cache" "$BACKUP_DB_NAME"
  mysqldump --defaults-extra-file="$backup_config" --no-data --no-tablespaces --column-statistics=0 --set-gtid-purged=OFF "$BACKUP_DB_NAME" google_reviews_cache
} | gzip > "$backup_stage/dump.sql.gz"
rsync -a -e "ssh -p ${BACKUP_SSH_PORT:-22}" -- "$BACKUP_SSH_HOST:$BACKUP_UPLOADS_DIR/" "$backup_stage/uploads/"
(cd "$backup_stage" && shasum -a 256 dump.sql.gz > SHA256SUMS)
printf 'evolushon backup v1\n' > "$backup_stage/.evolushon-backup"
mv "$backup_stage" "$backup_root/$backup_day"
export EVO_BACKUP_ROOT="$backup_root"
python3 - <<'PY'
import os,re,shutil
from pathlib import Path
root=Path(os.environ['EVO_BACKUP_ROOT']).resolve()
copies=sorted((p for p in root.iterdir() if p.is_dir() and not p.is_symlink() and re.fullmatch(r'\d{4}-\d{2}-\d{2}(?:-\d{6})?',p.name) and (p/'.evolushon-backup').is_file()),key=lambda p:p.name,reverse=True)
for old in copies[8:]:
    # Solo copias creadas por este script; no elimina otros documentos del cliente.
    shutil.rmtree(old)
PY
printf 'Respaldo completo: %s\n' "$backup_root/$backup_day"
