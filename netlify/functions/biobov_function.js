
exports.handler = async function(event, context) {
  try {
    if (event.httpMethod !== "GET") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Método no permitido" })
      };
    }

    const accion = event.queryStringParameters?.accion;
    const workflows = {
      subir: "subir_expl.yml",
      borrar: "borrar_expl.yml",
      exportar_memorias: "Exportar_memorias.yml",
      borrar_afecciones: "borrar_afecciones.yml"
    };

    if (!accion || !workflows[accion]) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Parámetro 'accion' inválido."
        })
      };
    }

    const workflow = workflows[accion];
    const githubToken = process.env.PRIV_TOKEN;

    if (!githubToken) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "No se encontró token de GitHub en Netlify"
        })
      };
    }

    const repo = "biobovttec-cmyk/BIOBOV_priv";
    const url = `https://api.github.com/repos/${repo}/actions/workflows/${workflow}/dispatches`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${githubToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ref: "main" })
    });

    if (!res.ok) {
      const errorText = await res.text();
      return {
        statusCode: res.status,
        body: JSON.stringify({
          error: "Error al solicitar la ejecución del workflow: " + errorText
        })
      };
    }

    const mensajes = {
      subir: "La subida se ha solicitado correctamente.",
      borrar: "El borrado se ha solicitado correctamente.",
      exportar_memorias: "La exportación de memorias se ha solicitado correctamente. El Excel se generará en segundo plano.",
      borrar_afecciones: "El proceso de eliminación de afecciones se ha solicitado correctamente."
    };

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: mensajes[accion],
        workflow: workflow
      })
    };

  } catch (err) {
    console.error("Error detallado:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error al activar workflow: " + (err.message || JSON.stringify(err))
      })
    };
  }
};

