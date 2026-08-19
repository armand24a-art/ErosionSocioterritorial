# Instrucciones para agregar fotografías

## Estructura de carpetas

Coloca todas las imágenes en la carpeta `img/` con nombres descriptivos.

## Formatos y tamaños

- **Formatos:** JPG, PNG, WebP
- **Tamaño recomendado:** 1200x900 px (relación 4:3)
- **Peso máximo:** 500 KB por imagen

## Nombres de archivo

- Usa **guiones** en lugar de espacios
- Sin caracteres especiales ni acentos
- Ejemplos: `campo-bosque-01.jpg`, `erosion-playa.jpg`

## Galería - Imágenes esperadas

| Archivo | Descripción |
|---|---|
| `img/campo-01.jpg` | Trabajo de campo |
| `img/erosion-01.jpg` | Erosión costera |
| `img/comunidad-01.jpg` | Comunidad pesquera |
| `img/taller-01.jpg` | Taller participativo |
| `img/pesca-01.jpg` | Pesca artesanal |
| `img/infraestructura-01.jpg` | Infraestructura petrolera |
| `img/campo-02.jpg` | Entrevistas |
| `img/mapa-01.jpg` | Cartografía social |
| `img/equipo-01.jpg` | Equipo de investigación |

## Tarjetas de comunidades

| Archivo | Comunidad |
|---|---|
| `img/el-bosque.jpg` | El Bosque, Centla |
| `img/sanchez-magallanes.jpg` | Sánchez Magallanes, Cárdenas |
| `img/el-penjamo.jpg` | El Pénjamo, Paraíso |

## Agregar más fotos

Copia este bloque dentro de `<div class="gallery-grid">`:

```html
<div class="gallery-item" data-src="img/FOTO.jpg" data-caption="Descripción">
  <img src="img/FOTO.jpg" alt="Descripción" onerror="this.style.display='none'">
  <div class="gallery-placeholder">
    <span class="placeholder-icon">📷</span>
    <span class="placeholder-text">Título<br><small>img/FOTO.jpg</small></span>
  </div>
  <div class="gallery-overlay">
    <h4>Título</h4>
    <p>Descripción</p>
  </div>
</div>
```
