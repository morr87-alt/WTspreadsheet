export async function onRequestGet(context) {
  const db = context.env.DB;

  const url = new URL(context.request.url);
  const chave = url.searchParams.get("chave");

  const data = await db.prepare(
    "SELECT valor FROM conteudo WHERE chave = ?"
  ).bind(chave).first();

  return Response.json(data || {});
}
