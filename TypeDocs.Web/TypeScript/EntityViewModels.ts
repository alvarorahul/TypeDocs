module TypeDocs.Web {
    export function createElement(tsElement: TypeDocs.Syntax.Element): ElementViewModel {
        switch (tsElement.elementType) {
            case ElementType.Module:
                return new ModuleViewModel(<TypeDocs.Syntax.Module>tsElement);
            case ElementType.Parameter:
            case ElementType.Property:
                return new VariableViewModel(<TypeDocs.Syntax.Variable>tsElement);
            case ElementType.Interface:
            case ElementType.Indexer:
                return new InterfaceViewModel(<TypeDocs.Syntax.Interface>tsElement);
            case ElementType.Class:
                return new ClassViewModel(<TypeDocs.Syntax.Class>tsElement);
            case ElementType.Enum:
                return new EnumViewModel(<TypeDocs.Syntax.Enum>tsElement);
            case ElementType.Function:
            case ElementType.Constructor:
                return new FunctionViewModel(<TypeDocs.Syntax.Function>tsElement);
            case ElementType.EnumValue:
                return new EnumValueViewModel(<TypeDocs.Syntax.EnumValue>tsElement);
            default:
                return new ElementViewModel(tsElement);
        }
    }

    export class ElementViewModel {
        private _tsElement: TypeDocs.Syntax.Element;
        private _expanded: KnockoutObservable<boolean>;

        constructor(tsElement: TypeDocs.Syntax.Element) {
            this._tsElement = tsElement;
            this._expanded = ko.observable(tsElement.elementType === ElementType.Module);
        }

        public get name(): string {
            return this._tsElement.name;
        }

        public get fullName(): string {
            return this._tsElement.name;
        }

        public get description(): string {
            return this._tsElement.description;
        }

        public get elementType(): TypeDocs.ElementType {
            return this._tsElement.elementType;
        }

        public selected = ko.observable<boolean>();

        public get canExpand(): boolean {
            var typeCanExpand =
                    this._tsElement.elementType === ElementType.Module ||
                    this._tsElement.elementType === ElementType.Class ||
                    this._tsElement.elementType === ElementType.Interface,
                containerElement = <TypeDocs.Syntax.ContainerElement>this._tsElement;

            return typeCanExpand && containerElement.items && containerElement.items.length > 0;
        }

        public get expanded(): KnockoutObservable<boolean> {
            return this._expanded;
        }

        public onExpanderClick(): void {
            this._expanded(!this._expanded());
        }
    }

    export class ModuleViewModel extends ElementViewModel {
        private _tsModule: TypeDocs.Syntax.Module;
        private _items: ElementViewModel[];
        private _modules: ModuleViewModel[];
        private _variables: VariableViewModel[];
        private _interfaces: InterfaceViewModel[];
        private _classes: ClassViewModel[];
        private _enums: EnumViewModel[];
        private _functions: FunctionViewModel[];

        constructor(tsModule: TypeDocs.Syntax.Module) {
            super(tsModule);
            this._tsModule = tsModule;
            this._items = tsModule.items.map(item => createElement(item));
            this._modules = <ModuleViewModel[]>this._items.filter(c => c.elementType === ElementType.Module);
            this._variables = <VariableViewModel[]>this._items.filter(c => c.elementType === ElementType.Property);
            this._interfaces = <InterfaceViewModel[]>this._items.filter(c => c.elementType === ElementType.Interface);
            this._classes = <ClassViewModel[]>this._items.filter(c => c.elementType === ElementType.Class);
            this._enums = <EnumViewModel[]>this._items.filter(c => c.elementType === ElementType.Enum);
            this._functions = <FunctionViewModel[]>this._items.filter(c => c.elementType === ElementType.Function);
        }

        public get fullName(): string {
            return this._tsModule.fullName;
        }

        public get items(): ElementViewModel[] {
            return this._items;
        }

        public get modules(): ModuleViewModel[] {
            return this._modules;
        }

        public get variables(): VariableViewModel[] {
            return this._variables;
        }

        public get interfaces(): InterfaceViewModel[] {
            return this._interfaces;
        }

        public get classes(): ClassViewModel[] {
            return this._classes;
        }

        public get enums(): EnumViewModel[] {
            return this._enums;
        }

        public get functions(): FunctionViewModel[] {
            return this._functions;
        }
    }

    export class VariableViewModel extends ElementViewModel {
        private _tsVariable: TypeDocs.Syntax.Variable;

        constructor(tsVariable: TypeDocs.Syntax.Variable) {
            super(tsVariable);
            this._tsVariable = tsVariable;
        }

        public get type(): string {
            return this._tsVariable.type;
        }
    }

    export class ClassInterfaceBaseViewModel extends ElementViewModel {
        private _tsClassInterfaceBase: TypeDocs.Syntax.ClassInterfaceBase;
        private _expandableItems: ElementViewModel[];
        private _ctors: FunctionViewModel[];
        private _indexers: VariableViewModel[];
        private _properties: VariableViewModel[];
        private _methods: FunctionViewModel[];

        constructor(tsClassInterfaceBase: TypeDocs.Syntax.ClassInterfaceBase) {
            super(tsClassInterfaceBase);
            this._tsClassInterfaceBase = tsClassInterfaceBase;
            var items = tsClassInterfaceBase.items.map(createElement);
            this._expandableItems = items.filter(
                c => c.elementType === ElementType.Function || c.elementType === ElementType.Constructor);
            this._ctors = <FunctionViewModel[]>items.filter(c => c.elementType === ElementType.Constructor);
            this._indexers = <VariableViewModel[]>items.filter(c => c.elementType === ElementType.Indexer);
            this._properties = <VariableViewModel[]>items.filter(c => c.elementType === ElementType.Property);
            this._methods = <FunctionViewModel[]>items.filter(c => c.elementType === ElementType.Function);
        }

        public get fullName(): string {
            return this._tsClassInterfaceBase.nameWithParameters;
        }

        public get items(): ElementViewModel[] {
            return this._expandableItems;
        }

        public get ctors(): FunctionViewModel[] {
            return this._ctors;
        }

        public get indexers(): VariableViewModel[] {
            return this._indexers;
        }

        public get properties(): VariableViewModel[] {
            return this._properties;
        }

        public get methods(): FunctionViewModel[] {
            return this._methods;
        }
    }

    export class InterfaceViewModel extends ClassInterfaceBaseViewModel {
    }

    export class ClassViewModel extends ClassInterfaceBaseViewModel {
    }

    export class EnumViewModel extends ElementViewModel {
        private _enumValues: EnumValueViewModel[];

        constructor(tsEnum: TypeDocs.Syntax.Enum) {
            super(tsEnum);
            this._enumValues = tsEnum.items.filter(c => c.elementType === ElementType.EnumValue).map(createElement);
        }

        public get enumValues(): EnumValueViewModel[] {
            return this._enumValues;
        }
    }

    export class EnumValueViewModel extends ElementViewModel {
    }

    export class FunctionViewModel extends ElementViewModel {
        private _parameters: VariableViewModel[];
        private _returns: VariableViewModel;

        constructor(tsFunction: TypeDocs.Syntax.Function) {
            super(tsFunction);
            this._parameters = <VariableViewModel[]>tsFunction.parameters.map(createElement);
            if (tsFunction.returns) {
                this._returns = new VariableViewModel(tsFunction.returns);
            }
        }

        public get parameters(): VariableViewModel[]{
            return this._parameters;
        }

        public get returns(): VariableViewModel {
            return this._returns;
        }
    }
}
