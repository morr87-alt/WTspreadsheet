export async function onRequestGet(context) {
  try {
    const { results } = await context.env.DB.prepare(
      "SELECT data FROM site_data WHERE id = 1"
    ).all();

    if (!results.length) {
      return Response.json({});
    }

    return Response.json(JSON.parse(results[0].data));
  } catch (err) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
