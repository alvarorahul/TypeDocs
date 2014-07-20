module TypeDocs {
    "use strict";

    interface IUnifiedFunctionDeclarationSyntax {
        callSignature: TypeScript.CallSignatureSyntax;
        identifier?: TypeScript.ISyntaxToken;
        propertyName?: TypeScript.ISyntaxToken;
    }

    interface IUnifiedPropertySyntax extends TypeScript.ISyntaxElement {
        typeAnnotation: TypeScript.TypeAnnotationSyntax;
        propertyName: TypeScript.ISyntaxToken;
        questionToken?: TypeScript.ISyntaxToken;
    }

    interface IHeritageClauses {
        extendsClause: string;
        implementsClause: string;
    }

    interface IGeneratorInputInternal {
        /**
         * The TypeScript source to parse.
         */
        sourceText: TypeScript.ISimpleText;

        /**
         * True if the data is a declaration file; else false.
         */
        isDeclaration: boolean;

        /**
         * The name of the source file corresponding to the data.
         */
        sourceFileName: string;
    }

    /**
     * Provides the capability to generate object graph with documentation.
     */
    export class Generator {
        private _underscoreIsPrivate: boolean;
        private _commentInExtendsIndicatorText: string;
        private _commentInImplementsIndicatorText: string;
        private _inputs: IGeneratorInputInternal[];
        private _parseOptions: TypeScript.ParseOptions;
        private _modules: Syntax.Module[] = [];
        private _modulesWithElements: Syntax.Module[] = [];

        /**
         * Creates a new Generator.
         * 
         * @param inputs The TypeScript source to generate documentation for.
         * @param options Options used for controlling how documentation generation happens.
         */
        constructor(inputs: GeneratorInput[], options: GeneratorOptions) {
            if (!inputs || !Array.isArray(inputs)) {
                throw new Error("inputs parameter was not specified or is not an array.");
            }

            if (!options) {
                options = {};
            }

            this._inputs = inputs.map(input => {
                return {
                    sourceText: TypeScript.SimpleText.fromString(input.sourceText),
                    isDeclaration: input.isDeclaration,
                    sourceFileName: input.sourceFileName
                };
            });
            this._underscoreIsPrivate = !!options.underscoreIsPrivate;
            this._commentInExtendsIndicatorText = (options.commentInExtendsIndicatorText || "").toUpperCase();
            this._commentInImplementsIndicatorText = (options.commentInImplementsIndicatorText || "").toUpperCase();
            this._parseOptions = new TypeScript.ParseOptions(TypeScript.LanguageVersion.EcmaScript5, false);
        }

        /**
         * The list of root modules in a tree structure.
         */
        public get modules(): Syntax.Module[] {
            return this._modules;
        }

        /**
         * The flattened list of modules that contain at least one non-module element.
         */
        public get modulesWithElements(): Syntax.Module[] {
            return this._modulesWithElements;
        }

        private _tree: TypeScript.SyntaxTree;

        public process(): void {
            if (!TypeScript || !TypeScript.Parser) {
                throw new Error("TypeScript parser not available.");
            }

            this._inputs.forEach((input) => {
                this._tree = TypeScript.Parser.parse(
                    input.sourceFileName,
                    input.sourceText,
                    input.isDeclaration,
                    this._parseOptions);

                this._findAndProcessModules(this._tree.sourceUnit(), null);
            });
            this._getCommentsFromHeritageEntities();
            this._getModulesWithElements();
        }

        public static toJson(generator: Generator): string {
            return JSON.stringify(generator.modulesWithElements);
        }

        private _getCommentsFromHeritageEntities(): void {
            var itemsToProcess = this._getItemsWithHeritageComments(this.modules);
        }

        private _requiresFetchFromHeritage(input: string): boolean {
            return (this._commentInExtendsIndicatorText && input === this._commentInExtendsIndicatorText) ||
                (this._commentInImplementsIndicatorText && input === this._commentInImplementsIndicatorText);
        }

        private _getItemsWithHeritageComments(items: Syntax.ContainerElement[]): Syntax.ClassInterfaceBase[] {
            var results: Syntax.ClassInterfaceBase[] = [];
            items.forEach((item) => {
                if (item instanceof Syntax.Module) {
                    var moduleItems = this._getItemsWithHeritageComments(<Syntax.ContainerElement[]>item.items);
                    results.push.apply(results, moduleItems);
                } else if (item instanceof Syntax.Class || item instanceof Syntax.Interface) {
                    if (this._requiresFetchFromHeritage(item.description.toUpperCase()) ||
                        item.items.some(child => this._requiresFetchFromHeritage(child.description.toUpperCase()))) {
                        results.push(<Syntax.ClassInterfaceBase>item);
                    }
                }
            });
            return results;
        }

        private _findAndProcessModules(
            element: TypeScript.ISyntaxElement,
            parentModule: Syntax.Module,
            rootModuleNameStack?: TypeScript.ISyntaxToken[]): void {

            if (element instanceof TypeScript.ModuleDeclarationSyntax) {
                var moduleDeclaration = <TypeScript.ModuleDeclarationSyntax>element,
                    sourceModuleNameStack: TypeScript.ISyntaxToken[] = [],
                    sourceModuleNameStackForChildCalls: TypeScript.ISyntaxToken[],
                    currentModuleName = moduleDeclaration.name,
                    targetModules = this._modules,
                    targetModule: Syntax.Module = null;

                // Traverse the name of the current module
                while (currentModuleName instanceof TypeScript.QualifiedNameSyntax) {
                    sourceModuleNameStack.push((<TypeScript.QualifiedNameSyntax>currentModuleName).right);
                    currentModuleName = (<TypeScript.QualifiedNameSyntax>currentModuleName).left;
                }

                sourceModuleNameStack.push(<TypeScript.ISyntaxToken>currentModuleName);
                if (rootModuleNameStack) {
                    sourceModuleNameStack.push.apply(sourceModuleNameStack, rootModuleNameStack);
                }

                sourceModuleNameStackForChildCalls = sourceModuleNameStack.slice();

                // Create module docs if necessary
                while (sourceModuleNameStack.length) {
                    var newModuleName = sourceModuleNameStack.pop();
                    targetModule = targetModules.first(
                        current => current instanceof Syntax.Module && current.name === newModuleName.text());
                    if (targetModule) {
                        targetModules = <Syntax.Module[]>targetModule.items;
                        parentModule = targetModule;
                    } else {
                        var newModule = new Syntax.Module();
                        newModule.parent = parentModule;

                        newModule.name = newModuleName.text();

                        // TODO: refactor: START
                        var fullName = newModule.name,
                            parent = newModule.parent;

                        while (parent) {
                            fullName = parent.name + "." + fullName;
                            parent = parent.parent;
                        }

                        newModule.fullName = fullName;
                        // TODO: refactor: END

                        targetModules.push(newModule);
                        targetModules = <Syntax.Module[]>newModule.items;
                        targetModule = newModule;
                        parentModule = newModule;
                    }
                }

                // process module elements
                var moduleChildCount = moduleDeclaration.moduleElements.childCount();
                for (var i = 0; i < moduleChildCount; i++) {
                    var child = moduleDeclaration.moduleElements.childAt(i);

                    if (child instanceof TypeScript.ModuleDeclarationSyntax) {
                        this._findAndProcessModules(child, targetModule, sourceModuleNameStackForChildCalls);
                    } else if (child instanceof TypeScript.ClassDeclarationSyntax) {
                        var classDoc = this.createClassDoc(<TypeScript.ClassDeclarationSyntax>child);
                        if (classDoc) {
                            targetModule.items.push(classDoc);
                        }
                    } else if (child instanceof TypeScript.FunctionDeclarationSyntax) {
                        var functionDoc = this.createFunctionDoc(<TypeScript.FunctionDeclarationSyntax>child, child);
                        if (functionDoc) {
                            targetModule.items.push(functionDoc);
                        }
                    } else if (child instanceof TypeScript.InterfaceDeclarationSyntax) {
                        var interfaceDoc = this.createInterfaceDoc(<TypeScript.InterfaceDeclarationSyntax>child);
                        if (interfaceDoc) {
                            targetModule.items.push(interfaceDoc);
                        }
                    } else if (child instanceof TypeScript.EnumDeclarationSyntax) {
                        var enumDoc = this.createEnumDoc(<TypeScript.EnumDeclarationSyntax>child);
                        if (enumDoc) {
                            targetModule.items.push(enumDoc);
                        }
                    } else if (child instanceof TypeScript.VariableStatementSyntax) {
                        var variableDeclarators = (<TypeScript.VariableStatementSyntax>child).variableDeclaration.variableDeclarators,
                            variableCount = variableDeclarators.childCount();
                        if (variableCount > 0) {
                            if (variableCount === 1) {
                                var variableDoc = this.createPropertyDoc(<TypeScript.VariableDeclaratorSyntax>(<TypeScript.VariableStatementSyntax>child).variableDeclaration.variableDeclarators.childAt(0), child);
                                //var tsProperty = <TypeScript.VariableDeclaratorSyntax>(<TypeScript.VariableStatementSyntax>child)
                                //        .variableDeclaration
                                //        .variableDeclarators
                                //        .childAt(0),
                                //    variableDoc = this.createPropertyDoc(tsProperty, child);
                                if (variableDoc) {
                                    targetModule.items.push(variableDoc);
                                }
                            } else {
                                throw new Error("Unsupported module element");
                            }
                        }
                    } else {
                        throw new Error("Unsupported module element");
                    }
                }
            } else {
                var childCount = element.childCount();
                for (var j = 0; j < childCount; j++) {
                    var currentChild = element.childAt(j);
                    if (currentChild) {
                        this._findAndProcessModules(currentChild, parentModule);
                    }
                }
            }
        }

        private _getModulesWithElements(): void {
            this._modulesWithElements.splice(0, this._modulesWithElements.length);

            var modulesToProcess = this.modules.slice(0);

            while (modulesToProcess.length) {
                var targetModule = modulesToProcess.splice(0, 1)[0].clone(),
                    hasElements = false,
                    iterator = 0,
                    counter = 0;
                while (iterator < targetModule.items.length) {
                    if (targetModule.items[iterator] instanceof Syntax.Module) {
                        modulesToProcess.splice(counter++, 0, <Syntax.Module>targetModule.items.splice(iterator, 1)[0]);
                    } else {
                        iterator++;
                        hasElements = true;
                    }
                }

                if (hasElements) {
                    targetModule.parent = null;
                    this._modulesWithElements.push(targetModule);
                }
            }
        }

        private createFunctionDoc(
            tsFunction: IUnifiedFunctionDeclarationSyntax,
            docsElement: TypeScript.ISyntaxElement,
            alwaysGenerate: boolean = false): Syntax.Function {

            var functionDoc = new Syntax.Function(),
                functionComment = Generator.getJsDocComment(docsElement),
                tsParams = tsFunction.callSignature.parameterList.parameters,
                paramCount = tsParams.childCount();

            functionDoc.name = (tsFunction.identifier || tsFunction.propertyName || { text: () => undefined }).text();

            if (!alwaysGenerate && this._underscoreIsPrivate && functionDoc.name && functionDoc.name.charAt(0) === "_") {
                return null;
            }

            functionDoc.description = functionComment.description;

            if (tsFunction["modifiers"]) {
                Generator._setModifiers(tsFunction["modifiers"], functionDoc);
            }

            for (var i = 0; i < paramCount; i++) {
                var param: TypeScript.ParameterSyntax = <any>tsParams.childAt(i);
                if (param instanceof TypeScript.ParameterSyntax) {
                    var paramDoc = new Syntax.Parameter();
                    paramDoc.name = param.identifier.text();
                    paramDoc.description = functionComment.parameters[paramDoc.name];
                    if (param.typeAnnotation) {
                        paramDoc.type = param.typeAnnotation.type.fullText();
                    }

                    if (param.questionToken) {
                        paramDoc.optional = param.questionToken.kind() === TypeScript.SyntaxKind.QuestionToken;
                    }

                    functionDoc.parameters.push(paramDoc);
                }
            }

            if (tsFunction.callSignature && tsFunction.callSignature.typeAnnotation) {
                functionDoc.returns = new Syntax.Parameter();
                functionDoc.returns.type = tsFunction.callSignature.typeAnnotation.type.fullText();
                functionDoc.returns.description = functionComment.returns;
            }

            return functionDoc;
        }

        private static createTypeParameterDocs(typeParameters: TypeScript.ISeparatedSyntaxList): Syntax.TypeParameter[] {
            var parameterDocs: Syntax.TypeParameter[] = [],
                count = typeParameters.childCount();

            for (var i = 0; i < count; i++) {
                var child = typeParameters.childAt(i);
                if (child && !child.isToken()) {
                    var parameterDoc = new Syntax.TypeParameter();
                    parameterDoc.name = child.fullText();
                    parameterDocs.push(parameterDoc);
                }
            }

            return parameterDocs;
        }

        private createClassDoc(tsClass: TypeScript.ClassDeclarationSyntax): Syntax.Class {
            var classDoc = new Syntax.Class(),
                classComment = Generator.getJsDocComment(tsClass);

            classDoc.name = tsClass.identifier.text();

            if (this._underscoreIsPrivate && classDoc.name.charAt(0) === "_") {
                return null;
            }

            classDoc.description = classComment.description;

            if (tsClass.typeParameterList) {
                classDoc.typeParameters = Generator.createTypeParameterDocs(tsClass.typeParameterList.typeParameters);
            }

            if (tsClass.heritageClauses) {
                var clauses = Generator.createHeritageClausesDocs(tsClass.heritageClauses);
                classDoc.extendsClause = clauses.extendsClause;
                classDoc.implementsClause = clauses.implementsClause;
            }

            var memberCount = tsClass.classElements.childCount();
            for (var i = 0; i < memberCount; i++) {
                var node = tsClass.classElements.childAt(i);
                if (node instanceof TypeScript.ConstructorDeclarationSyntax) {
                    classDoc.ctor = this.createFunctionDoc(<TypeScript.ConstructorDeclarationSyntax>node, node);
                    classDoc.ctor.elementType = ElementType.Constructor;
                } else if (node instanceof TypeScript.MemberVariableDeclarationSyntax) {
                    var propertyDoc = this.createPropertyDoc((<TypeScript.MemberVariableDeclarationSyntax>node).variableDeclarator, node);
                    if (propertyDoc) {
                        classDoc.items.push(propertyDoc);
                    }
                } else if (node instanceof TypeScript.MemberFunctionDeclarationSyntax) {
                    var functionDoc = this.createFunctionDoc(<TypeScript.MemberFunctionDeclarationSyntax>node, node);
                    if (functionDoc) {
                        classDoc.items.push(functionDoc);
                    }
                } else {
                    throw new Error("Class member type not supported");
                }
            }

            return classDoc;
        }

        private createInterfaceDoc(tsInterface: TypeScript.InterfaceDeclarationSyntax): Syntax.Interface {
            var interfaceDoc = new Syntax.Interface(),
                interfaceComment = Generator.getJsDocComment(tsInterface);

            interfaceDoc.name = tsInterface.identifier.text();

            if (this._underscoreIsPrivate && interfaceDoc.name.charAt(0) === "_") {
                return null;
            }

            interfaceDoc.description = interfaceComment.description;

            if (tsInterface.typeParameterList) {
                interfaceDoc.typeParameters = Generator.createTypeParameterDocs(tsInterface.typeParameterList.typeParameters);
            }

            if (tsInterface.heritageClauses) {
                var clauses = Generator.createHeritageClausesDocs(tsInterface.heritageClauses);
                interfaceDoc.extendsClause = clauses.extendsClause;
                interfaceDoc.implementsClause = clauses.implementsClause;
            }

            var memberCount = tsInterface.body.typeMembers.childCount();
            for (var i = 0; i < memberCount; i++) {
                var node = tsInterface.body.typeMembers.childAt(i);
                if (node instanceof TypeScript.PropertySignatureSyntax) {
                    var propertyDoc = this.createPropertyDoc(<TypeScript.PropertySignatureSyntax>node, node, true);
                    interfaceDoc.items.push(propertyDoc);
                } else if (node instanceof TypeScript.MethodSignatureSyntax) {
                    var methodDoc = this.createFunctionDoc(<TypeScript.MethodSignatureSyntax>node, node, true);
                    interfaceDoc.items.push(methodDoc);
                } else if (node instanceof TypeScript.CallSignatureSyntax) {
                    var callSignatureDoc = this.createFunctionDoc({ callSignature: <TypeScript.CallSignatureSyntax>node }, node, true);
                    callSignatureDoc.elementType = ElementType.Constructor;
                    interfaceDoc.ctor = callSignatureDoc;
                } else if (node instanceof TypeScript.ConstructSignatureSyntax) {
                    var constructSignatureDoc = this.createFunctionDoc(<TypeScript.ConstructSignatureSyntax>node, node, true);
                    constructSignatureDoc.elementType = ElementType.Constructor;
                    interfaceDoc.ctor = constructSignatureDoc;
                } else if (node instanceof TypeScript.IndexSignatureSyntax) {
                    interfaceDoc.indexer = Generator.createIndexerDoc(<TypeScript.IndexSignatureSyntax>node);
                } else if (!node.isToken()) {
                    throw new Error("doc for this type not yet supported");
                }
            }

            return interfaceDoc;
        }

        private static createHeritageClausesDocs(tsHeritageClauses: TypeScript.ISyntaxList): IHeritageClauses {
            var heritageClauses: IHeritageClauses = { extendsClause: "", implementsClause: "" },
                heritageClauseCount = tsHeritageClauses.childCount();

            for (var i = 0; i < heritageClauseCount; i++) {
                var heritageClause = tsHeritageClauses.childAt(i);
                if (heritageClause.kind() === TypeScript.SyntaxKind.ExtendsHeritageClause) {
                    heritageClauses.extendsClause = heritageClause.fullText();
                } else if (heritageClause.kind() === TypeScript.SyntaxKind.ImplementsHeritageClause) {
                    heritageClauses.implementsClause = heritageClause.fullText();
                }
            }

            return heritageClauses;
        }

        private static createIndexerDoc(tsIndexer: TypeScript.IndexSignatureSyntax): Syntax.Indexer {
            var indexerDoc = new Syntax.Indexer();
            indexerDoc.name = tsIndexer.parameter.identifier.text();
            if (tsIndexer.typeAnnotation) {
                indexerDoc.type = tsIndexer.typeAnnotation.type.fullText();
            }
            return indexerDoc;
        }

        private createPropertyDoc(
            tsProperty: IUnifiedPropertySyntax,
            docsElement: TypeScript.ISyntaxElement,
            alwaysGenerate: boolean = false): Syntax.Variable {

            var propertyDoc = new Syntax.Variable(),
                propertyComment = Generator.getJsDocComment(docsElement);

            propertyDoc.name = tsProperty.propertyName.text();

            if (!alwaysGenerate && this._underscoreIsPrivate && propertyDoc.name.charAt(0) === "_") {
                return null;
            }

            propertyDoc.description = propertyComment.description;

            if (tsProperty["modifiers"]) {
                Generator._setModifiers(tsProperty["modifiers"], propertyDoc);
            }

            // TODO: use the tsProperty after refactoring to pass the correct tsProperty
            if (docsElement["modifiers"]) {
                Generator._setModifiers(docsElement["modifiers"], propertyDoc);
            }

            if (tsProperty.typeAnnotation) {
                propertyDoc.type = tsProperty.typeAnnotation.type.fullText();
            }

            if (tsProperty.questionToken) {
                propertyDoc.optional = tsProperty.questionToken.kind() === TypeScript.SyntaxKind.QuestionToken;
            }

            return propertyDoc;
        }

        private createEnumDoc(tsEnum: TypeScript.EnumDeclarationSyntax): Syntax.Enum {
            var enumDoc = new Syntax.Enum(),
                enumComment = Generator.getJsDocComment(tsEnum);

            enumDoc.name = tsEnum.identifier.text();

            if (this._underscoreIsPrivate && enumDoc.name.charAt(0) === "_") {
                return null;
            }

            enumDoc.description = enumComment.description;

            var childCount = tsEnum.enumElements.childCount();
            for (var i = 0; i < childCount; i++) {
                var child: TypeScript.EnumElementSyntax = <any>tsEnum.enumElements.childAt(i);
                if (child instanceof TypeScript.EnumElementSyntax) {
                    var enumValueDoc = new Syntax.EnumValue(),
                        enumValueComment = Generator.getJsDocComment(child);
                    enumValueDoc.name = child.propertyName.text();
                    enumValueDoc.description = enumValueComment.description;
                    enumDoc.items.push(enumValueDoc);
                }
            }

            return enumDoc;
        }

        private static getJsDocComment(element: TypeScript.ISyntaxElement): JsDocParser.JsDocComment {
            var commentText = "";

            if (element.leadingTriviaWidth()) {
                var triviaList = element.leadingTrivia(),
                    triviaCount = triviaList.count();
                for (var i = 0; i < triviaCount; i++) {
                    var current = triviaList.syntaxTriviaAt(i);
                    if (current.isComment()) {
                        commentText = commentText + current.fullText();
                    }
                }
            }

            return JsDocParser.parse(commentText);
        }

        private static _setModifiers(modifiers: TypeScript.ISyntaxList, element: Syntax.Element): void {
            var childCount = modifiers.childCount();
            for (var i = 0; i < childCount; i++) {
                var modifier = modifiers.childAt(i);
                if (modifier) {
                    if (modifier.kind() === TypeScript.SyntaxKind.PublicKeyword) {
                        element.isPublicExplicit = true;
                    } else if (modifier.kind() === TypeScript.SyntaxKind.PrivateKeyword) {
                        element.isPrivate = true;
                        element.isPublic = false;
                    } else if (modifier.kind() === TypeScript.SyntaxKind.StaticKeyword) {
                        element.isStatic = true;
                    }
                }
            }
        }
    }
}

declare var exports: { TypeDocs: typeof TypeDocs };
try {
    if (exports) {
        exports.TypeDocs = TypeDocs;
    }
} catch (e) { }
