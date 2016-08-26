import * as ts from "typescript";
import * as syntax from "./syntax";

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
         * Callback to execute in dev mode when an unexpected situation is encountered.
         */
        devMode?: (node: ts.Node) => void;
    }

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
        };
        const program = ts.createProgram(fileNames, compilerOptions);
        const checker = program.getTypeChecker();

        program.getSourceFiles().forEach(sourceFile => {
            ts.forEachChild(sourceFile, node => {
                processNode(node, null, result, checker, options.devMode);
            });
        });

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
            case ts.SyntaxKind.Identifier:
            case ts.SyntaxKind.DeclareKeyword:
            case ts.SyntaxKind.ImportEqualsDeclaration:
            case ts.SyntaxKind.ExportAssignment:
            case ts.SyntaxKind.EndOfFileToken:
                ignoreElement = true;
                break;
            case ts.SyntaxKind.VariableStatement:
            case ts.SyntaxKind.VariableDeclarationList:
            case ts.SyntaxKind.ModuleBlock:
            case ts.SyntaxKind.SourceFile:
                passThrough = true;
                break;
            case ts.SyntaxKind.VoidKeyword:
            case ts.SyntaxKind.AnyKeyword:
            case ts.SyntaxKind.BooleanKeyword:
            case ts.SyntaxKind.NumberKeyword:
            case ts.SyntaxKind.StringKeyword:
            case ts.SyntaxKind.TypePredicate:
            case ts.SyntaxKind.TypeReference:
            case ts.SyntaxKind.FunctionType:
            case ts.SyntaxKind.ConstructorType:
            case ts.SyntaxKind.TypeQuery:
            case ts.SyntaxKind.ArrayType:
            case ts.SyntaxKind.TypeLiteral:
            case ts.SyntaxKind.TupleType:
            case ts.SyntaxKind.UnionType:
            case ts.SyntaxKind.IntersectionType:
            case ts.SyntaxKind.ParenthesizedType:
            case ts.SyntaxKind.ThisType:
            case ts.SyntaxKind.StringLiteralType:
            case ts.SyntaxKind.ExpressionWithTypeArguments:
                const typeElement = getType(node);
                if (typedKinds[parentElement.kind]) {
                    (<syntax.TypedElement>parentElement).type = typeElement;
                    processed = true;
                } else if (parentElement.kind === SyntaxKind.HeritageClause) {
                    (<syntax.HeritageClause>parentElement).types.push(typeElement);
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
                        name: (<ts.IndexSignatureDeclaration>node).parameters[0].name.getText(),
                        type: getType((<ts.IndexSignatureDeclaration>node).parameters[0].type),
                    };
                    processed = true;
                }
                break;
            case ts.SyntaxKind.StringLiteral:
                if (parentElement.kind === SyntaxKind.ModuleDeclaration) {
                    (<syntax.ModuleDeclaration>parentElement).amd = true;
                    processed = true;
                    break;
                }
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
            case ts.SyntaxKind.PropertySignature:
            case ts.SyntaxKind.PropertyDeclaration:
                parentElement = processPropertyInfo(<syntax.ClassOrInterfaceLikeDeclaration>parentElement);
                break;
            case ts.SyntaxKind.CallSignature:
            case ts.SyntaxKind.Constructor:
            case ts.SyntaxKind.ConstructSignature:
                passThrough = true;
            case ts.SyntaxKind.MethodSignature:
            case ts.SyntaxKind.MethodDeclaration:
                parentElement = processMethodInfo(<syntax.ClassOrInterfaceLikeDeclaration>parentElement);
                break;
            case ts.SyntaxKind.VariableDeclaration:
                parentElement = processVariableDeclaration(<syntax.ModuleDeclaration>parentElement, results);
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
            case ts.SyntaxKind.ModuleDeclaration:
                parentElement = processModule(<ts.ModuleDeclaration>node, <syntax.ModuleDeclaration>parentElement, results);
                break;
            case ts.SyntaxKind.HeritageClause:
                parentElement = processHeritageClause(<ts.HeritageClause>node, <syntax.Inheritable>parentElement, devMode);
                passThrough = true;
                break;
            case ts.SyntaxKind.EnumMember:
                parentElement = processEnumMember(<ts.EnumMember>node, <syntax.EnumDeclaration>parentElement);
            default:
                break;
        }

        if (ignoreElement || processed) {
            return;
        }

        // Process the symbol if available.
        const symbolName = (<ts.Declaration>node).name;
        let symbol: ts.Symbol;
        if (symbolName) {
            symbol = checker.getSymbolAtLocation(symbolName);
        }

        if (symbol) {
            parentElement.name = symbol.name;
            parentElement.documentation = ts.displayPartsToString(symbol.getDocumentationComment());
        } else if (!passThrough && devMode) {
            devMode(node);
        }

        ts.forEachChild(node, child => {
            processNode(child, parentElement, results, checker, devMode);
        });
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

    function processVariableDeclaration(parentModule: syntax.ModuleDeclaration, rootElements: syntax.Element[]): syntax.VariableDeclaration {
        const variableStmt: syntax.VariableDeclaration = {
            kind: SyntaxKind.VariableDeclaration,
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
}
