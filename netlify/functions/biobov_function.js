const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  const accion = event.queryStringParameters?.accion;

  if (!accion || !["subir", "borrar"].includes(accion)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Parámetro 'accion' inválido. Use 'subir' o 'borrar'." })
    };
  }

  // Mapeo a tus workflows de GitHub Actions
  const workflow = accion === "subir" ? "subir_expl.yml" : "borrar_expl.yml";

  try {
    const githubToken = process.env.GITHUB_TOKEN; // Token con permisos para disparar workflows
    const repo = "USUARIO/REPO"; // Cambia por tu repo privado

    const url = `https://api.github.com/repos/${repo}/actions/workflows/${workflow}/dispatches`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${githubToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ref: "main" // rama donde disparar el workflow
      })
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        statusCode: response.status,
        body: `Error disparando workflow: ${text}`
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Workflow '${workflow}' ejecutado correctamente.` })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
