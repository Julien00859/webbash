function write(text, color=null) {
    text = wrap(text, 80);
    if (output != null) {
        dir = namei(parentpath(output));
        if (!dir)
            return;
        if (!(output in dir))
            dir[output] = "";
        if (append)
            dir[output] += text;
        else
            dir[output] = text;
    } else {
        if (!DOM.stdout.firstChild)
            DOM.stdout.appendChild(document.createTextNode(""));
        if (color) {
            let span = document.createElement("spam");
            span.style.color = color;
            span.appendChild(document.createTextNode(text))
            DOM.stdout.appendChild(span);
        } else if (DOM.stdout.nodeType === 3) {
            DOM.stdout.data += text;
        } else {
            DOM.stdout.appendChild(document.createTextNode(text));
        }
    }
}
function isfile(node) {
    return (typeof node === "string" && !node.startsWith("http")) || typeof node === "function";
}
function islink(node) {
    return typeof node === "string" && node.startsWith("http");
}
function isdir(node) {
    return node !== null && typeof node === "object";
}
function isexe(node) {
    return typeof node === "function";
}
function getfullpath(path) {
    if (path === void 0)
        path = ENV.PWD;
    if (path.startsWith("~"))
        path = pathjoin(ENV.HOME, path.slice(1));
    else if (!path.startsWith("/")) {
        if (ENV.PWD.startsWith("~"))
            path = pathjoin(ENV.HOME, ENV.PWD.slice(1), path);
        else
            path = pathjoin(ENV.PWD, path);
    }
    return path;
}
function namei(path) {
    let node = FS;
    let parentNode = FS;
    for (dir of getfullpath(path).slice(1).split("/")) {
        if (!dir)
            break;
        else if (dir == "..")
            node = parentNode;
        else if (dir == ".")
            continue;
        else if (dir in node)
            [parentNode, node] = [node, node[dir]];
        else
            return null;
    }
    return node;
}
function parentpath(path) {
    path = getfullpath(path);
    path = path.slice(0, path.lastIndexOf("/"));
    if (!path)
        return "/";
    return path;
}
function pathjoin(path, ...paths) {
    if (path.endsWith("/"))
        path = path.slice(0, path.length - 1);
    for (p of paths) {
        if (!p)
            continue;
        if (p.endsWith("/"))
            p = path.slice(0, path.length - 1);
        path += p.startsWith("/") ? p : "/" + p
    }
    return path;
}
function find(name) {
    let exe = namei(name);
    if (exe)
        return exe;
    for (path of ENV.PATH.split(";")) {
        exe = namei(pathjoin(path, name));
        if (exe)
            return exe;
    }
}