export default {
  async fetch(request, env) {

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    // CORS
    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    const url = new URL(request.url);

    // Home API
    if (url.pathname === "/" && request.method === "GET") {
      return Response.json(
        {
          success: true,
          message: "Daily Delish API Running 🚀"
        },
        { headers }
      );
    }

    return Response.json(
      {
        success: false,
        message: "Endpoint not found"
      },
      {
        status: 404,
        headers
      }
    );

  }
};
