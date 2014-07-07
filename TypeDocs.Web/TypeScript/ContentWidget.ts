module TypeDocs.Web {
    var getTypeTemplate = function (title: string, propertyName: string, hasType: boolean = false) {
            var returnValue =
                "<!-- ko if: " + propertyName + "() && " + propertyName + "().length -->" +
                    "<h3>" + title + "</h3>" +
                    "<table>" +
                        "<thead>" +
                            "<tr>" +
                                "<td>Name</td>" +
                                (hasType ? "<td>Type</td>" : "") +
                                "<td>Description</td>" +
                            "</tr>" +
                        "</thead>" +
                        "<tbody data-bind='foreach: " + propertyName + "'>" +
                            "<tr>" +
                                "<td data-bind='text: name'></td>" +
                                (hasType ? "<td data-bind='text: type'></td>" : "") +
                                "<td data-bind='text: description'></td>" +
                            "</tr>" +
                        "</tbody>" +
                    "</table>" +
                "<!-- /ko -->";
            return returnValue;
        },
        template =
            "<h2 data-bind='text: fullName'></h2>" +
            "<div data-bind='text: description'></div>" +
            getTypeTemplate("Modules", "$data.modules") +
            getTypeTemplate("Variables", "$data.variables", true) +
            getTypeTemplate("Interfaces", "$data.interfaces") +
            getTypeTemplate("Classes", "$data.classes") +
            getTypeTemplate("Parameters", "$data.parameters", true) +
            getTypeTemplate("Return Value", "$data.returns", true) +
            getTypeTemplate("Enums", "$data.enums") +
            getTypeTemplate("Members", "$data.enumValues") +
            getTypeTemplate("Functions", "$data.functions") +
            getTypeTemplate("Constructor", "$data.ctors") +
            getTypeTemplate("Indexer", "$data.indexers", true) +
            getTypeTemplate("Properties", "$data.properties", true) +
            getTypeTemplate("Methods", "$data.methods");

    export class ContentViewModel {
        constructor(element: KnockoutObservable<ElementViewModel>) {
            element.subscribe((newElement) => {
                this.fullName(newElement && newElement.fullName);
                this.description(newElement && newElement.description);
                var moduleViewModel = <ModuleViewModel>newElement;
                this.modules(moduleViewModel && moduleViewModel.modules);
                this.variables(moduleViewModel && moduleViewModel.variables);
                this.interfaces(moduleViewModel && moduleViewModel.interfaces);
                this.classes(moduleViewModel && moduleViewModel.classes);
                this.enums(moduleViewModel && moduleViewModel.enums);
                this.functions(moduleViewModel && moduleViewModel.functions);

                var classViewModel = <ClassViewModel>newElement;
                this.ctors(classViewModel && classViewModel.ctors);
                this.indexers(classViewModel && classViewModel.indexers);
                this.properties(classViewModel && classViewModel.properties);
                this.methods(classViewModel && classViewModel.methods);

                var enumViewModel = <EnumViewModel>newElement;
                this.enumValues(enumViewModel && enumViewModel.enumValues);

                var functionViewModel = <FunctionViewModel>newElement;
                this.parameters(functionViewModel && functionViewModel.parameters);
                this.returns(functionViewModel && functionViewModel.returns && [functionViewModel.returns]);
            });
        }

        public fullName = ko.observable<string>();

        public description = ko.observable<string>();

        public modules = ko.observableArray<ModuleViewModel>();

        public variables = ko.observableArray<VariableViewModel>();

        public interfaces = ko.observableArray<InterfaceViewModel>();

        public classes = ko.observableArray<ClassViewModel>();

        public parameters = ko.observableArray<VariableViewModel>();

        public returns = ko.observableArray<VariableViewModel>();

        public enums = ko.observableArray<EnumViewModel>();

        public enumValues = ko.observableArray<EnumValueViewModel>();

        public functions = ko.observableArray<FunctionViewModel>();

        public ctors = ko.observableArray<FunctionViewModel>();

        public indexers = ko.observableArray<VariableViewModel>();

        public properties = ko.observableArray<VariableViewModel>();

        public methods = ko.observableArray<FunctionViewModel>();
    }

    export class ContentWidget {
        private _element: HTMLElement;
        private _viewModel: ContentViewModel;

        constructor(element: HTMLElement, viewModel: ContentViewModel) {
            this._element = element;
            this._viewModel = viewModel;

            this._element.innerHTML = template;

            ko.applyBindings(this._viewModel, this._element);
        }
    }
} 