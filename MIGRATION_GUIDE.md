# 🔄 Guía de Migración - QuantConnect Frontend

## 📋 Resumen de Cambios

Se ha actualizado el frontend de TradingLab para integrar completamente con la nueva estructura del backend de QuantConnect, siguiendo la guía proporcionada.

## 🆕 Nuevos Archivos Creados

### Componentes
- `src/components/QuantConnectManager.jsx` - Componente principal de gestión
- `src/components/QuantConnectStatusBar.jsx` - Barra de estado con progreso
- `src/components/SimpleQuantConnect.jsx` - Componente simple de ejemplo
- `src/components/QuantConnect/index.js` - Archivo de exportaciones

### Servicios y Hooks
- `src/hooks/useQuantConnect.js` - Hook personalizado para QuantConnect
- `src/services/QuantConnectService.js` - **ACTUALIZADO** con nuevos métodos

### Configuración
- `src/config/quantconnect.js` - Configuración específica de QuantConnect
- `src/config/api.js` - **ACTUALIZADO** con nuevos endpoints

### Estilos
- `src/styles/QuantConnect.css` - Estilos personalizados
- `tailwind.config.js` - **ACTUALIZADO** con colores y animaciones

### Ejemplos y Documentación
- `src/examples/QuantConnectIntegration.jsx` - Ejemplo de integración completa
- `src/components/QuantConnect/README.md` - Documentación detallada

## 🔧 Cambios en Archivos Existentes

### 1. QuantConnectService.js
**Cambios principales:**
- Actualizado `baseURL` para usar `/api` en lugar de `/api/quantconnect`
- Agregado soporte para token de autenticación
- Nuevos métodos:
  - `runCompleteBacktest()` - Ejecuta backtest completo
  - `executeAction()` - Ejecuta acciones individuales
  - `monitor()` - Monitoreo en tiempo real
  - `checkHealth()` - Verificación de salud del servicio

**Antes:**
```javascript
this.baseURL = 'http://localhost:8000/api/quantconnect';
this.userId = 414810;
this.apiToken = '79b91dd67dbbbfa4129888180d2de06d773de7eb4c8df86761bb7926d0d6d8cf';
```

**Después:**
```javascript
this.baseURL = 'http://localhost:8000/api';
this.token = localStorage.getItem('authToken');
```

### 2. api.js
**Nuevos endpoints agregados:**
```javascript
QUANTCONNECT_COMPLETE_FLOW: `${API_BASE_URL}/api/quantconnect/complete-flow/`,
QUANTCONNECT_DIRECT: `${API_BASE_URL}/api/quantconnect/direct/`,
QUANTCONNECT_MONITOR: `${API_BASE_URL}/api/quantconnect/monitor/`,
```

## 🚀 Nuevas Funcionalidades

### 1. Status Bar en Tiempo Real
- Monitoreo automático de compilación y backtest
- Barra de progreso visual
- Estados claros del proceso
- Manejo de errores integrado

### 2. Hook Personalizado
- Encapsula toda la lógica de QuantConnect
- Fácil de usar en cualquier componente
- Manejo automático de estados

### 3. Componentes Modulares
- `QuantConnectManager` - Interfaz completa
- `SimpleQuantConnect` - Para casos básicos
- `QuantConnectStatusBar` - Reutilizable

### 4. Configuración Centralizada
- Variables de entorno
- Configuración de endpoints
- Configuración de monitoreo

## 📱 Cómo Usar los Nuevos Componentes

### Uso Básico
```jsx
import { QuantConnectManager } from './components/QuantConnect';

function App() {
  return <QuantConnectManager />;
}
```

### Uso con Hook
```jsx
import { useQuantConnect } from './hooks/useQuantConnect';

function MyComponent() {
  const { runBacktest, isLoading, results } = useQuantConnect();
  
  const handleRun = () => {
    runBacktest({
      name: 'Mi Estrategia',
      code: 'from AlgorithmImports import *...'
    });
  };

  return (
    <button onClick={handleRun} disabled={isLoading}>
      {isLoading ? 'Ejecutando...' : 'Ejecutar Backtest'}
    </button>
  );
}
```

### Uso del Status Bar
```jsx
import { QuantConnectStatusBar } from './components/QuantConnect';

<QuantConnectStatusBar
  projectId={projectId}
  compileId={compileId}
  backtestId={backtestId}
  onStatusChange={handleStatusChange}
  onComplete={handleComplete}
/>
```

## 🔄 Migración de Código Existente

### Antes (Código Legacy)
```jsx
// Usando el servicio anterior
const qcService = new QuantConnectService();
const result = await qcService.runCompleteWorkflow(strategy, description);
```

### Después (Nuevo Código)
```jsx
// Usando el hook personalizado
const { runBacktest } = useQuantConnect();
const result = await runBacktest(strategy);
```

## 🎨 Estilos y UI

### Nuevos Estilos
- Diseño moderno con gradientes
- Animaciones suaves
- Estados visuales claros
- Responsive design

### Clases CSS Personalizadas
```css
.quantconnect-container { /* Contenedor principal */ }
.status-bar { /* Barra de estado */ }
.progress-bar { /* Barra de progreso */ }
.btn-quantconnect { /* Botones personalizados */ }
```

## 🔧 Configuración Requerida

### Variables de Entorno
```bash
# .env
VITE_API_URL=http://localhost:8000/api
VITE_QUANTCONNECT_ENABLED=true
```

### Dependencias
```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.0.0",
    "@tailwindcss/forms": "^0.5.0"
  }
}
```

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Error de autenticación**
   ```javascript
   // Verificar que el token esté en localStorage
   console.log('Token:', localStorage.getItem('authToken'));
   ```

2. **Endpoints no encontrados**
   ```javascript
   // Verificar que el backend esté corriendo en el puerto correcto
   console.log('API Base URL:', import.meta.env.VITE_API_URL);
   ```

3. **Problemas de monitoreo**
   ```javascript
   // Verificar que los IDs del proyecto sean correctos
   console.log('Project ID:', projectId);
   console.log('Backtest ID:', backtestId);
   ```

## 📊 Flujo de Trabajo Actualizado

1. **Crear Estrategia** → Usuario define nombre y código
2. **Enviar al Backend** → POST a `/quantconnect/complete-flow/`
3. **Monitoreo Automático** → StatusBar monitorea progreso
4. **Resultados** → Se muestran métricas del backtest

## 🎯 Próximos Pasos

1. **Probar la integración** con el backend actualizado
2. **Ajustar estilos** según las necesidades del diseño
3. **Agregar más validaciones** en los formularios
4. **Implementar caché** para resultados de backtests
5. **Agregar más métricas** en la visualización de resultados

## 📚 Recursos Adicionales

- [Documentación de QuantConnect](https://www.quantconnect.com/docs/)
- [Guía de Componentes](./src/components/QuantConnect/README.md)
- [Ejemplos de Integración](./src/examples/QuantConnectIntegration.jsx)

---

**¡Migración Completada!** 🎉 

El frontend ahora está completamente integrado con la nueva estructura del backend de QuantConnect y listo para usar.
