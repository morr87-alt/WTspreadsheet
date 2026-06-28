export async function onRequestGet(context) {
    try {

        const result = await context.env.DB
            .prepare("SELECT data FROM site_data WHERE id = 1")
            .first();

        if (!result) {
            return Response.json({});
        }

        return new Response(result.data, {
            headers: {
                "Content-Type": "application/json"
            }
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
