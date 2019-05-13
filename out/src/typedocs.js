"use strict";
const path = require("path");
const ts = require("typescript");
const websitegenerator = require("./websitegenerator");
var Main;
(function (Main) {
    "use strict";
    const typedKinds = {};
    typedKinds[141 /* PropertySignature */] = true;
    typedKinds[139 /* Parameter */] = true;
    typedKinds[143 /* MethodSignature */] = true;
    typedKinds[214 /* VariableDeclaration */] = true;
    typedKinds[216 /* FunctionDeclaration */] = true;
    typedKinds[219 /* TypeAliasDeclaration */] = true;
    const canBeOptionalKinds = {};
    canBeOptionalKinds[141 /* PropertySignature */] = true;
    canBeOptionalKinds[139 /* Parameter */] = true;
    canBeOptionalKinds[143 /* MethodSignature */] = true;
    const canHaveAccessibilityModifierKinds = {};
    canHaveAccessibilityModifierKinds[141 /* PropertySignature */] = true;
    canHaveAccessibilityModifierKinds[142 /* PropertyDeclaration */] = true;
    canHaveAccessibilityModifierKinds[143 /* MethodSignature */] = true;
    canHaveAccessibilityModifierKinds[144 /* MethodDeclaration */] = true;
    /**
     * Generates documentation for APIs present in the specified files.
     *
     * @param fileNames The list of files.
     * @param options The options used to generate documentation.
     * @returns The list of documentation elements.
     */
    function generate(fileNames, options) {
        options = options || {};
        const result = [];
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
    Main.generate = generate;
    function flattenModules(elements) {
        const flattenedModules = [];
        const moduleForRootElements = createModuleDeclaration();
        const modulesToProcess = [moduleForRootElements];
        elements.forEach(element => {
            if (element.kind === 221 /* ModuleDeclaration */) {
                modulesToProcess.push(element);
            }
            else {
                moduleForRootElements.members.push(element);
            }
        });
        while (modulesToProcess.length) {
            const currentModule = modulesToProcess.shift();
            const clonedModule = cloneModuleDeclaration(currentModule);
            clonedModule.members.length = 0; // Intentionally not assigning a new array so that toJSON continues to work.
            currentModule.members.forEach(member => {
                if (member.kind === 221 /* ModuleDeclaration */ && !currentModule.amd) {
                    const clonedChildModule = cloneModuleDeclaration(member);
                    clonedChildModule.name = `${currentModule.name}.${clonedChildModule.name}`;
                    modulesToProcess.push(clonedChildModule);
                }
                else {
                    clonedModule.members.push(member);
                }
            });
            if (clonedModule.members.length) {
                flattenedModules.push(clonedModule);
            }
        }
        return flattenedModules;
    }
    Main.flattenModules = flattenModules;
    function processNode(node, parentElement, results, checker, devMode) {
        let passThrough;
        let ignoreElement;
        let processed;
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
                    parentElement.type = typeElement;
                    processed = true;
                }
                else if (parentElement.kind === 246 /* HeritageClause */) {
                    parentElement.types.push(typeElement);
                    processed = true;
                }
                else if (parentElement.kind === 221 /* ModuleDeclaration */) {
                    parentElement.amd = true;
                    processed = true;
                }
                break;
            case ts.SyntaxKind.QuestionToken:
                if (canBeOptionalKinds[parentElement.kind]) {
                    parentElement.optional = true;
                    processed = true;
                }
                break;
            case ts.SyntaxKind.ConstKeyword:
                if (parentElement.kind === 220 /* EnumDeclaration */) {
                    parentElement.isConst = true;
                    processed = true;
                }
                break;
            case ts.SyntaxKind.PrivateKeyword:
                if (canHaveAccessibilityModifierKinds[parentElement.kind]) {
                    parentElement.isPrivate = true;
                    processed = true;
                }
                break;
            case ts.SyntaxKind.ProtectedKeyword:
                if (canHaveAccessibilityModifierKinds[parentElement.kind]) {
                    parentElement.isProtected = true;
                    processed = true;
                }
                break;
            case ts.SyntaxKind.StaticKeyword:
                if (canHaveAccessibilityModifierKinds[parentElement.kind]) {
                    parentElement.isStatic = true;
                    processed = true;
                }
                break;
            case ts.SyntaxKind.AbstractKeyword:
                parentElement.isAbstract = true;
                processed = true;
                break;
            case ts.SyntaxKind.DotDotDotToken:
                if (parentElement.kind === 139 /* Parameter */) {
                    parentElement.isDotDotDot = true;
                    processed = true;
                }
                break;
            case ts.SyntaxKind.TypeParameter:
                parentElement = processTypeParameter(node, parentElement);
                processed = true;
                break;
            case ts.SyntaxKind.IndexSignature:
                if (parentElement.kind === 218 /* InterfaceDeclaration */) {
                    parentElement.indexSignature = {
                        kind: node.kind,
                        key: {
                            name: node.parameters[0].name.getText(),
                            kind: 139 /* Parameter */,
                            type: getType(node.parameters[0].type),
                        },
                        type: getType(node.type),
                    };
                    processed = true;
                }
                break;
            case ts.SyntaxKind.NumericLiteral:
            case ts.SyntaxKind.PrefixUnaryExpression:
                if (parentElement.kind === 250 /* EnumMember */) {
                    parentElement.value = node.getText();
                    processed = true;
                }
                else if (parentElement.kind === 141 /* PropertySignature */) {
                    processed = true;
                }
                else if (devMode) {
                    devMode(node);
                }
                break;
            case ts.SyntaxKind.Parameter:
                parentElement = processParameter(node, parentElement);
                break;
            case ts.SyntaxKind.PropertyDeclaration:
            case ts.SyntaxKind.PropertySignature:
                parentElement = processPropertyInfo(parentElement);
                break;
            case ts.SyntaxKind.CallSignature:
            case ts.SyntaxKind.Constructor:
            case ts.SyntaxKind.ConstructSignature:
                passThrough = true;
            case ts.SyntaxKind.MethodDeclaration:
            case ts.SyntaxKind.MethodSignature:
                parentElement = processMethodInfo(parentElement);
                break;
            case ts.SyntaxKind.VariableDeclaration:
                parentElement = processVariableDeclaration(parentElement, node, results);
                break;
            case ts.SyntaxKind.FunctionDeclaration:
                parentElement = processFunctionDeclaration(parentElement, results);
                break;
            case ts.SyntaxKind.ClassDeclaration:
                parentElement = processClassDeclaration(parentElement, results);
                break;
            case ts.SyntaxKind.InterfaceDeclaration:
                parentElement = processInterfaceDeclaration(parentElement, results);
                break;
            case ts.SyntaxKind.TypeAliasDeclaration:
                parentElement = processTypeAliasDeclaration(parentElement, results);
                break;
            case ts.SyntaxKind.EnumDeclaration:
                parentElement = processEnum(220 /* EnumDeclaration */, parentElement, results);
                break;
            case ts.SyntaxKind.SourceFile:
                const sourceFile = node;
                const exportAssignment = sourceFile.statements.find(stmt => {
                    return stmt.isExportEquals;
                });
                const exportName = exportAssignment && exportAssignment.expression && exportAssignment.expression.getText();
                if (exportName) {
                    const itemBeingExported = node.statements.find(stmt => {
                        const itemSymbol = getSymbol(stmt, checker);
                        return stmt.kind === ts.SyntaxKind.ModuleDeclaration && itemSymbol.name === exportName;
                    });
                    if (itemBeingExported) {
                        if (!parentElement) {
                            const itemSymbol = getSymbol(itemBeingExported, checker);
                            const documentation = ts.displayPartsToString(itemSymbol.getDocumentationComment(checker));
                            parentElement = {
                                name: "\"" + path.resolve(sourceFile.fileName) + "\"",
                                documentation: documentation,
                                kind: 221 /* ModuleDeclaration */,
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
                if (parentElement && parentElement.amd) {
                    const exportAssignment = node.statements.find(stmt => {
                        return stmt.isExportEquals;
                    });
                    const exportName = exportAssignment && exportAssignment.expression && exportAssignment.expression.getText();
                    if (exportName) {
                        const itemBeingExported = node.statements.find(stmt => {
                            const itemSymbol = getSymbol(stmt, checker);
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
                parentElement = processModule(node, parentElement, results);
                break;
            case ts.SyntaxKind.HeritageClause:
                parentElement = processHeritageClause(node, parentElement, devMode);
                passThrough = true;
                break;
            case ts.SyntaxKind.EnumMember:
                parentElement = processEnumMember(node, parentElement);
                break;
            default:
                break;
        }
        if (ignoreElement || processed) {
            return;
        }
        const symbol = getSymbol(node, checker);
        if (symbol) {
            parentElement.name = symbol.name;
            parentElement.documentation = ts.displayPartsToString(symbol.getDocumentationComment(checker));
        }
        else if (!passThrough && devMode) {
            devMode(node);
        }
        ts.forEachChild(node, child => {
            processNode(child, parentElement, results, checker, devMode);
        });
    }
    function getSymbol(node, checker) {
        const symbolName = node.name;
        let symbol;
        if (symbolName) {
            symbol = checker.getSymbolAtLocation(symbolName);
        }
        return symbol;
    }
    function getType(node) {
        return node.getText();
    }
    function addToParent(element, parentElement, rootElements) {
        if (parentElement) {
            parentElement.members.push(element);
        }
        else {
            rootElements.push(element);
        }
        return element;
    }
    function processParameter(node, parentElement) {
        const parameter = {
            kind: 139 /* Parameter */,
        };
        parentElement.parameters.push(parameter);
        return parameter;
    }
    function processPropertyInfo(parentElement) {
        const property = {
            kind: 141 /* PropertySignature */,
        };
        return addToParent(property, parentElement, []);
    }
    function processMethodInfo(parentElement) {
        const method = {
            kind: 143 /* MethodSignature */,
            parameters: [],
            typeParameters: [],
        };
        return addToParent(method, parentElement, []);
    }
    function processVariableDeclaration(parentModule, node, rootElements) {
        const variableStmt = {
            kind: 214 /* VariableDeclaration */,
            isConst: isVarConst(node),
        };
        return addToParent(variableStmt, parentModule, rootElements);
    }
    function processFunctionDeclaration(parentModule, rootElements) {
        const functionElement = {
            kind: 216 /* FunctionDeclaration */,
            parameters: [],
            typeParameters: [],
        };
        return addToParent(functionElement, parentModule, rootElements);
    }
    function processTypeParameter(node, parentElement) {
        const element = {
            kind: node.kind,
            type: getType(node),
        };
        parentElement.typeParameters.push(element);
        return element;
    }
    function processClassDeclaration(parentModule, rootElements) {
        const classElement = {
            kind: 217 /* ClassDeclaration */,
            typeParameters: [],
            members: [],
        };
        return addToParent(classElement, parentModule, rootElements);
    }
    function processInterfaceDeclaration(parentModule, rootElements) {
        const interfaceElement = {
            kind: 218 /* InterfaceDeclaration */,
            typeParameters: [],
            members: [],
        };
        return addToParent(interfaceElement, parentModule, rootElements);
    }
    function processTypeAliasDeclaration(parentModule, rootElements) {
        const typeAliasElement = {
            kind: 219 /* TypeAliasDeclaration */,
            typeParameters: [],
        };
        return addToParent(typeAliasElement, parentModule, rootElements);
    }
    function processEnum(kind, parentModule, rootElements) {
        const entity = {
            kind: kind,
            members: [],
        };
        return addToParent(entity, parentModule, rootElements);
    }
    function processEnumMember(node, parentEnum) {
        const member = {
            kind: 250 /* EnumMember */,
        };
        return addToParent(member, parentEnum, []);
    }
    function processModule(moduleNode, parentModule, rootElements) {
        const potentialResults = (parentModule ? parentModule.members : rootElements).filter(el => el.kind === 221 /* ModuleDeclaration */);
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
    function processHeritageClause(node, parentElement, devMode) {
        const heritageClause = {
            kind: 246 /* HeritageClause */,
            types: [],
        };
        if (node.token === ts.SyntaxKind.ExtendsKeyword) {
            parentElement.extends = heritageClause;
        }
        else if (node.token === ts.SyntaxKind.ImplementsKeyword) {
            parentElement.implements = heritageClause;
        }
        else if (devMode) {
            devMode(node);
        }
        return heritageClause;
    }
    function createModuleDeclaration(parentModule) {
        return {
            kind: 221 /* ModuleDeclaration */,
            parent: parentModule,
            members: [],
            toJSON: toModuleJSON,
        };
    }
    function cloneModuleDeclaration(item) {
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
    function toModuleJSON() {
        return {
            name: this.name,
            kind: this.kind,
            parent: undefined,
            members: this.members,
            amd: this.amd,
            documentation: this.documentation,
        };
    }
    function isVarConst(node) {
        return !!(ts.getCombinedNodeFlags(node) & ts.NodeFlags.Const);
    }
})(Main || (Main = {}));
module.exports = Main;
