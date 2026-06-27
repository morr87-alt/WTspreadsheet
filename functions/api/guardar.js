export async function onRequestPost(context) {
  try {
    const db = context.env.DB;

    const body = await context.request.json();

    const nome = body?.nome ?? "";
    const email = body?.email ?? "";

    if (!nome || !email) {
      return Response.json({
        erro: "Faltam dados"
      }, { status: 400 });
    }

    await db.prepare(
      "INSERT INTO utilizadores (nome, email) VALUES (?, ?)"
    ).bind(nome, email).run();

    return Response.json({
      sucesso: true
    });

  } catch (err) {
    return Response.json({
      erro: err.message
    }, { status: 500 });
  }
}
