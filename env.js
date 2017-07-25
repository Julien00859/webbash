const ENV = {
    "PATH": "/bin;/sbin",
    "PWD": "~/portfolio",
    "USER": "julien"
}
ENV.HOME = `/home/${ENV.USER}`;
let homedir = namei(ENV.HOME);