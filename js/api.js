window.API = {

    async load(){

        const r = await fetch("/api/load");
        return await r.json();

    },

    async save(data){

        await fetch("/api/save",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify(data)

        });

    },

    async sync(){

        await this.save({

            missiles:_edDB,

            seekers:_skDB,

            aircraft:aircraftDB

        });

    }

};