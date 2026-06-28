window.API = {

    cache: null,

    async load() {

        if (this.cache) {
            return this.cache;
        }

        const r = await fetch("/api/load");

        const data = await r.json();

        this.cache = data;

        return data;

    },

    async save(data) {

        this.cache = data;

        const r = await fetch("/api/save", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)

        });

        return await r.json();

    },

    async sync() {

        const data = {

            missiles: window._edDB || {},

            seekers: window._skDB || {},

            aircraft: window.aircraftDB || {},

            customTabs: window._customTabs || []

        };

        return await this.save(data);

    }

};
