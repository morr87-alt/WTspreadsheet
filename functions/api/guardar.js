export async function onRequestPost(context) {
  const db = context.env.DB;

  const { nome, email } = await context.request.json();

  await db
    .prepare("INSERT INTO utilizadores (nome, email) VALUES (?, ?)")
    .bind(nome, email)
    .run();

  return Response.json({
    sucesso: true
  });
}