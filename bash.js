const DOM = {};
const histo = [];
let histopos = 0;
let last = "";
let output = null;
let append = false;

function bash() {
    for (id of ["stdout", "prompt", "promptinput", "promptdir", "promptuser", "secret", "promptsecret", "line1", "linex", "linel"])
        DOM[id] = document.getElementById(id);

    DOM.promptdir.appendChild(document.createTextNode(ENV.PWD));
    DOM.promptuser.appendChild(document.createTextNode(ENV.USER));
    DOM.promptinput.focus();
    DOM.promptinput.onkeypress = event => {
        switch (event.key) {
            case "Enter":
                cmd = event.target.value;
                event.target.value = "";
                event.target.placeholder = "";
                write(`${ENV.USER}:${ENV.PWD}$ ${cmd}\r\n`);
                promptcli(cmd);
                break;
            case "ArrowUp":
                if (!histo.length)
                    break;
                if (histopos === histo.length)
                    last = event.target.value;
                if (histopos > 0)
                    histopos--;
                event.target.value = histo[histopos];
                break;
            case "ArrowDown":
                if (histopos < histo.length)
                    histopos++;
                event.target.value = histopos == histo.length ? last : histo[histopos];
                break;
        }
    }
}

const shell_re = /^\s*([\./a-z]+)( (.*?))?\s*((>>?)\s*([\./a-z]+))?\s*$/;
function promptcli(message) {
    output = null

    let match = shell_re.exec(message);
    if (match) {
        histopos = histo.length;
        histo.push(message);
        let exe = find(match[1]);
        if (!exe || !isexe(exe)) {
            write(`Unknown command\r\n`);
            return;
        }

        if (match[4] !== void 0) {
            append = match[5].length === 2;
            output = match[6];
        }
        if (match[3])
            exe(...match[3].split(/\s+/));
        else
            exe();
    } else {
        write("syntaxe error\r\n");
    }
}
function wrap(text, length) {
    let wrapped = [];
    let line = "";
    let words = text.split(/ /);
    for (let wordx = 0; wordx < words.length && wordx < 50; wordx++) {
        let word = words[wordx];
        if (word.length >= length) {
            if (line)
                wrapped.push(line);
            wrapped.push(word.slice(0, length));
            line = "";
            words.splice(wordx + 1, 0, word.slice(length));
            continue;
        }
        if (word.length + line.length >= length) {
            wrapped.push(line);
            line = word;
            continue
        }
        line += line ? " " + word : word;
    }
    if (line)
        wrapped.push(line);

    return wrapped.join("\r\n");
}
function getpasswd(callback) {
    DOM.prompt.style.display = "none";
    DOM.secret.style.visibility = "visible";
    DOM.promptsecret.onkeypress = evt => {
        if (evt.key == "Enter") {
            let secret = DOM.promptsecret.value;
            DOM.promptsecret.value = "";
            DOM.promptsecret.onkeypress = null;
            DOM.prompt.style.display = "flex";
            DOM.secret.style.visibility = "hidden";
            write("Password:\r\n");
            callback(secret);
            DOM.promptinput.focus();
        }
    }
    DOM.promptsecret.focus()
}
