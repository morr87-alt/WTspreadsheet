window.CloudStorage = {

    async load(){

        const data = await API.load();

        window._edDB       = data.missiles   || {};
        window._skDB       = data.seekers    || {};
        window.aircraftDB  = data.aircraft   || {};
        window._customTabs = data.customTabs || [];

        return data;
    },

    async save(){

        return await API.save({

            missiles: window._edDB,

            seekers: window._skDB,

            aircraft: window.aircraftDB,

            customTabs: window._customTabs

        });

    }

};