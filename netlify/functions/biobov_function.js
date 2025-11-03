// BIOBOV_pub/netlify/functions/biobov_function.js

exports.handler = async function(event, context) {
  try {
    // Solo permitimos GET para tu HTML
    if (event.httpMethod !== "GET") {
      return { statusCode: 405, body: "Método no permitido" };
    }

    // Leer parámetro accion
    const accion = event.queryStringParameters?.accion;
    if (!accion || !["subir", "borrar"].includes(accion)) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: "Parámetro 'accion' inválido. Use 'subir' o 'borrar'." }) 
      };
    }

    // Mapear a tus workflows de GitHub Actions
    const workflow = accion === "subir" ? "subir_expl.yml" : "borrar_expl.yml";

    // Token secreto de Netlify (variable de entorno GITHUB_TOKEN)
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      return { statusCode: 500, body: "No se encontró token de GitHub en Netlify" };
    }

    // Repo privado donde están tus workflows
    const repo = "biobovttec-cmyk/BIOBOV_priv";
    const url = `https://api.github.com/repos/${repo}/actions/workflows/${workflow}/dispatches`;

    // Payload para disparar workflow
    const bodyPayload = { ref: "main" };

    // Ejecutar POST a GitHub
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${githubToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bodyPayload)
    });

    if (!res.ok) {
      const text = await res.text();
      return {
        statusCode: res.status,
        body: "Error disparando workflow: " + text
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Workflow '${workflow}' ejecutado correctamente.` })
    };

  } catch (err) {
    console.error("Error detallado:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error al activar workflow: " + (err.message || JSON.stringify(err)) })
    };
  }
};
