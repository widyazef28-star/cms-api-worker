export default {
  async fetch(request, env) {

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    // CORS
    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    const url = new URL(request.url);

    // Debug log
    console.log("Method:", request.method);
    console.log("Path:", url.pathname);

    // ===========================
    // HOME
    // ===========================
    if (url.pathname === "/" && request.method === "GET") {

      return Response.json({
        success: true,
        message: "Daily Delish API Running 🚀"
      }, { headers });

    }

    // ===========================
    // REGISTER
    // ===========================
    if (url.pathname === "/register" && request.method === "POST") {

      try {

        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
          return Response.json({
            success: false,
            message: "Semua field wajib diisi"
          }, {
            status: 400,
            headers
          });
        }

        const existingUser = await env.DB
          .prepare("SELECT * FROM users WHERE email = ?")
          .bind(email)
          .first();

        if (existingUser) {
          return Response.json({
            success: false,
            message: "Email sudah digunakan"
          }, {
            status: 409,
            headers
          });
        }

        await env.DB
          .prepare(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)"
          )
          .bind(name, email, password)
          .run();

        return Response.json({
          success: true,
          message: "Register berhasil"
        }, { headers });

      } catch (err) {

        return Response.json({
          success: false,
          message: err.message
        }, {
          status: 500,
          headers
        });

      }

    }

    // ===========================
    // 404
    // ===========================
    return Response.json({
      success: false,
      message: "Endpoint not found"
    }, {
      status: 404,
      headers
    });

  }
};
