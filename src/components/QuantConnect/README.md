# 🚀 QuantConnect Frontend Components

Esta carpeta contiene todos los componentes necesarios para integrar QuantConnect con el frontend de TradingLab.

## 📁 Estructura de Archivos

```
src/components/QuantConnect/
├── QuantConnectManager.jsx      # Componente principal de gestión
├── QuantConnectStatusBar.jsx    # Barra de estado con progreso
├── SimpleQuantConnect.jsx       # Componente simple de ejemplo
└── README.md                    # Esta documentación

src/services/
└── QuantConnectService.js       # Servicio de API actualizado

src/hooks/
└── useQuantConnect.js           # Hook personalizado

src/config/
└── quantconnect.js              # Configuración específica

src/styles/
└── QuantConnect.css             # Estilos personalizados
```

## 🎯 Componentes Principales

### 1. QuantConnectManager
Componente principal que incluye:
- Formulario para crear estrategias
- Editor de código Python
- Ejecución de backtests
- Visualización de resultados

**Uso:**
```jsx
import QuantConnectManager from './components/QuantConnectManager';

function App() {
  return <QuantConnectManager />;
}
```

### 2. QuantConnectStatusBar
Barra de progreso en tiempo real que muestra:
- Estado actual del proceso
- Progreso visual
- Logs del sistema
- Manejo de errores

**Uso:**
```jsx
import QuantConnectStatusBar from './components/QuantConnectStatusBar';

<QuantConnectStatusBar
  projectId={projectId}
  compileId={compileId}
  backtestId={backtestId}
  onStatusChange={handleStatusChange}
  onComplete={handleComplete}
/>
```

### 3. SimpleQuantConnect
Componente simplificado para casos básicos:
- Formulario simple
- Ejecución directa de backtests
- Resultados básicos

**Uso:**
```jsx
import SimpleQuantConnect from './components/SimpleQuantConnect';

function App() {
  return <SimpleQuantConnect />;
}
```

## 🔧 Hook Personalizado

### useQuantConnect
Hook que encapsula la lógica de QuantConnect:

```jsx
import { useQuantConnect } from '../hooks/useQuantConnect';

function MyComponent() {
  const { 
    isLoading, 
    error, 
    results, 
    status, 
    runBacktest, 
    reset 
  } = useQuantConnect();

  const handleRun = () => {
    runBacktest({
      name: 'Mi Estrategia',
      code: 'from AlgorithmImports import *...'
    });
  };

  return (
    <div>
      <button onClick={handleRun} disabled={isLoading}>
        {isLoading ? 'Ejecutando...' : 'Ejecutar Backtest'}
      </button>
      {error && <div>Error: {error}</div>}
      {results && <div>Resultados: {JSON.stringify(results)}</div>}
    </div>
  );
}
```

## 🎨 Estilos

Los componentes incluyen estilos personalizados en `QuantConnect.css`:
- Diseño moderno y responsive
- Animaciones suaves
- Colores consistentes con el tema
- Estados visuales claros

## 🔌 Configuración

### Variables de Entorno
```javascript
// .env
VITE_API_URL=http://localhost:8000/api
VITE_QUANTCONNECT_ENABLED=true
```

### Configuración de API
```javascript
// src/config/quantconnect.js
export const QUANTCONNECT_CONFIG = {
  API_BASE_URL: 'http://localhost:8000/api',
  ENDPOINTS: {
    COMPLETE_FLOW: '/quantconnect/complete-flow/',
    DIRECT: '/quantconnect/direct/',
    MONITOR: '/quantconnect/monitor/',
    HEALTH: '/quantconnect/health/'
  }
};
```

## 📊 Flujo de Trabajo

1. **Crear Estrategia**: El usuario define nombre y código Python
2. **Enviar al Backend**: Se envía la estrategia al endpoint `/complete-flow/`
3. **Monitoreo**: El StatusBar monitorea el progreso en tiempo real
4. **Resultados**: Se muestran las métricas del backtest

## 🚨 Estados del Sistema

- `idle`: Listo para ejecutar
- `creating_project`: Creando proyecto en QuantConnect
- `creating_file`: Creando archivo de estrategia
- `compiling`: Compilando código
- `compilation_waiting`: Esperando compilación
- `running_backtest`: Iniciando backtest
- `backtest_waiting`: Ejecutando backtest
- `completed`: Proceso completado
- `error`: Error en el proceso

## 🔄 Monitoreo en Tiempo Real

El sistema incluye monitoreo automático:
- **Compilación**: Cada 2 segundos
- **Backtest**: Cada 5 segundos
- **Timeout**: 10 minutos máximo

## 📱 Responsive Design

Todos los componentes son completamente responsive:
- Mobile-first approach
- Grid adaptativo
- Botones táctiles
- Texto legible en pantallas pequeñas

## 🎯 Ejemplos de Uso

### Ejemplo Básico
```jsx
import React from 'react';
import QuantConnectManager from './components/QuantConnectManager';

function App() {
  return (
    <div className="App">
      <QuantConnectManager />
    </div>
  );
}
```

### Ejemplo con Hook
```jsx
import React, { useState } from 'react';
import { useQuantConnect } from './hooks/useQuantConnect';

function CustomBacktest() {
  const { runBacktest, isLoading, results } = useQuantConnect();
  const [strategy, setStrategy] = useState({ name: '', code: '' });

  const handleSubmit = () => {
    runBacktest(strategy);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={strategy.name}
        onChange={(e) => setStrategy({...strategy, name: e.target.value})}
        placeholder="Nombre de estrategia"
      />
      <textarea 
        value={strategy.code}
        onChange={(e) => setStrategy({...strategy, code: e.target.value})}
        placeholder="Código Python"
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Ejecutando...' : 'Ejecutar'}
      </button>
    </form>
  );
}
```

## 🛠️ Desarrollo

### Agregar Nuevos Estados
```javascript
// En QuantConnectStatusBar.jsx
const STEPS = {
  // ... estados existentes
  NEW_STATE: 'new_state'
};

const stepLabels = {
  // ... etiquetas existentes
  [STEPS.NEW_STATE]: 'Nuevo Estado'
};
```

### Personalizar Estilos
```css
/* En QuantConnect.css */
.custom-status-bar {
  background: linear-gradient(135deg, #your-color-1, #your-color-2);
  /* ... más estilos */
}
```

## 🐛 Troubleshooting

### Problemas Comunes

1. **Error de autenticación**
   - Verificar que el token esté en localStorage
   - Comprobar que el backend esté corriendo

2. **Timeout en backtests**
   - Aumentar el tiempo máximo en la configuración
   - Verificar la complejidad del código

3. **Problemas de monitoreo**
   - Verificar que los IDs del proyecto sean correctos
   - Comprobar la conectividad con el backend

### Logs de Debug
```javascript
// Habilitar logs detallados
localStorage.setItem('debug', 'quantconnect:*');
```

## 📚 Recursos Adicionales

- [Documentación de QuantConnect](https://www.quantconnect.com/docs/)
- [API Reference](https://www.quantconnect.com/docs/v2/cloud-platform/api-reference/)
- [Ejemplos de Algoritmos](https://github.com/QuantConnect/Lean/tree/master/Algorithm.CSharp)

---

**¡Listo para usar!** 🎉 Los componentes están completamente integrados y listos para ejecutar backtests con QuantConnect.
