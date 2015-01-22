import ko = require("knockout");

export = Main;

module Main {
    class Element {
        private _element: TypeDocs.Syntax.Element;

        constructor(element: TypeDocs.Syntax.Element) {
            this._element = element;
        }

        public get name(): string {
            return this._element.name;
        }

        public get description(): string {
            return this._element.description;
        }

        public get elementType(): number {
            return this._element.elementType;
        }

        public get elementTypeText(): string {
            return this._element.elementTypeText;
        }

        public get isPublic(): boolean {
            return this._element.isPublic;
        }

        public get isPublicExplicit(): boolean {
            return this._element.isPublicExplicit;
        }

        public get isPrivate(): boolean {
            return this._element.isPrivate;
        }

        public get isStatic(): boolean {
            return this._element.isStatic;
        }
    }

    class PropertyViewModelBase extends Element {
        private _propertyBaseDoc: TypeDocs.Syntax.ParameterPropertyBase;

        constructor(doc: TypeDocs.Syntax.ParameterPropertyBase) {
            super(doc);
            this._propertyBaseDoc = doc;
        }

        public get type(): string {
            return this._propertyBaseDoc.type;
        }

        public get optional(): boolean {
            return this._propertyBaseDoc.optional;
        }
    }

    class PropertyDocViewModel extends PropertyViewModelBase {
        private _doc: TypeDocs.Syntax.Variable;

        constructor(doc: TypeDocs.Syntax.Variable) {
            super(doc);
            this._doc = doc;
        }
    }

    class TypeParameterDocViewModel extends Element {
    }

    class ParameterDocViewModel extends PropertyViewModelBase {
        private _doc: TypeDocs.Syntax.Variable;

        constructor(doc: TypeDocs.Syntax.Variable) {
            super(doc);
            this._doc = doc;
        }
    }

    class FunctionDocViewModel extends Element {
        public expanded = ko.observable(false);

        private _doc: TypeDocs.Syntax.Function;

        constructor(doc: TypeDocs.Syntax.Function) {
            super(doc);
            this._doc = doc;
        }

        public onHeaderClick(): void {
            this.expanded(!this.expanded());
        }

        public get canExpand(): boolean {
            return !!this._doc.description || this._doc.parameters.length > 0 || !!this._doc.returns;
        }

        public get parameters(): TypeDocs.Syntax.Parameter[] {
            return this._doc.parameters;
        }

        public get returns(): TypeDocs.Syntax.Parameter {
            return this._doc.returns;
        }
    }

    class EnumValueDocViewModel extends Element {
    }

    class EnumDocViewModel extends Element {
        public expanded = ko.observable(false);

        private _doc: TypeDocs.Syntax.Enum;

        constructor(doc: TypeDocs.Syntax.Enum) {
            super(doc);
            this._doc = doc;
        }

        public get enumValues(): EnumValueDocViewModel[] {
            return this._doc.items.map(c => new EnumValueDocViewModel(c));
        }

        public get canExpand(): boolean {
            return !!this._doc.description || this._doc.items.length > 0;
        }

        public onHeaderClick(): void {
            this.expanded(!this.expanded());
        }
    }

    class IndexerDocViewModel extends PropertyViewModelBase {
        constructor(doc: TypeDocs.Syntax.Indexer) {
            super(doc);
        }
    }

    class ClassInterfaceBase extends Element {
        public expanded = ko.observable(false);

        private _doc: TypeDocs.Syntax.ClassInterfaceBase;

        constructor(doc: TypeDocs.Syntax.ClassInterfaceBase) {
            super(doc);
            this._doc = doc;
        }

        public get nameWithParameters(): string {
            return this._doc.nameWithParameters;
        }

        public get typeParameters(): TypeParameterDocViewModel[] {
            return this._doc.typeParameters.map(param => new TypeParameterDocViewModel(param));
        }

        public get extendsClause(): string {
            return this._doc.extendsClause;
        }

        public get implementsClause(): string {
            return this._doc.implementsClause;
        }

        public onHeaderClick(): void {
            this.expanded(!this.expanded());
        }

        public get canExpand(): boolean {
            return !!this._doc.ctor || !!this._doc.description || this._doc.items.length > 0;
        }

        public get properties(): PropertyDocViewModel[] {
            return this._doc.items.filter(c => c.elementType === TypeDocs.ElementType.Property).map(property => new PropertyDocViewModel(<any>property));
        }

        public get indexer(): IndexerDocViewModel {
            if (this._doc.indexer) {
                return new IndexerDocViewModel(this._doc.indexer);
            }

            return null;
        }

        public get ctor(): FunctionDocViewModel {
            if (this._doc.ctor) {
                return new FunctionDocViewModel(this._doc.ctor);
            }

            return null;
        }

        public get functions(): FunctionDocViewModel[] {
            return this._doc.items.filter(c => c.elementType === TypeDocs.ElementType.Function).map(functionDoc => new FunctionDocViewModel(<any>functionDoc));
        }
    }

    class ClassDocViewModel extends ClassInterfaceBase {
    }

    class InterfaceDocViewModel extends ClassInterfaceBase {
    }

    class ModuleViewModel extends Element {
        public expanded = ko.observable(false);

        private _doc: TypeDocs.Syntax.Module;

        constructor(doc: TypeDocs.Syntax.Module) {
            super(doc);
            this._doc = doc;
        }

        public get fullName(): string {
            return this._doc.fullName;
        }

        public get canExpand(): boolean {
            return this._doc.items.length > 0;
        }

        public get items(): Element[] {
            var functions = this._doc.items.filter(c => c instanceof TypeDocs.Syntax.Function).map(c => new FunctionDocViewModel(<TypeDocs.Syntax.Function>c)),
                classes = this._doc.items.filter(c => c instanceof TypeDocs.Syntax.Class).map(c => new ClassDocViewModel(<TypeDocs.Syntax.Class>c)),
                interfaces = this._doc.items.filter(c => c instanceof TypeDocs.Syntax.Interface).map(c => new InterfaceDocViewModel(<TypeDocs.Syntax.Interface>c)),
                modules = this._doc.items.filter(c => c instanceof TypeDocs.Syntax.Module).map(c => new ModuleViewModel(<TypeDocs.Syntax.Module>c)),
                enums = this._doc.items.filter(c => c instanceof TypeDocs.Syntax.Enum).map(c => new EnumDocViewModel(<TypeDocs.Syntax.Enum>c)),
                others = this._doc.items
                    .filter(c => {
                        return !(
                            c instanceof TypeDocs.Syntax.Module ||
                            c instanceof TypeDocs.Syntax.Class ||
                            c instanceof TypeDocs.Syntax.Interface ||
                            c instanceof TypeDocs.Syntax.Function ||
                            c instanceof TypeDocs.Syntax.Enum
                            );
                    })
                    .map(c => new Element(c));

            return [].concat(modules).concat(interfaces).concat(classes).concat(enums).concat(functions).concat(others);
        }

        public onHeaderClick(): void {
            this.expanded(!this.expanded());
        }
    }

    function getViewModel(generator: TypeDocs.Generator): any {
        return {
            modules: generator.modules.map(c => new ModuleViewModel(c)),
            modulesWithElements: generator.modulesWithElements.map(c => new ModuleViewModel(c)),
            showTree: ko.observable(true),
            showPrivateMembers: ko.observable(false),
            dynamicTemplate: function (item) {
                if (item instanceof ModuleViewModel) {
                    return "module-template";
                } else if (item instanceof ClassDocViewModel) {
                    return "class-template";
                } else if (item instanceof InterfaceDocViewModel) {
                    return "interface-template";
                } else if (item instanceof FunctionDocViewModel) {
                    return "function-template";
                } else if (item instanceof EnumDocViewModel) {
                    return "enum-template";
                } else {
                    return "base-template";
                }
            }
        };
    }

    var sourceFileName = "/Definitions/typedocs.d.ts";

    $.get(sourceFileName, function (data) {
        var inputs = [{
            sourceText: data,
            isDeclaration: true,
            sourceFileName: sourceFileName
        }],
            options = {
                underscoreIsPrivate: true
            },
            generator = new TypeDocs.Generator(inputs, options);

        generator.process();

        ko.applyBindings(
            getViewModel(generator),
            document.getElementById('content'));
    });
}