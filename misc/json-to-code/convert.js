const regexDict = {
    string: /["'](?=[\w]+["']: *["'].*["'],{0,1})/gm,
    int: /["'](?=[\w]+["']: *\d+(?=[^\.]),{0,1})/gm,
    float: /["'](?=[\w]+["']: *\d+\.,{0,1})/gm,
    bool: /["'](?=[\w]+["']: *((T|t)rue|(F|f)alse),{0,1})/gm,
    null: /["'](?=[\w]+["']: *(null),{0,1})/gm,
    end: /["']?: *.*,{0,1}/gm,
}

const subObjRegex = /(["'][\w]+["']: *{([^{}])+},{0,1})/gm;

// for c#
let replacements = { 
    string: "public string ",
    int: "public int ",
    float: "public float ",
    bool: "public bool ",
    null: "public string ",
    end: " { get; set; }",
}

function convertCSharp(json) {
    //TODO add bad json catching
    let innerMatch = json.match(this.subObjRegex)
    
    while (innerMatch != null){
        json = json.replace(subObjRegex, processSubObj)

        innerMatch = json.match(subObjRegex)
    }
    document.getElementById('MainOutput').value = processRegex(json, "ParentObj");
}

function processSubObj(obj) {
    const keyName = obj.match(/(?<=['"])[\w]*(?=['"]: *{)/gm)[0];
    const objName = `${keyName}Object`
    const innerContent = obj.match(/(?<={)[^}]*/gm)[0]

    createNewTab(`${keyName}Object`, processRegex(innerContent, objName))
    return `public ${objName} ${keyName}: null,`
}

function processRegex(json, objName) {
    json = json.match(/([^{}])+/)[0].trim()

    for (const [key, value] of Object.entries(regexDict)){
        json = json.replaceAll(value, replacements[key])
    } 

    json = `public class ${objName} { \n\t` + json.replaceAll(/\n/gm, '\n\t') + `\n}`

    return json
}

//#region Tab Creation/Deletion/Switching
function switchTab(e, tab) {
    let content = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < content.length; i++) {
        content[i].style.display = "none";
    }

    let link = document.getElementsByClassName("tablinks");
    for (let i = 0; i < link.length; i++) {
        link[i].className = link[i].className.replace(" active", "");
    }

    document.getElementById(tab).style.display = "block";
    e.currentTarget.className += " active";
}

function createNewTab(name, content){
    document.getElementById("tabs").innerHTML += 
        `<button class="tablinks" onclick="switchTab(event, '${name}')">${name}</button>`;

    document.getElementById("right-col").innerHTML +=
        `<div id="${name}" class="tabcontent">
        <textarea id="${name}Output" rows="50" cols="75">${content}</textarea>
        </div>`
}

function clearTabs(){
    let tabs = document.getElementById('tabs')
    for (let i = tabs.children.length - 1; i >= 0; i--){
        if (tabs.children[i].value != "main"){
            tabs.children[i].remove()
        }
    }

    let content = document.getElementById('right-col')
    for (let i = content.children.length - 1; i >= 0; i--){
        if (content.children[i].id != "main" && content.children[i].id != "tabs"){
            content.children[i].remove()
        }
    }
}
//#endregion

function onConvert() {
    clearTabs();

    let inputTextElement = document.getElementById('inputText');
    stripTabs(inputTextElement)


    convertCSharp(inputTextElement.value)
}

function stripTabs(element) {
    const tabStrip = / +(?=["'].*["']: +.*,{0,1})/gm;
    element.value = element.value.replaceAll(tabStrip, '')
}