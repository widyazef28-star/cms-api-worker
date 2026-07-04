export default {
  async fetch(request, env) {

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    // ===========================
    // CORS
    // ===========================
    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    const url = new URL(request.url);

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
    // TEST
    // ===========================
    if (url.pathname === "/test" && request.method === "GET") {
      return Response.json({
        success: true,
        message: "TEST BERHASIL"
      }, { headers });
    }

    // ===========================
    // REGISTER
    // ===========================
    if (url.pathname === "/register" && request.method === "POST") {

      try {

        const body = await request.json();

        const { name, email, password } = body;

        if (!name || !email || !password) {
          return Response.json({
            success: false,
            message: "Semua field wajib diisi"
          }, {
            status: 400,
            headers
          });
        }

        // Cek email
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

        // Simpan user
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
// LOGIN
// ===========================
if (url.pathname === "/login" && request.method === "POST") {

  try {

    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({
        success: false,
        message: "Email dan password wajib diisi"
      }, {
        status: 400,
        headers
      });
    }

    const user = await env.DB
      .prepare(
        "SELECT id, name, email FROM users WHERE email = ? AND password = ?"
      )
      .bind(email, password)
      .first();

    if (!user) {
      return Response.json({
        success: false,
        message: "Email atau password salah"
      }, {
        status: 401,
        headers
      });
    }

    return Response.json({
      success: true,
      message: "Login berhasil",
      user
    }, {
      headers
    });

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
// GET ALL RECIPES
// ===========================
if (url.pathname === "/recipes" && request.method === "GET") {

  try {

    const { results } = await env.DB
      .prepare("SELECT * FROM recipes ORDER BY created_at DESC")
      .all();

    return Response.json({
      success: true,
      data: results
    }, {
      headers
    });

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
// CREATE RECIPE
// ===========================
if (url.pathname === "/recipes" && request.method === "POST") {

  try {

    const {
      user_id,
      title,
      category,
      time,
      image,
      description,
      ingredients,
      steps
    } = await request.json();

    if (!title || !category) {
      return Response.json({
        success: false,
        message: "Title dan category wajib diisi"
      }, {
        status: 400,
        headers
      });
    }

    await env.DB
      .prepare(`
        INSERT INTO recipes
        (
          user_id,
          title,
          category,
          time,
          image,
          description,
          ingredients,
          steps
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        user_id,
        title,
        category,
        time,
        image,
        description,
        ingredients,
        steps
      )
      .run();

    return Response.json({
      success: true,
      message: "Resep berhasil ditambahkan"
    }, {
      headers
    });

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
