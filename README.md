# toolbox
Toolbox is a collection of handy web-based tools designed to simplify everyday tasks for developers. Built with HTML, CSS, and JavaScript, this offline-capable suite provides utilities for code formatting, text manipulation, data conversion, and more. From beautifying JSON to generating strong passwords, Toolbox aims to be a one-stop shop for common developer needs, accessible anytime, anywhere, even without an internet connection.

## toolbox structure
```bash
toolbox/
├── index.html                      (front page, search option for tools)
├── apps.json                       (list of all the apps in production)
├── sw.js                           (service workers config)
├── 404.html                        (error handling)
├── README.md
├── src/
│   ├── style.css                   (default stylesheet for toolbox)
│   └── script.js                   (general website script for actions, search, transitions, etc.)
└── tools/
    ├── html-beautifier/            (default tools structure with index, scripts, libraries and custom stylesheets)
    │   ├── index.html
    │   └── script.js
    ├── json-beautifier/
    │   ├── index.html
    │   └── script.js
    ├── base64-encoder/
    │   ├── index.html
    │   └── script.js
    ├── jekyll-post-formatter/
    │   ├── index.html
    │   └── script.js
    └── ... (other tools)
```

# apps
