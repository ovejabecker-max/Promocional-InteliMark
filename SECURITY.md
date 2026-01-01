# 🔐 GUÍA DE SEGURIDAD - GESTIÓN DE CREDENCIALES

## ✅ Estado de Seguridad Actual

### Configuración Correcta
- ✅ Variables de entorno usando `import.meta.env.VITE_*`
- ✅ No hay API keys hardcodeadas en el código
- ✅ `.env` agregado a `.gitignore`
- ✅ Usuario de Git configurado localmente

### Protecciones Implementadas
1. **Variables de Entorno**: Todas las credenciales se cargan desde `.env.local`
2. **.gitignore mejorado**: Protege archivos sensibles como:
   - `.env` y variantes (`.env.local`, `.env.*.local`)
   - `.key`, `.pem`, `.p12`, `.pfx` (certificados SSL)
   - `credentials.json`, `secrets.json`
   - Archivos de configuración local

---

## 📋 PASOS PARA CONFIGURAR VARIABLES DE ENTORNO

### 1. Crear archivo `.env.local` (NO será versionado)
```bash
cp .env.example .env.local
```

### 2. Editar `.env.local` con credenciales reales
```
VITE_VAPI_PUBLIC_KEY=tu_clave_publica_aqui
VITE_VAPI_ASSISTANT_ID=tu_assistant_id_aqui
```

### 3. Verificar que `.env.local` está en `.gitignore`
```bash
git check-ignore .env.local  # Debe retornar: .env.local
```

---

## 🔍 VERIFICAR ARCHIVOS COMPROMETIDOS

Si accidentalmente se agregó un archivo sensible, usar:

```bash
# Ver historial de archivos sensibles
git log --all --full-history -- .env
git log --all --full-history -- "*.key"

# Eliminar archivo del historio (DESTRUCTIVO)
git filter-branch --tree-filter 'rm -f .env' --prune-empty

# O usar BFG Repo-Cleaner (recomendado)
bfg --delete-files .env --no-blob-protection
```

---

## 🛡️ RECOMENDACIONES ADICIONALES

### 1. **Branch Protection Rules (GitHub)**
Configurar en: `Settings > Branches > Add rule`

**Para rama `main`:**
- ✅ Require pull request reviews before merging (mínimo 1)
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Restrict who can push to matching branches

### 2. **GitHub Secrets (para CI/CD)**
Almacenar en: `Settings > Secrets and variables > Actions`

Ejemplo:
```
VITE_VAPI_PUBLIC_KEY = [valor_secreto]
VITE_VAPI_ASSISTANT_ID = [valor_secreto]
```

### 3. **Monitoreo de Secretos**
- GitHub detecta automáticamente patrones comunes (API keys, tokens)
- Usar: `Settings > Security > Secret scanning`
- Alertas se envían si se detectan secretos en el repo

---

## 📝 CHECKLIST DE SEGURIDAD

- [x] Usuario de Git configurado localmente
- [x] `.gitignore` actualizado con patrones de credenciales
- [x] `.env.example` creado como referencia
- [x] No hay archivos `.env.local` o `.env` en el repositorio
- [ ] Configurar Branch Protection Rules en GitHub
- [ ] Verificar Secret Scanning esté habilitado en GitHub
- [ ] Revisar historio de git para archivos sensibles accidentales
- [ ] Capacitar al equipo en mejores prácticas de seguridad

---

## 🚨 EN CASO DE EMERGENCIA

Si un secreto fue expuesto:

1. **Invalidar la credencial inmediatamente** en Vapi Dashboard
2. **Generar una nueva** API key/Assistant ID
3. **Limpiar el historio de git** (ver sección "VERIFICAR ARCHIVOS")
4. **Notificar al equipo** y cambiar contraseñas si es necesario

---

## 📚 REFERENCIAS

- [GitHub Secret Scanning](https://docs.github.com/es/code-security/secret-scanning)
- [Vapi Security Best Practices](https://docs.vapi.ai/security)
- [OWASP - Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
