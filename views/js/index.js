function showError(text, ok) {
    if (window.confirm(text)) if (ok !== undefined) ok()
}
const fileMap = new Map();

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace('\n', "<br>");
}

async function load() {
    if (window.location.pathname === "/") {
        $("body").html("<h1>Docs coming soon</h1>")
    } else {
              $("body").html("<h1>Please Wait</h1>")
        if (window.location.hash === undefined || window.location.hash === "") {
            const hash = window.prompt("No decryption key. Please enter it below")
            if (hash === null) {
                return load()
            } else {
                window.location.hash = hash;
                return load();
            }
        }
        const id = window.location.pathname.replace("/", "")
        fetch("/api/v1/getDebug/" + id).then(res => res.json()).then(json => {
            if (json.error !== undefined) {
                      $("body").html(`<h1>${json.error}. <span onclick="load()" class="cursorPointer noselect">Retry?</span></h1>`)
                return
            }
            init(json.data)
        }).catch(err => {
            console.log(err)
            showError(err.message + ". Retry?", load)
        })
    }
}

function init(data) {
    $("body").html("<div id='body'></div>")
            let key = window.location ? window.location.hash.replace("#", "") : null;
        const keyBytes = Uint8Array.from(encodeURIComponent(key).replace(/%(..)/g,(m,v)=>{return String.fromCodePoint(parseInt(v,16))}), c=>c.codePointAt(0));
    var final = decrypt(keyBytes, data)
    final = aesjs.utils.utf8.fromBytes(final)
    console.log(final)
    if (final === "") {
        const hash = window.prompt("Decryption key invalid. Please enter new one below")
        if (hash === null) {
            return init(data)
        } else {
            window.location.hash = hash;
            return init(data)
        }
    }
    const json = JSON.parse(final)
    var num = 0;
    json.forEach(ob => {
        num++;
        const type = ob.type;
        if (type === "key_value") {
            var code = `<h1>${escapeHtml(ob.name)}</h1>`
            ob.data.forEach(data => {
                code += `<p>${escapeHtml(data.key)}: ${escapeHtml(data.value)}</p>`;
            })
            code = "<div>" + code + "</div>"
            if (num !== json.length ) code = code + "<hr>"
            $(code).appendTo("#body")
        } else if (type === "files") {
            var code = `<h1>${escapeHtml(ob.name)}</h1>`
            ob.data.forEach(data => {
                var internalId = getRandomInt(1000)
                
                fileMap.set(internalId, data)
                code += `<div class="file" ><span class="auto-height" style="text-overflow: ellipsis; max-width:99%;overflow:hidden;    white-space: nowrap;
">${data.name}</span> <span class="material-icons reset-margin auto-height cursorPointer" onclick="openFile(${internalId})">launch</span></div>`;
            })
            code = "<div>" + code + "</div>"
            console.log(json.length + " " + num)
            if (num !== json.length ) code = code + "<hr>"
            $(code).appendTo("#body")
        }
    })
}
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function openFile(internalId) {
    const file = fileMap.get(internalId)
                                let lastDot = file.name.lastIndexOf('.');
                            let fileExtension = lastDot !== -1 ? file.name.substr(lastDot + 1, file.name.length) : null;
    openDialog(`
<div class='dialog_container2'>
<div class="file_dialog_first_iconname"><span style="text-overflow: ellipsis; overflow: hidden; max-width: 99%;">${file.name}</span><span  class="material-icons cursorPointer closeIcon"  onclick="closeDialog()" >close</span></div>

<pre><code class="${file.type === undefined ? fileExtension : file.type}">${atob(file.content)}</code></pre>
</div>
`)
    const block = document.querySelector("pre code")
    hljs.highlightBlock(block);
    hljs.lineNumbersBlock(block, { singleLine: true });
}

function closeDialog() {
    $('.dialog_container').animate({opacity: '0', 
    complete: function() {$('.dialog_container').remove()}
})
}
function openDialog(/*language:html*/html) {
    $(`<div class='dialog_container'>${html}</div>`).appendTo("body")
}

    function decrypt(key, b64data) {
        const bytes = base64js.toByteArray(b64data);
        const iv = bytes.subarray(0, 16);
        const data = bytes.subarray(16);
        if (data.length % 16 != 0) {
            throw new Error("Data length was not multiple of 16");
        }
        const aes = new aesjs.ModeOfOperation.cbc(key, iv);
        const decrypted = aes.decrypt(data);
        const unPadded = decrypted.subarray(0, decrypted.byteLength - decrypted[decrypted.byteLength - 1]);
        return unPadded;
    }




