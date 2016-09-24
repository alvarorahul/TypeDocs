"use strict";
const fs = require("fs");
const path = require("path");
var Main;
(function (Main) {
    "use strict";
    const htmlFormats = {};
    ["page.html"].forEach(fileName => {
        const filePath = path.join(__dirname, "pages", fileName);
        htmlFormats[fileName] = fs.readFileSync(filePath).toString();
    });
    function generate(elements, options) {
        if (!fs.existsSync(options.dir)) {
            throw new Error(`The specified folder '${options.dir}' does not exist.`);
        }
        const writeFile = options.writeFile || ((path, content) => fs.writeFileSync(path, content));
        const queue = [];
        Generator.generatePage("", path.join(options.dir, "index.html"), {
            pageTitle: options.resources.productName,
            description: options.resources.productDescription,
            elements: elements,
            processLinkElement: (element) => {
                queue.push({
                    parentName: null,
                    element: element
                });
            },
            writeFile: writeFile,
        });
        while (queue.length) {
            const queueItem = queue.shift();
            const element = queueItem.element;
            const fullName = queueItem.parentName ? queueItem.parentName + "." + element.name : element.name;
            Generator.generatePage(fullName, path.join(options.dir, `${getFileName(fullName)}`), {
                pageTitle: `${element.name} (${getKindText(element.kind)})`,
                description: element.documentation,
                elements: element.members || element.parameters || [],
                processLinkElement: (element) => {
                    queue.push({
                        parentName: fullName,
                        element: element
                    });
                },
                writeFile: writeFile,
            });
        }
    }
    Main.generate = generate;
    function getFileName(elementName) {
        let result = elementName;
        if (result.startsWith("\"")) {
            result = result.substr(1);
        }
        if (result.endsWith("\"")) {
            result = result.substr(0, result.length - 1);
        }
        result = result.replace(/\//g, "_");
        return result + ".html";
    }
    function getKindText(kind) {
        switch (kind) {
            case 217 /* ClassDeclaration */:
                return "Class";
            case 220 /* EnumDeclaration */:
                return "Enum";
            case 216 /* FunctionDeclaration */:
                return "Function";
            case 218 /* InterfaceDeclaration */:
                return "Interface";
            case 221 /* ModuleDeclaration */:
                return "Module";
            case 219 /* TypeAliasDeclaration */:
                return "Type";
            case 214 /* VariableDeclaration */:
                return "Value";
            case 142 /* PropertyDeclaration */:
            case 141 /* PropertySignature */:
                return "Properties";
            case 144 /* MethodDeclaration */:
            case 143 /* MethodSignature */:
                return "Methods";
            case 139 /* Parameter */:
                return "Parameters";
            default:
                break;
        }
    }
    var Generator;
    (function (Generator) {
        const linkable = {};
        linkable[221 /* ModuleDeclaration */] = true;
        function generatePage(fullName, path, options) {
            const pageHtml = format(htmlFormats["page.html"], {
                pageTitle: options.pageTitle,
                pageBreadCrumb: generatePageBreadCrumb(fullName),
                pageContent: generatePageContent(fullName, options),
            });
            options.writeFile(path, pageHtml);
        }
        Generator.generatePage = generatePage;
        function generatePageBreadCrumb(fullName) {
            let result = `
<ul>
    <li>
        <a href="/">Home</a>
    </li>`;
            const parts = fullName.split(".");
            const currentElementName = parts.pop();
            parts.reduce((prev, current) => {
                const nameUptoNow = prev ? prev + "." + current : current;
                result += `
    <li>
        <a href="/${nameUptoNow}.html">${current}</a>
    </li>`;
                return nameUptoNow;
            }, "");
            result += `
    <li class="main-breadcrumb-currentitem">${currentElementName}</li>
</ul>`;
            return result;
        }
        function generatePageContent(fullName, options) {
            let result = `<p>${options.description}</p>`;
            sections.forEach(section => {
                result += generateSection(fullName, section, options.elements.filter(el => {
                    return el.kind === section.kind
                        && ((el.name && !section.noName) || (!el.name && section.noName));
                }), options.processLinkElement);
            });
            result += generateSection(fullName, { kind: null, title: "Others" }, options.elements.filter(el => {
                return !sections.some(section => section.kind === el.kind);
            }), options.processLinkElement);
            return result;
        }
        const sections = [
            { kind: 221 /* ModuleDeclaration */, title: "Modules" },
            { kind: 218 /* InterfaceDeclaration */, title: "Interfaces" },
            { kind: 219 /* TypeAliasDeclaration */, title: "Types" },
            { kind: 214 /* VariableDeclaration */, title: "Values" },
            { kind: 220 /* EnumDeclaration */, title: "Enums" },
            { kind: 216 /* FunctionDeclaration */, title: "Functions" },
            { kind: 217 /* ClassDeclaration */, title: "Classes" },
            { kind: 142 /* PropertyDeclaration */, title: "Properties" },
            { kind: 141 /* PropertySignature */, title: "Properties" },
            { kind: 144 /* MethodDeclaration */, title: "Methods" },
            { kind: 143 /* MethodSignature */, title: "Methods" },
            { kind: 144 /* MethodDeclaration */, title: "Constructors", noName: true },
            { kind: 143 /* MethodSignature */, title: "Constructors", noName: true },
        ];
        function generateSection(parentName, section, elements, processLinkElement) {
            if (!elements.length) {
                return "";
            }
            return format(`
<section class="main-body-section">
    <h2>{sectionTitle}</h2>
    {sectionContent}
</section>`, {
                sectionTitle: section.title,
                sectionContent: generateTable(parentName, elements, processLinkElement),
            });
        }
        function generateTable(parentName, elements, processLinkElement) {
            let result = `
<table class="main-body-section-table">
    <thead>
        <tr>
            <td>Name</td>
            <td>Description</td>
        </tr>
    </thead>`;
            elements.forEach(element => {
                let elementName = element.name;
                if (!elementName && (element.kind === 144 /* MethodDeclaration */ || element.kind === 143 /* MethodSignature */)) {
                    elementName = "ctor";
                }
                if (isLinkableKind(element.kind) && elementName !== "ctor") {
                    const fullName = parentName ? parentName + "." + elementName : elementName;
                    elementName = `<a href="/${getFileName(fullName)}">${elementName}</a>`;
                    processLinkElement(element);
                }
                result += `
    <tr>
        <td>${elementName}</td>
        <td>${element.documentation || ""}</td>
    </tr>`;
            });
            result += `
</table>`;
            return result;
        }
        function isLinkableKind(kind) {
            return kind === 221 /* ModuleDeclaration */
                || kind === 218 /* InterfaceDeclaration */
                || kind === 220 /* EnumDeclaration */
                || kind === 216 /* FunctionDeclaration */
                || kind === 217 /* ClassDeclaration */;
        }
        function format(input, params) {
            const result = input.replace(/\{[a-zA-Z\d]*}/g, (param) => {
                const key = param.substr(1, param.length - 2);
                return params[key];
            });
            return result;
        }
    })(Generator || (Generator = {}));
})(Main || (Main = {}));
module.exports = Main;
