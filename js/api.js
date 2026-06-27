window.API = {

    async load(){

        const r = await fetch("/api/load");

        return await r.json();

    },

    async save(data){

        const r = await fetch("/api/save",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify(data)

        });

        return await r.json();

    }

};