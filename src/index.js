export default {
  async fetch(request, env) {

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
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
          .prepare("SELECT * FROM recipes ORDER BY id DESC")
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

        if (
          !title ||
          !category ||
          !time ||
          !description ||
          !ingredients ||
          !steps
        ) {

          return Response.json({
            success: false,
            message: "Semua field wajib diisi"
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
    // UPDATE RECIPE
    // ===========================
    if (
      url.pathname.startsWith("/recipes/") &&
      request.method === "PUT"
    ) {

      try {

        const id = url.pathname.split("/")[2];

        const {
          title,
          category,
          time,
          image,
          description,
          ingredients,
          steps
        } = await request.json();

        await env.DB
          .prepare(`
            UPDATE recipes
            SET
              title = ?,
              category = ?,
              time = ?,
              image = ?,
              description = ?,
              ingredients = ?,
              steps = ?
            WHERE id = ?
          `)
          .bind(
            title,
            category,
            time,
            image,
            description,
            ingredients,
            steps,
            id
          )
          .run();

        return Response.json({
          success: true,
          message: "Resep berhasil diperbarui"
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
    // DELETE RECIPE
    // ===========================
    if (
      url.pathname.startsWith("/recipes/") &&
      request.method === "DELETE"
    ) {

      try {

        const id = url.pathname.split("/")[2];

        await env.DB
          .prepare("DELETE FROM recipes WHERE id = ?")
          .bind(id)
          .run();

        return Response.json({
          success: true,
          message: "Resep berhasil dihapus"
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
