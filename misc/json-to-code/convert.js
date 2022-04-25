
function convert() {
    let inputTextElement = document.getElementById('inputText');
    stripTabs(inputTextElement)

    // TODO: Add switch for different lang
    cSharp = new toCSharp(inputTextElement.value);
    let converted = cSharp.convert();

    document.getElementById('outputText').value = converted;
}

function stripTabs(element) {
    const tabStrip = / +(?=["|'].*["|']: +.*,{0,1})/gm;
    element.value = element.value.replaceAll(tabStrip, '')
}

class BaseConverter {
    regexDict = {
        string: /["|'](?=[A-Za-z0-9]+["|']: *["|'].*["|'],{0,1})/gm,
        int: /["|'](?=[A-Za-z0-9]+["|']: *\d+(?=[^\.]),{0,1})/gm,
        float: /["|'](?=[A-Za-z0-9]+["|']: *\d+\.,{0,1})/gm,
        bool: /["|'](?=[A-Za-z0-9]+["|']: *(true|True|false|False),{0,1})/gm,
        null: /["|'](?=[A-Za-z0-9]+["|']: *(null),{0,1})/gm,
        end: /["|']: *.*,/gm,
    }

    constructor(json){
        this.json = json;
    }

    processRegex(replacements) {
        let json = this.json;

        for (const [key, value] of Object.entries(this.regexDict)){
            json = json.replaceAll(value, replacements[key])
        } 

        return json
    }
}

class toCSharp extends BaseConverter {
    replacements = {
        string: "public string ",
        int: "public int ",
        float: "public float ",
        bool: "public bool ",
        null: "public string ",
        end: " { get; set; }",
    }

    constructor(json){
        super(json);
    }

    convert() {
        return this.processRegex(this.replacements)
    }
}

