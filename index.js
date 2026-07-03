export default {

  async fetch(request, env) {

    // =========================
    // CORS
    // =========================

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    const url = new URL(request.url);

    // =========================
    // HOME
    // =========================

    if (url.pathname === "/") {

      return Response.json({
        success: true,
        message: "Daily Delish API is running 🚀"
      }, {
        headers
      });

    }

    // =========================
    // REGISTER
    // =========================

    if (url.pathname === "/register" && request.method === "POST") {

      const body = await request.json();

      const { name, email, password } = body;

      if (!name || !email || !password) {

        return Response.json({
          success: false,
          message: "Semua field wajib diisi."
        }, { headers });

      }

      const exist = await env.DB
        .prepare("SELECT * FROM users WHERE email=?")
        .bind(email)
        .first();

      if (exist) {

        return Response.json({
          success: false,
          message: "Email sudah terdaftar."
        }, { headers });

      }

      await env.DB
        .prepare("INSERT INTO users(name,email,password) VALUES(?,?,?)")
        .bind(name, email, password)
        .run();

      return Response.json({
        success: true,
        message: "Register berhasil."
      }, { headers });

    }

    // =========================
    // LOGIN
    // =========================

    if (url.pathname === "/login" && request.method === "POST") {

      const body = await request.json();

      const { email, password } = body;

      const user = await env.DB
        .prepare("SELECT * FROM users WHERE email=? AND password=?")
        .bind(email, password)
        .first();

      if (!user) {

        return Response.json({
          success: false,
          message: "Email atau password salah."
        }, { headers });

      }

      return Response.json({
        success: true,
        user
      }, { headers });

    }

    // =========================
    // NOT FOUND
    // =========================

    return Response.json({
      success: false,
      message: "Endpoint tidak ditemukan."
    }, {
      status: 404,
      headers
    });

  }

}
