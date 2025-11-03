exports.handler = async function(event, context) {
  try {
    if (event.httpMethod !== "GET") {
      return { 
        statusCode: 405, 
        body: JSON.stringify({ error: "Método no permitido" }) 
      };
    }

    const accion = event.queryStringParameters?.accion;
    if (!accion || !["subir", "borrar"].includes(accion)) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: "Parámetro 'accion' inválido. Use 'subir' o 'borrar'." }) 
      };
    }

    const workflow = accion === "subir" ? "subir_expl.yml" : "borrar_expl.yml";

    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: "No se encontró token de GitHub en Netlify" }) 
      };
    }

    const repo = "biobovttec-cmyk/BIOBOV_priv";
    const url = `https://api.github.com/repos/${repo}/actions/workflows/${workflow}/dispatches`;

    const bodyPayload = { ref: "main" };

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
        body: JSON.stringify({ error: "Error disparando workflow: " + text })
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
