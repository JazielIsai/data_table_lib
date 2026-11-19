# Ejemplos ejecutables

Desde la raíz del repositorio:

```bash
npm install
npm run examples
```

Abre [http://localhost:5173/examples/](http://localhost:5173/examples/). El script compila la librería antes de iniciar Vite; los ejemplos importan `@isai_dev/data_table_lib` y `@isai_dev/data_table_lib/style.css` mediante las entradas públicas del paquete.

| Archivo | Muestra |
| --- | --- |
| [BasicExample.jsx](./BasicExample.jsx) | Búsqueda, filtro, ordenamiento, selección, paginación y acciones con datos locales. |
| [EditableExample.jsx](./EditableExample.jsx) | Borradores por fila, validación, guardar y cancelar. |
| [RemoteExample.jsx](./RemoteExample.jsx) | Estado controlado y operaciones delegadas a una consulta simulada. |
| [PhotoExample.jsx](./PhotoExample.jsx) | Fotos en cuatro vistas, visor ampliado, columnas personalizables e iconos accesibles. |

La consulta de `RemoteExample.jsx` usa datos locales y una breve espera para que puedas ejecutarla sin servidor. En una aplicación real, reemplaza `loadPeople` por una petición a tu API que devuelva `{ rows, total }`; conserva `manualSorting`, `manualFiltering`, `manualPagination` y los callbacks de estado. El [README principal](../README.md#datos-del-servidor) incluye un ejemplo con `fetch` y cancelación de peticiones.

Los tres componentes son independientes. Puedes copiar uno a tu aplicación, instalar el paquete y ajustar los datos, columnas y callbacks.
