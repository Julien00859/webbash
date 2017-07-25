const FS = {
    "README": "Hello world ! :D",
    "bin": {
        "cat": function cat(...paths) {
            for (let path of paths) {
                let file = namei(path);
                if (isdir(file))
                    write(`${path} is a directory\r\n`);
                else if (isexe(file)) {
                    write(file.toString().split("\n")[0] + "}\r\n");
                }
                else if (isfile(file))
                    write(file + "\r\n");
                else if (islink(file)) 
                    if (DOM.promptinput.value.startsWith("curl"))
                        DOM.promptinput.value += " " + file;
                    else
                        DOM.promptinput.value = "curl " + file;
                else
                    write(`File ${path} not found.\r\n`);
            }
        },
        "cd": function cd(path) {
            let node = namei(path);
            if (isdir(node)) {
                ENV.PWD = getfullpath(path).replace(new RegExp("^" + ENV.HOME), "~");
                DOM.promptdir.firstChild.data = ENV.PWD;
            } else
                write(`Can't change directory to ${path}\r\n`);
        },
        "ls": function ls(...paths) {
            if (!paths.length) 
                paths.push(ENV.PWD);
            for (path of paths) {
                node = namei(path);
                if (isfile(node))
                    write(path + "\r\n");
                else if (isdir(node)) {
                    write(". .. ", "#729FCF");
                    for (childNode in node) {
                        let color = null;
                        if (isexe(node[childNode]))
                            color = "#8AE234";
                        else if (isdir(node[childNode]))
                            color = "#729FCF";
                        else if (islink(node[childNode]))
                            color = "#34E2E2";
                        write(childNode + " ", color);
                    }
                    write("\r\n");
                } else
                    write(`File ${path} not found.\r\n`);
            }
        },
        "echo": function echo(...args) {
            write(args.map(word => {
                if (word.startsWith("$")) {
                    let envvar = word.slice(1);
                    if (envvar in ENV)
                        return ENV[envvar];
                    return "";
                }
                return word;
            }).join(" ") + "\r\n");
        },
        "clear": function clear() {
            while(DOM.stdout.firstChild)
                DOM.stdout.removeChild(DOM.stdout.firstChild);
            DOM.stdout.appendChild(document.createTextNode(""));
        },
        "man": function help(...cmds) {
            if (!cmds.length) {
                write("This is a (very limitated) shell-like prompt written in javascript. You can explore the (factice) file system with commands like cd and ls, write file content with cat. Each output can be redirected to files using the '> {file name}' suffix.\r\n")
                write("\r\nCommand list: ls /bin\r\n");
                write("Help for a specific command: man <command>\r\n");
            }
            for (let cmd of cmds) {
                let exe = find(cmd);
                if (!exe || !isexe(exe)) {
                    write(`Unknow command: ${cmd}\r\n`);
                    return;
                }

                switch (exe) {
                    case namei("/bin/echo"):
                        write("Write content to stdout.\r\n");
                        write("Usage: echo <words...>\r\n");
                        break;
                    case namei("/bin/cat"):
                        write("Write the content of file.\r\n");
                        write("Usage: cat <file or link paths...>\r\n");
                        break;
                    case namei("/bin/clear"):
                        write("Clear the window.\r\n");
                        write("Usage: clear\r\n");
                        break
                    case namei("/bin/cd"):
                        write("Change the current directory.\r\n");
                        write("Usage: cd <relative or full path>\r\n");
                        break;
                    case namei("/bin/curl"):
                        write("Open an URL in another window.\r\n");
                        write("Usage: curl <urls>\r\n");
                        break;
                    case namei("/bin/ls"):
                        write("Write directory content.\r\n");
                        write("Usage: ls <paths...>\r\n");
                        break;
                    default:
                        write(`No entry for ${cmd}\r\n`)
                }
            }
        },
        "sudo": function sudo(...args) {
            let onpwd = function onpwd(secret) {
                if (namei("/etc/secret").split("\r\n").filter(line => line.split(":")[0] === ENV.USER)[0].split(":")[1] === secret) {
                    let realuser = ENV.USER;
                    ENV.USER = "root";
                    promptcli(args.join(" "));
                    ENV.USER = realuser;
                } else {
                    write("Permission denied\r\n");
                }
            }
            getpasswd(onpwd);
        },
        "curl": function sudo(...links) {
            for (let link of links) {
                if (islink(link))
                    window.open(link, "_blank");
                else
                    write(`Host not found: ${link}`);
            }
        }, 
        "cowsay": function cowsay(...message) {
            lines = wrap(message.join(" "), 40).split("\r\n");
            DOM.line1.firstChild.data = "/ " + lines[0] + " ".repeat(39 - lines[0].length) + " \\"
            if (lines.length === 2) {
                DOM.linex.firstChild.data = "| " + lines[linex] + " ".repeat(39 - lines[linex].length) + " |\r\n"
                DOM.linel.firstChild.data = "\\" + " ".repeat(41) + "/";
            } else if (lines.length > 2) {
                DOM.linex.firstChild.data = "";
                for (let linex = 1; linex < lines.length - 1; linex++)
                    DOM.linex.firstChild.data += "| " + lines[linex] + " ".repeat(39 - lines[linex].length) + " |\r\n";
                DOM.linex.firstChild.data = DOM.linex.firstChild.data.slice(0, DOM.linex.firstChild.data.length - 2);
                DOM.linel.firstChild.data = "\\ " + lines[lines.length - 1] + " ".repeat(39 - lines[lines.length - 1].length) + " /";
            } else {
                DOM.linex.firstChild.data = "|" + " ".repeat(41) + "|";
                DOM.linel.firstChild.data = "\\" + " ".repeat(41) + "/";
            }
        }
    },
    "sbin": {
        "reboot": function reboot() {
            if (ENV.USER !== "root") {
                write("Permission denied\r\n");
                return;
            }
                
            self.location.reload();
        },
        "shutdown": function shutdown() {
            if (ENV.USER !== "root") {
                write("Permission denied\r\n");
                return;
            }

            self.location = "about:blank";
        }
    },
    "etc": {
        "secret": "julien:pizza\r\n"
    },
    "home": {
        "julien": {
            "portfolio": {
                "BotIRC": "https://github.com/Julien00859/BotIRC/releases"
            }
        }
    }
}