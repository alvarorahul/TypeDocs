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
    }

    export function generate(elements: syntax.Element[], options: Options) {
        if (!fs.existsSync(options.dir)) {
            throw new Error(`The specified folder '${options.dir}' does not exist.`);
        }

        const queue: {
            parentName: string;
            element: syntax.ContainerElement<syntax.Element>;
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
        });

        while (queue.length) {
            const queueItem = queue.shift();
            const element = queueItem.element;
            const fullName = queueItem.parentName ? queueItem.parentName + "." + element.name : element.name;
            Generator.generatePage(fullName, path.join(options.dir, `${getFileName(fullName)}`), {
                pageTitle: `${element.name} (${getKindText(element.kind)})`,
                description: element.documentation,
                elements: element.members,
                processLinkElement: (element: syntax.ContainerElement<syntax.Element>) => {
                    queue.push({
                        parentName: fullName,
                        element: element
                    });
                },
            });
        }
    }

    function getFileName(elementName: string) {
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
        }

        const linkable: { [key: string]: boolean; } = {};
        linkable[SyntaxKind.ModuleDeclaration] = true;

        export function generatePage(fullName: string, path: string, options: PageOptions) {
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

            fs.writeFileSync(path, pageHtml);
        }

        interface Section {
            kind: SyntaxKind;
            title: string;
        }

        const sections: Section[] = [
            { kind: SyntaxKind.ModuleDeclaration, title: "Modules" },
            { kind: SyntaxKind.InterfaceDeclaration, title: "Interfaces" },
            { kind: SyntaxKind.TypeAliasDeclaration, title: "Types" },
            { kind: SyntaxKind.VariableDeclaration, title: "Values" },
            { kind: SyntaxKind.EnumDeclaration, title: "Enums" },
            { kind: SyntaxKind.FunctionDeclaration, title: "Functions" },
            { kind: SyntaxKind.ClassDeclaration, title: "Classes" },
        ];

        function generateSection(parentName: string, section: Section, elements: syntax.Element[], processLinkElement: (element: syntax.Element) => void) {
            if (!elements.length) {
                return "";
            }

            return format(
                `
<section class="items-section">
    <h2>{sectionTitle}</h2>
    {sectionContent}
</section>`,
                {
                    sectionTitle: section.title,
                    sectionContent: generateTable(parentName, elements, processLinkElement),
                });
        }

        function generateTable(parentName: string, elements: syntax.Element[], processLinkElement: (element: syntax.Element) => void) {
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
                if (element.kind === SyntaxKind.ModuleDeclaration) {
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

        function format(input: string, params: { [key: string]: string; }): string {
            const result = input.replace(/\{[a-zA-Z\d]*}/g, (param) => {
                const key = param.substr(1, param.length - 2);
                return params[key];
            });
            return result;
        }
    }
}
