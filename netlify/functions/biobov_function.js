const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  // Obtener parámetro de acción: subir o borrar
  const accion = event.queryStringParameters?.accion;

  if (!accion || !["subir", "borrar"].includes(accion)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Parámetro 'accion' inválido" }),
    };
  }

  // Variables para tu repo privado y workflow
  const owner = "TU_USUARIO";
  const repo = "TU_REPO";
  const workflow_subir = "subir_explotacion.yml";
  const workflow_borrar = "borrar_explotacion.yml";
  const github_token = process.env.GITHUB_TOKEN; // token guardado en Netlify env vars

  // Elegir workflow según la acción
  const workflow_file = accion === "subir" ? workflow_subir : workflow_borrar;

  // Llamada al API de GitHub para disparar workflow
  const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow_file}/dispatches`;

  const body = {
    ref: "main", // rama que ejecuta el workflow
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${github_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.status === 204) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: `Workflow '${accion}' disparado correctamente.` }),
      };
    } else {
      const data = await response.json();
      return {
        statusCode: response.status,
        body: JSON.stringify({ message: "Error al disparar workflow", data }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error interno", error }),
    };
  }
};
