export async function onRequestPost(context) {
  try {
    const data = await context.request.json();

    await context.env.DB.prepare(
      "UPDATE site_data SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1"
    )
      .bind(JSON.stringify(data))
      .run();

    return Response.json({
      success: true
    });

  } catch (err) {
    return Response.json({
      success: false,
      error: err.message
    }, {
      status: 500
    });
  }
}
