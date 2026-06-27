export async function onRequestPost(context) {
  return Response.json({
    dbExiste: !!context.env.DB,
    keys: Object.keys(context.env)
  });
}
