import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.ENV.SUPABASE_URL,
  window.ENV.SUPABASE_ANON_KEY
);


// ===================================
// FUNCIÓN PARA OCULTAR EL PRELOADER
// ===================================
function hideLoader() {
  const loader = document.getElementById('loader');
  if (loader) {
    // Aplicar fade out
    loader.style.opacity = '0';
    
    // Después de la transición, ocultar completamente
    setTimeout(() => {
      loader.style.display = 'none';
    }, 500); // 500ms = duración de la transición CSS
  }
}

// ===================================
// FUNCIÓN PARA MOSTRAR EL PRELOADER
// ===================================
function showLoader() {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.style.display = 'flex';
    loader.style.opacity = '1';
  }
}

// Función para cargar el certificado
async function loadCertificate() {

    showLoader();
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  // Validar que existe el código
  if (!code) {
    hideLoader();
    document.body.innerHTML = "<h2>Código de certificado no proporcionado</h2>";
    return;
  }

  try {
    // Consultar el certificado
    const { data, error } = await supabase
      .from("certificados")
      .select("*")
      .eq("codigo", code)
      .single();

    if (error) {
      console.error("Error al consultar Supabase:", error);
      hideLoader();
      document.body.innerHTML = "<h2>Error al cargar el certificado</h2>";
      return;
    }

    if (!data) {
        hideLoader();
      document.body.innerHTML = "<h2>Certificado no encontrado</h2>";
      return;
    }

    // Actualizar contenido del certificado
    document.getElementById("empresa").innerText = data.empresa || "";
    document.getElementById("nombre").innerText = data.nombre_completo || "";
    document.getElementById("documento").innerText = 
      "Identificado con cédula de ciudadanía N° " + (data.documento || "");
    document.getElementById("curso").innerText = data.curso || "";
    document.getElementById("fecha").innerText = "Dado en Yopal, Diciembre 17 de 2025";
    document.getElementById("horas").innerText = "Duración: " + (data.horas || "0") + " horas";
    
    // Si existe elemento firma (aunque no está en el HTML actual)
    const firmaElement = document.getElementById("firma");
    if (firmaElement) {
      firmaElement.innerText = data.firma_nombre || "";
    }

    // MANEJO ESPECIAL DE LA IMAGEN
    const imgElement = document.getElementById("imgFoto");
    
    if (imgElement && data.foto_url) {
      console.log("URL original de la foto:", data.foto_url);
      
      // Normalizar la ruta de la imagen
      let imagePath = data.foto_url;
      
      // Si la ruta no empieza con / o http, agregarle /
      if (!imagePath.startsWith('/') && !imagePath.startsWith('http')) {
        imagePath = '/' + imagePath;
      }
      
    
      
      console.log("Ruta procesada de la foto:", imagePath);
      
      // Configurar la imagen con manejo de errores
      imgElement.onerror = function() {
        console.error("Error al cargar la imagen desde:", imagePath);
        console.error("URL completa intentada:", this.src);
        
        // Mostrar imagen placeholder si falla
        this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='150'%3E%3Crect width='120' height='150' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial' font-size='14'%3ESin foto%3C/text%3E%3C/svg%3E";
        this.alt = "Foto no disponible";
        hideLoader();
      };
      
      imgElement.onload = function() {
        console.log("✅ Imagen cargada exitosamente:", imagePath);
      };
      
      // Asignar la URL de la foto
      imgElement.src = imagePath;
      imgElement.alt = "Foto de " + (data.nombre_completo || "certificado");
      hideLoader();
    } else {
      console.warn("No se encontró la imagen o la URL está vacía");
      
      // Si no hay foto, mostrar placeholder
      if (imgElement) {
        imgElement.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='150'%3E%3Crect width='120' height='150' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial' font-size='14'%3ESin foto%3C/text%3E%3C/svg%3E";
        imgElement.alt = "Sin foto";
        hideLoader();
      }
    }

  } catch (err) {
    console.error("Error general:", err);
    hideLoader();
    document.body.innerHTML = "<h2>Error al procesar el certificado</h2>";
  }
}

// Ejecutar la función cuando el DOM esté listo
loadCertificate()