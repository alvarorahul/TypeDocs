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
                elements: element.members,
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
            default:
                break;
        }
    }
    var Generator;
    (function (Generator) {
        const linkable = {};
        linkable[221 /* ModuleDeclaration */] = true;
        function generatePage(fullName, path, options) {
            let pageContent = `<p>${options.description}</p>`;
            sections.forEach(section => {
                pageContent += generateSection(fullName, section, options.elements.filter(el => {
                    return el.kind === section.kind;
                }), options.processLinkElement);
            });
            pageContent += generateSection(fullName, { kind: null, title: "Others" }, options.elements.filter(el => {
                return !sections.some(section => section.kind === el.kind);
            }), options.processLinkElement);
            const pageHtml = format(htmlFormats["page.html"], {
                pageTitle: options.pageTitle,
                pageContent: pageContent,
            });
            options.writeFile(path, pageHtml);
        }
        Generator.generatePage = generatePage;
        const sections = [
            { kind: 221 /* ModuleDeclaration */, title: "Modules" },
            { kind: 218 /* InterfaceDeclaration */, title: "Interfaces" },
            { kind: 219 /* TypeAliasDeclaration */, title: "Types" },
            { kind: 214 /* VariableDeclaration */, title: "Values" },
            { kind: 220 /* EnumDeclaration */, title: "Enums" },
            { kind: 216 /* FunctionDeclaration */, title: "Functions" },
            { kind: 217 /* ClassDeclaration */, title: "Classes" },
        ];
        function generateSection(parentName, section, elements, processLinkElement) {
            if (!elements.length) {
                return "";
            }
            return format(`
<section class="items-section">
    <h2>{sectionTitle}</h2>
    {sectionContent}
</section>`, {
                sectionTitle: section.title,
                sectionContent: generateTable(parentName, elements, processLinkElement),
            });
        }
        function generateTable(parentName, elements, processLinkElement) {
            let result = `
<table>
    <thead>
        <tr>
            <td>Name</td>
            <td>Description</td>
        </tr>
    </thead>`;
            elements.forEach(element => {
                let elementName = element.name;
                if (element.kind === 221 /* ModuleDeclaration */) {
                    const fullName = parentName ? parentName + "." + elementName : elementName;
                    elementName = `<a href="/${getFileName(fullName)}">${elementName}</a>`;
                    processLinkElement(element);
                }
                result += `
    <tr>
        <td>${elementName}</td>
        <td>${element.documentation}</td>
    </tr>`;
            });
            result += `
</table>`;
            return result;
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
