import * as path from "path";
import * as ts from "typescript";
import * as syntax from "./syntax";
import * as websitegenerator from "./websitegenerator";

export = Main;

module Main {
    "use strict";

    import SyntaxKind = syntax.SyntaxKind;

    /**
     * Input for the generator to process.
     */
    export interface GeneratorInput {
        /**
         * The TypeScript source to parse.
         */
        sourceText: string;

        /**
         * The name of the source file corresponding to the data.
         */
        sourceFileName: string;
    }

    /**
     * Options used for controlling how documentation generation happens.
     */
    export interface GeneratorOptions {
        /**
         * Compiler options used to compiler the files.
         */
        compilerOptions?: ts.CompilerOptions;

        /**
         * The folder in which the files for the website of API documentation
         * should be generated.
         */
        websiteOptions?: WebsiteOptions;

        /**
         * Callback to execute in dev mode when an unexpected situation is encountered.
         */
        devMode?: (node: ts.Node) => void;
    }

    /**
     * Options for generating the website.
     */
    export type WebsiteOptions = websitegenerator.Options;

    const typedKinds: { [key: number]: boolean } = {};
    typedKinds[SyntaxKind.PropertySignature] = true;
    typedKinds[SyntaxKind.Parameter] = true;
    typedKinds[SyntaxKind.MethodSignature] = true;
    typedKinds[SyntaxKind.VariableDeclaration] = true;
    typedKinds[SyntaxKind.FunctionDeclaration] = true;
    typedKinds[SyntaxKind.TypeAliasDeclaration] = true;

    const canBeOptionalKinds: { [key: number]: boolean } = {};
    canBeOptionalKinds[SyntaxKind.PropertySignature] = true;
    canBeOptionalKinds[SyntaxKind.Parameter] = true;
    canBeOptionalKinds[SyntaxKind.MethodSignature] = true;

    const canHaveAccessibilityModifierKinds: { [key: number]: boolean } = {};
    canHaveAccessibilityModifierKinds[SyntaxKind.PropertySignature] = true;
    canHaveAccessibilityModifierKinds[SyntaxKind.PropertyDeclaration] = true;
    canHaveAccessibilityModifierKinds[SyntaxKind.MethodSignature] = true;
    canHaveAccessibilityModifierKinds[SyntaxKind.MethodDeclaration] = true;

    /**
     * Generates documentation for APIs present in the specified files.
     *
     * @param fileNames The list of files.
     * @param options The options used to generate documentation.
     * @returns The list of documentation elements.
     */
    export function generate(fileNames: string[], options?: GeneratorOptions): syntax.Element[] {
        options = options || {};

        const result: syntax.Element[] = [];

        const compilerOptions = options.compilerOptions || {
            target: ts.ScriptTarget.ES5,
            noLib: true,
            module: ts.ModuleKind.AMD,
            typeRoots: [],
        };
        const program = ts.createProgram(fileNames, compilerOptions);
        const checker = program.getTypeChecker();

        program.getSourceFiles().forEach(sourceFile => {
            processNode(sourceFile, null, result, checker, options.devMode);
        });

        if (options.websiteOptions) {
            websitegenerator.generate(result, options.websiteOptions);
        }

        return result;
    }

    export function flattenModules(elements: syntax.Element[]): syntax.ModuleDeclaration[] {
        const flattenedModules: syntax.ModuleDeclaration[] = [];

        const moduleForRootElements = createModuleDeclaration();
        const modulesToProcess = [moduleForRootElements];

        elements.forEach(element => {
            if (element.kind === SyntaxKind.ModuleDeclaration) {
                modulesToProcess.push(<syntax.ModuleDeclaration>element);
            } else {
                moduleForRootElements.members.push(element);
            }
        });

        while (modulesToProcess.length) {
            const currentModule = modulesToProcess.shift();
            const clonedModule = cloneModuleDeclaration(currentModule);
            clonedModule.members.length = 0; // Intentionally not assigning a new array so that toJSON continues to work.

            currentModule.members.forEach(member => {
                if (member.kind === SyntaxKind.ModuleDeclaration && !(<syntax.ModuleDeclaration>currentModule).amd) {
                    const clonedChildModule = cloneModuleDeclaration(<syntax.ModuleDeclaration>member);
                    clonedChildModule.name = `${currentModule.name}.${clonedChildModule.name}`;
                    modulesToProcess.push(clonedChildModule);
                } else {
                    clonedModule.members.push(member);
                }
            });

            if (clonedModule.members.length) {
                flattenedModules.push(clonedModule);
            }
        }

        return flattenedModules;
    }

    function processNode(node: ts.Node, parentElement: syntax.Element, results: syntax.Element[], checker: ts.TypeChecker, devMode: (node: ts.Node) => void): void {
        let passThrough: boolean;
        let ignoreElement: boolean;
        let processed: boolean;

        switch (node.kind) {
            case ts.SyntaxKind.DeclareKeyword:
            case ts.SyntaxKind.EndOfFileToken:
            case ts.SyntaxKind.ExportAssignment:
            case ts.SyntaxKind.Identifier:
            case ts.SyntaxKind.ImportDeclaration:
            case ts.SyntaxKind.ImportEqualsDeclaration:
                ignoreElement = true;
                break;
            case ts.SyntaxKind.VariableStatement:
            case ts.SyntaxKind.VariableDeclarationList:
                passThrough = true;
                break;
            case ts.SyntaxKind.AnyKeyword:
            case ts.SyntaxKind.ArrayType:
            case ts.SyntaxKind.BooleanKeyword:
            case ts.SyntaxKind.ConstructorType:
            case ts.SyntaxKind.ExpressionWithTypeArguments:
            case ts.SyntaxKind.FunctionType:
            case ts.SyntaxKind.IntersectionType:
            case ts.SyntaxKind.NeverKeyword:
            case ts.SyntaxKind.NullKeyword:
            case ts.SyntaxKind.NumberKeyword:
            case ts.SyntaxKind.ParenthesizedType:
            case ts.SyntaxKind.StringKeyword:
            case ts.SyntaxKind.StringLiteral:
            case ts.SyntaxKind.ThisType:
            case ts.SyntaxKind.TupleType:
            case ts.SyntaxKind.TypeLiteral:
            case ts.SyntaxKind.TypePredicate:
            case ts.SyntaxKind.TypeQuery:
            case ts.SyntaxKind.TypeReference:
            case ts.SyntaxKind.UndefinedKeyword:
            case ts.SyntaxKind.UnionType:
            case ts.SyntaxKind.UnknownKeyword:
            case ts.SyntaxKind.VoidKeyword:
                const typeElement = getType(node);
                if (typedKinds[parentElement.kind]) {
                    (<syntax.TypedElement>parentElement).type = typeElement;
                    processed = true;
                } else if (parentElement.kind === SyntaxKind.HeritageClause) {
                    (<syntax.HeritageClause>parentElement).types.push(typeElement);
                    processed = true;
                } else if (parentElement.kind === SyntaxKind.ModuleDeclaration) {
                    (<syntax.ModuleDeclaration>parentElement).amd = true;
                    processed = true;
                }
                break;
            case ts.SyntaxKind.QuestionToken:
                if (canBeOptionalKinds[parentElement.kind]) {
                    (<syntax.CanBeOptional>parentElement).optional = true;
                    processed = true;
                }
                break;
            case ts.SyntaxKind.ConstKeyword:
                if (parentElement.kind === SyntaxKind.EnumDeclaration) {
                    (<syntax.EnumDeclaration>parentElement).isConst = true;
                    processed = true;
                }
                break;
            case ts.SyntaxKind.PrivateKeyword:
                if (canHaveAccessibilityModifierKinds[parentElement.kind]) {
                    (<syntax.ItemWithAccessibilityModifiers>parentElement).isPrivate = true;
                    processed = true;
                }
                break;
            case ts.SyntaxKind.ProtectedKeyword:
                if (canHaveAccessibilityModifierKinds[parentElement.kind]) {
                    (<syntax.ItemWithAccessibilityModifiers>parentElement).isProtected = true;
                    processed = true;
                }
                break;
            case ts.SyntaxKind.StaticKeyword:
                if (canHaveAccessibilityModifierKinds[parentElement.kind]) {
                    (<syntax.ItemWithAccessibilityModifiers>parentElement).isStatic = true;
                    processed = true;
                }
                break;
            case ts.SyntaxKind.AbstractKeyword:
                (<syntax.CanBeAbstract>parentElement).isAbstract = true;
                processed = true;
                break;
            case ts.SyntaxKind.DotDotDotToken:
                if (parentElement.kind === SyntaxKind.Parameter) {
                    (<syntax.Parameter>parentElement).isDotDotDot = true;
                    processed = true;
                }
                break;
            case ts.SyntaxKind.TypeParameter:
                parentElement = processTypeParameter(<ts.TypeParameterDeclaration>node, <syntax.Generic>parentElement);
                processed = true;
                break;
            case ts.SyntaxKind.IndexSignature:
                if (parentElement.kind === SyntaxKind.InterfaceDeclaration) {
                    (<syntax.InterfaceDeclaration>parentElement).indexSignature = {
                        kind: <number>node.kind,
                        key: {
                            name: (<ts.IndexSignatureDeclaration>node).parameters[0].name.getText(),
                            kind: syntax.SyntaxKind.Parameter,
                            type: getType((<ts.IndexSignatureDeclaration>node).parameters[0].type),
                        },
                        type: getType((<ts.IndexSignatureDeclaration>node).type),
                    };
                    processed = true;
                }
                break;
            case ts.SyntaxKind.NumericLiteral:
            case ts.SyntaxKind.PrefixUnaryExpression:
                if (parentElement.kind === SyntaxKind.EnumMember) {
                    (<syntax.EnumMember>parentElement).value = node.getText();
                    processed = true;
                } else if (parentElement.kind === SyntaxKind.PropertySignature) {
                    processed = true;
                } else if (devMode) {
                    devMode(node);
                }
                break;
            case ts.SyntaxKind.Parameter:
                parentElement = processParameter(<ts.ParameterDeclaration>node, <syntax.MethodInfo>parentElement);
                break;
            case ts.SyntaxKind.PropertyDeclaration:
            case ts.SyntaxKind.PropertySignature:
                parentElement = processPropertyInfo(<syntax.ClassOrInterfaceLikeDeclaration>parentElement);
                break;
            case ts.SyntaxKind.CallSignature:
            case ts.SyntaxKind.Constructor:
            case ts.SyntaxKind.ConstructSignature:
                passThrough = true;
            case ts.SyntaxKind.MethodDeclaration:
            case ts.SyntaxKind.MethodSignature:
                parentElement = processMethodInfo(<syntax.ClassOrInterfaceLikeDeclaration>parentElement);
                break;
            case ts.SyntaxKind.VariableDeclaration:
                parentElement = processVariableDeclaration(<syntax.ModuleDeclaration>parentElement, node, results);
                break;
            case ts.SyntaxKind.FunctionDeclaration:
                parentElement = processFunctionDeclaration(<syntax.ModuleDeclaration>parentElement, results);
                break;
            case ts.SyntaxKind.ClassDeclaration:
                parentElement = processClassDeclaration(<syntax.ModuleDeclaration>parentElement, results);
                break;
            case ts.SyntaxKind.InterfaceDeclaration:
                parentElement = processInterfaceDeclaration(<syntax.ModuleDeclaration>parentElement, results);
                break;
            case ts.SyntaxKind.TypeAliasDeclaration:
                parentElement = processTypeAliasDeclaration(<syntax.ModuleDeclaration>parentElement, results);
                break;
            case ts.SyntaxKind.EnumDeclaration:
                parentElement = processEnum(SyntaxKind.EnumDeclaration, <syntax.ModuleDeclaration>parentElement, results);
                break;
            case ts.SyntaxKind.SourceFile:
                const sourceFile = <ts.SourceFile>node;
                const exportAssignment = <ts.ExportAssignment>sourceFile.statements.find(stmt => {
                    return (<ts.ExportAssignment>stmt).isExportEquals;
                });
                const exportName = exportAssignment && exportAssignment.expression && exportAssignment.expression.getText();
                if (exportName) {
                    const itemBeingExported = <ts.ModuleDeclaration>(<ts.ModuleBlock>node).statements.find(stmt => {
                        const itemSymbol = getSymbol(<any>stmt, checker);
                        return stmt.kind === ts.SyntaxKind.ModuleDeclaration && itemSymbol.name === exportName;
                    });
                    if (itemBeingExported) {
                        if (!parentElement) {
                            const itemSymbol = getSymbol(itemBeingExported, checker);
                            const documentation = ts.displayPartsToString(itemSymbol.getDocumentationComment(checker));
                            parentElement = <syntax.ModuleDeclaration>{
                                name: "\"" + path.resolve(sourceFile.fileName) + "\"",
                                documentation: documentation,
                                kind: syntax.SyntaxKind.ModuleDeclaration,
                                parent: null,
                                members: [],
                            };
                            addToParent(parentElement, null, results);
                        }

                        ts.forEachChild(itemBeingExported, child => {
                            processNode(child, parentElement, results, checker, devMode);
                        });
                        processed = true;
                    }
                }
                passThrough = true;
                break;
            case ts.SyntaxKind.ModuleBlock:
                if (parentElement && (<syntax.ModuleDeclaration>parentElement).amd) {
                    const exportAssignment = <ts.ExportAssignment>(<ts.ModuleBlock>node).statements.find(stmt => {
                        return (<ts.ExportAssignment>stmt).isExportEquals;
                    });
                    const exportName = exportAssignment && exportAssignment.expression && exportAssignment.expression.getText();
                    if (exportName) {
                        const itemBeingExported = <ts.ModuleDeclaration>(<ts.ModuleBlock>node).statements.find(stmt => {
                            const itemSymbol = getSymbol(<any>stmt, checker);
                            return stmt.kind === ts.SyntaxKind.ModuleDeclaration && itemSymbol.name === exportName;
                        });
                        if (itemBeingExported) {
                            ts.forEachChild(itemBeingExported, child => {
                                processNode(child, parentElement, results, checker, devMode);
                            });
                            processed = true;
                        }
                    }
                }
                break;
            case ts.SyntaxKind.ModuleDeclaration:
                parentElement = processModule(<ts.ModuleDeclaration>node, <syntax.ModuleDeclaration>parentElement, results);
                break;
            case ts.SyntaxKind.HeritageClause:
                parentElement = processHeritageClause(<ts.HeritageClause>node, <syntax.Inheritable>parentElement, devMode);
                passThrough = true;
                break;
            case ts.SyntaxKind.EnumMember:
                parentElement = processEnumMember(<ts.EnumMember>node, <syntax.EnumDeclaration>parentElement);
                break;
            default:
                break;
        }

        if (ignoreElement || processed) {
            return;
        }

        const symbol = getSymbol(<ts.Declaration>node, checker);
        if (symbol) {
            parentElement.name = symbol.name;
            parentElement.documentation = ts.displayPartsToString(symbol.getDocumentationComment(checker));
        } else if (!passThrough && devMode) {
            devMode(node);
        }

        ts.forEachChild(node, child => {
            processNode(child, parentElement, results, checker, devMode);
        });
    }

    function getSymbol(node: ts.NamedDeclaration, checker: ts.TypeChecker) {
        const symbolName = (<ts.NamedDeclaration>node).name;
        let symbol: ts.Symbol;
        if (symbolName) {
            symbol = checker.getSymbolAtLocation(symbolName);
        }
        return symbol;
    }

    function getType(node: ts.Node): syntax.Type {
        return node.getText();
    }

    function addToParent<T extends syntax.Element, U extends T>(element: U, parentElement: syntax.ContainerElement<T>, rootElements: syntax.Element[]) {
        if (parentElement) {
            parentElement.members.push(element);
        } else {
            rootElements.push(element);
        }

        return element;
    }

    function processParameter(node: ts.ParameterDeclaration, parentElement: syntax.MethodInfo): syntax.Parameter {
        const parameter: syntax.Parameter = {
            kind: SyntaxKind.Parameter,
        };
        parentElement.parameters.push(parameter);
        return parameter;
    }

    function processPropertyInfo(parentElement: syntax.ClassOrInterfaceLikeDeclaration): syntax.PropertyInfo {
        const property: syntax.PropertyInfo = {
            kind: SyntaxKind.PropertySignature,
        };
        return addToParent(property, parentElement, []);
    }

    function processMethodInfo(parentElement: syntax.ClassOrInterfaceLikeDeclaration): syntax.MethodInfo {
        const method: syntax.MethodInfo = {
            kind: SyntaxKind.MethodSignature,
            parameters: [],
            typeParameters: [],
        };
        return addToParent(method, parentElement, []);
    }

    function processVariableDeclaration(parentModule: syntax.ModuleDeclaration, node: ts.Node, rootElements: syntax.Element[]): syntax.VariableDeclaration {
        const variableStmt: syntax.VariableDeclaration = {
            kind: SyntaxKind.VariableDeclaration,
            isConst: isVarConst(node),
        };
        return addToParent(variableStmt, parentModule, rootElements);
    }

    function processFunctionDeclaration(parentModule: syntax.ModuleDeclaration, rootElements: syntax.Element[]): syntax.FunctionDeclaration {
        const functionElement: syntax.FunctionDeclaration = {
            kind: SyntaxKind.FunctionDeclaration,
            parameters: [],
            typeParameters: [],
        };
        return addToParent(functionElement, parentModule, rootElements);
    }

    function processTypeParameter(node: ts.TypeParameterDeclaration, parentElement: syntax.Generic): syntax.TypedElement {
        const element: syntax.TypedElement = {
            kind: <number>node.kind,
            type: getType(node),
        };
        parentElement.typeParameters.push(element);
        return element;
    }

    function processClassDeclaration(parentModule: syntax.ModuleDeclaration, rootElements: syntax.Element[]): syntax.ClassDeclaration {
        const classElement: syntax.ClassDeclaration = {
            kind: SyntaxKind.ClassDeclaration,
            typeParameters: [],
            members: [],
        };
        return addToParent(classElement, parentModule, rootElements);
    }

    function processInterfaceDeclaration(parentModule: syntax.ModuleDeclaration, rootElements: syntax.Element[]): syntax.InterfaceDeclaration {
        const interfaceElement: syntax.InterfaceDeclaration = {
            kind: SyntaxKind.InterfaceDeclaration,
            typeParameters: [],
            members: [],
        };
        return addToParent(interfaceElement, parentModule, rootElements);
    }

    function processTypeAliasDeclaration(parentModule: syntax.ModuleDeclaration, rootElements: syntax.Element[]): syntax.TypeAliasDeclaration {
        const typeAliasElement: syntax.TypeAliasDeclaration = {
            kind: SyntaxKind.TypeAliasDeclaration,
            typeParameters: [],
        };
        return addToParent(typeAliasElement, parentModule, rootElements);
    }

    function processEnum(kind: SyntaxKind, parentModule: syntax.ModuleDeclaration, rootElements: syntax.Element[]): syntax.EnumDeclaration {
        const entity: syntax.EnumDeclaration = {
            kind: kind,
            members: [],
        };
        return addToParent(entity, parentModule, rootElements);
    }

    function processEnumMember(node: ts.EnumMember, parentEnum: syntax.EnumDeclaration): syntax.EnumMember {
        const member: syntax.EnumMember = {
            kind: SyntaxKind.EnumMember,
        };
        return addToParent(member, parentEnum, []);
    }

    function processModule(moduleNode: ts.ModuleDeclaration, parentModule: syntax.ModuleDeclaration, rootElements: syntax.Element[]): syntax.ModuleDeclaration {
        const potentialResults = <syntax.ModuleDeclaration[]>(parentModule ? parentModule.members : rootElements).filter(el => el.kind === SyntaxKind.ModuleDeclaration);
        let moduleResult = potentialResults.find(result => {
            return result.name === moduleNode.name.text
                && result.parent === parentModule;
        });
        if (!moduleResult) {
            moduleResult = createModuleDeclaration(parentModule);
            addToParent(moduleResult, parentModule, rootElements);
        }

        return moduleResult;
    }

    function processHeritageClause(node: ts.HeritageClause, parentElement: syntax.Inheritable, devMode: (node: ts.Node) => void): syntax.HeritageClause {
        const heritageClause: syntax.HeritageClause = {
            kind: SyntaxKind.HeritageClause,
            types: [],
        };
        if (node.token === ts.SyntaxKind.ExtendsKeyword) {
            parentElement.extends = heritageClause;
        } else if (node.token === ts.SyntaxKind.ImplementsKeyword) {
            parentElement.implements = heritageClause;
        } else if (devMode) {
            devMode(node);
        }

        return heritageClause;
    }

    function createModuleDeclaration(parentModule?: syntax.ModuleDeclaration): syntax.ModuleDeclaration {
        return {
            kind: SyntaxKind.ModuleDeclaration,
            parent: parentModule,
            members: [],
            toJSON: toModuleJSON,
        };
    }

    function cloneModuleDeclaration(item: syntax.ModuleDeclaration): syntax.ModuleDeclaration {
        const members = item.members.slice();
        return {
            name: item.name,
            kind: item.kind,
            parent: item.parent,
            members: members,
            amd: item.amd,
            documentation: item.documentation,
            toJSON: toModuleJSON,
        };
    }

    function toModuleJSON(): syntax.ModuleDeclaration {
        return {
            name: this.name,
            kind: this.kind,
            parent: undefined,
            members: this.members,
            amd: this.amd,
            documentation: this.documentation,
        };
    }

    function isVarConst(node: ts.Node) {
        return !!(ts.getCombinedNodeFlags(node) & ts.NodeFlags.Const);
    }
}
