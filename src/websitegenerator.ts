import * as fs from "fs";
import * as path from "path";
import * as syntax from "./syntax";

export = Main;

module Main {
    "use strict";

    import SyntaxKind = syntax.SyntaxKind;

    const htmlFormats: { [key: string]: string; } = {};

    ["page.html"].forEach(fileName => {
        const filePath = path.join(__dirname, "pages", fileName);
        htmlFormats[fileName] = fs.readFileSync(filePath).toString();
    });

    export interface Options {
        dir: string;
        resources: {
            productName: string;
            productDescription: string;
        };
        writeFile?: (path: string, content: string) => void;
    }

    export function generate(elements: syntax.Element[], options: Options) {
        if (!fs.existsSync(options.dir)) {
            throw new Error(`The specified folder '${options.dir}' does not exist.`);
        }

        const writeFile = options.writeFile || ((filePath, content) => {
            const dirName = path.dirname(filePath);
            if (!fs.existsSync(dirName)) {
                fs.mkdirSync(dirName);
            }

            fs.writeFileSync(filePath, content);
        });

        const queue: {
            parentName: string;
            element: syntax.Element;
        }[] = [];

        Generator.generatePage("", path.join(options.dir, "index.html"), {
            pageTitle: options.resources.productName,
            description: options.resources.productDescription,
            elements: elements,
            processLinkElement: (element: syntax.ContainerElement<syntax.Element>) => {
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
                elements: (<syntax.ContainerElement<syntax.Element>>element).members || (<syntax.FunctionDeclaration>element).parameters || [],
                processLinkElement: (element: syntax.ContainerElement<syntax.Element>) => {
                    queue.push({
                        parentName: fullName,
                        element: element
                    });
                },
                writeFile: writeFile,
            });
        }
    }

    function getFileName(elementName: string, asLink?: boolean) {
        let result = "";

        if (elementName.startsWith("\"")) {
            const secondIndexOfQuote = elementName.indexOf("\"", 1);
            result = elementName.substr(1, secondIndexOfQuote - 1);
            elementName = elementName.substr(secondIndexOfQuote + 2);
        }

        if (elementName) {
            result = result + "/" + elementName + ".html";
        } else {
            result += (asLink ? "/" : "/index.html");
        }

        return result;
    }

    function getKindText(kind: SyntaxKind) {
        switch (kind) {
            case SyntaxKind.ClassDeclaration:
                return "Class";
            case SyntaxKind.EnumDeclaration:
                return "Enum";
            case SyntaxKind.FunctionDeclaration:
                return "Function";
            case SyntaxKind.InterfaceDeclaration:
                return "Interface";
            case SyntaxKind.ModuleDeclaration:
                return "Module";
            case SyntaxKind.TypeAliasDeclaration:
                return "Type";
            case SyntaxKind.VariableDeclaration:
                return "Value";
            case SyntaxKind.PropertyDeclaration:
            case SyntaxKind.PropertySignature:
                return "Properties";
            case SyntaxKind.MethodDeclaration:
            case SyntaxKind.MethodSignature:
                return "Methods";
            case SyntaxKind.Parameter:
                return "Parameters";
            default:
                break;
        }
    }

    module Generator {

        export interface PageOptions {
            pageTitle: string;
            description: string;
            elements: syntax.Element[];
            processLinkElement: (element: syntax.Element) => void;
            writeFile: (path: string, content: string) => void;
        }

        const linkable: { [key: string]: boolean; } = {};
        linkable[SyntaxKind.ModuleDeclaration] = true;

        export function generatePage(fullName: string, path: string, options: PageOptions) {
            const pageInfo = generatePageContent(fullName, options);
            const pageHtml = format(htmlFormats["page.html"], {
                pageTitle: options.pageTitle,
                pageBreadCrumb: generatePageBreadCrumb(fullName),
                pageContent: pageInfo.content,
                pageRightNav: pageInfo.rightNav
            });

            options.writeFile(path, pageHtml);
        }

        function generatePageBreadCrumb(fullName: string) {
            let result = `
<ul>
    <li class="main-breadcrumb-home">
        <a href="/" title="Home">
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" width="20px" height="20px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve">
                <path d="M502.625,328.563c-6.25,6.25-14.438,9.375-22.625,9.375s-16.375-3.125-22.625-9.375L448,319.188V475H320V315H192v160H64  V319.188l-9.375,9.375c-12.5,12.5-32.75,12.5-45.25,0s-12.5-32.75,0-45.25L256,36.688l246.625,246.625  C515.125,295.813,515.125,316.063,502.625,328.563z"/>
            </svg>
        </a>
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

            if (currentElementName) {
                result += `
    <li class="main-breadcrumb-currentitem">${currentElementName}</li>
</ul>`;
            }

            return result;
        }

        function generatePageContent(fullName: string, options: PageOptions): { content: string; rightNav: string; } {
            const result = {
                content: `<p>${options.description}</p>`,
                rightNav: "<ul>",
            };

            sections.forEach(section => {
                const current = generateSection(fullName, section, options.elements.filter(el => {
                    return el.kind === section.kind
                        && ((el.name && !section.noName) || (!el.name && section.noName));
                }), options.processLinkElement);

                if (current) {
                    result.content += current;
                    result.rightNav += `
    <li>
        <a class="main-rightnav-link" href="#${section.title}">${section.title}</a>
    </li>
`;
                }
            });

            const others = generateSection(fullName, { kind: null, title: "Others" }, options.elements.filter(el => {
                return !sections.some(section => section.kind === el.kind);
            }), options.processLinkElement);

            if (others) {
                result.content += others;
            }

            result.rightNav += "</ul>";

            return result;
        }

        interface Section {
            kind: SyntaxKind;
            title: string;
            noName?: boolean;
        }

        const sections: Section[] = [
            { kind: SyntaxKind.ModuleDeclaration, title: "Modules" },
            { kind: SyntaxKind.InterfaceDeclaration, title: "Interfaces" },
            { kind: SyntaxKind.TypeAliasDeclaration, title: "Types" },
            { kind: SyntaxKind.VariableDeclaration, title: "Values" },
            { kind: SyntaxKind.EnumDeclaration, title: "Enums" },
            { kind: SyntaxKind.FunctionDeclaration, title: "Functions" },
            { kind: SyntaxKind.ClassDeclaration, title: "Classes" },
            { kind: SyntaxKind.PropertyDeclaration, title: "Properties" },
            { kind: SyntaxKind.PropertySignature, title: "Properties" },
            { kind: SyntaxKind.MethodDeclaration, title: "Methods" },
            { kind: SyntaxKind.MethodSignature, title: "Methods" },
            { kind: SyntaxKind.MethodDeclaration, title: "Constructors", noName: true },
            { kind: SyntaxKind.MethodSignature, title: "Constructors", noName: true },
        ];

        function generateSection(parentName: string, section: Section, elements: syntax.Element[], processLinkElement: (element: syntax.Element) => void) {
            if (!elements.length) {
                return "";
            }

            return format(
                `
<section class="main-body-section">
    <h2 id="{sectionTitle}">{sectionTitle}</h2>
    {sectionContent}
    <a class="main-body-section-toplink" href="#">
        <span style="padding-right: 4px">Go to top</span>
        <svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.0" width="20px" height="20px" viewBox="-500, -600 ,1000, 1200">
            <polygon style="stroke:none; fill:#000000;" points="100,600 100,-200  500,200 500,-100  0,-600  -500,-100 -500,200 -100,-200 -100,600 "/>
        </svg>
    </a>
</section>`,
                {
                    sectionTitle: section.title,
                    sectionContent: generateTable(parentName, elements, processLinkElement),
                });
        }

        function generateTable(parentName: string, elements: syntax.Element[], processLinkElement: (element: syntax.Element) => void) {
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

                if (!elementName && (element.kind === SyntaxKind.MethodDeclaration || element.kind === SyntaxKind.MethodSignature)) {
                    elementName = "ctor";
                }

                if (isLinkableKind(element.kind) && elementName !== "ctor") {
                    const fullName = parentName ? parentName + "." + elementName : elementName;
                    elementName = `<a href="${getFileName(fullName, true)}">${elementName}</a>`;
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

        function isLinkableKind(kind: SyntaxKind) {
            return kind === SyntaxKind.ModuleDeclaration
                || kind === SyntaxKind.InterfaceDeclaration
                || kind === SyntaxKind.EnumDeclaration
                || kind === SyntaxKind.FunctionDeclaration
                || kind === SyntaxKind.ClassDeclaration;
        }

        function format(input: string, params: { [key: string]: string; }): string {
            const result = input.replace(/\{[a-zA-Z\d]*}/g, (param) => {
                const key = param.substr(1, param.length - 2);
                return params[key];
            });
            return result;
        }
    }
}
