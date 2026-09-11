const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: "AIzaSyC8rlnIDNzakejAKPUwwbCiXA-vFuVISbc"
});

async function checkModels() {
    const models = await ai.models.list();

    for await (const model of models) {
        console.log(model.name);
    }
}

checkModels();