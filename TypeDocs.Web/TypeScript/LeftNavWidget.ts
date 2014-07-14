module TypeDocs.Web {
    var template =
        "<script type='text/html' id='typedocs-web-leftNav-template'>" +
            "<div class='typedocs-web-leftNav-itemExpander' data-bind='click: onExpanderClick'>" +
                "<!-- ko if: canExpand && expanded() -->" +
                    "<svg height='16' width='16'><polygon points='4,7 12,7 8,11' /></svg>" +
                "<!-- /ko -->" +
                "<!-- ko if: canExpand && !expanded() -->" +
                    "<svg height='16' width='16'><polygon points='7,4 7,12 11,8' /></svg>" +
                "<!-- /ko -->" +
            "</div>" +
            "<div class='typedocs-web-leftNav-item'>" +
                "<div class='typedocs-web-leftNav-item-title' data-bind=\"text: name, click: function () { $root.onItemClick($data); }, css: { 'typedocs-web-leftNav-item-selected': selected }\"></div>" +
                "<!-- ko if: canExpand && expanded() -->" +
                    "<ul data-bind='foreach: items'>" +
                        "<li data-bind=\"template: { name: 'typedocs-web-leftNav-template', data: $data }\"></li>" +
                    "</ul>" +
                "<!-- /ko -->" +
            "</div>" +
        "</script>" +
        "<ul data-bind='foreach: modules'>" +
            "<li data-bind=\"template: { name: 'typedocs-web-leftNav-template', data: $data }\"></li>" +
        "</ul>";

    export class LeftNavViewModel {
        constructor(modules: ModuleViewModel[]) {
            this.modules = modules;
            if (this.modules && this.modules.length) {
                this.selectedElement(this.modules[0]);
            }
        }

        public selectedElement = ko.observable<ElementViewModel>();

        public modules: ModuleViewModel[];

        public onItemClick(element: ElementViewModel): void {
            if (this.selectedElement()) {
                this.selectedElement().selected(false);
            }

            if (element) {
                element.selected(true);
            }

            this.selectedElement(element);
        }
    }

    export class LeftNavWidget {
        private _element: HTMLElement;
        private _viewModel: LeftNavViewModel;

        constructor(element: HTMLElement, viewModel: LeftNavViewModel) {
            this._element = element;
            this._viewModel = viewModel;

            this._element.innerHTML = template;
            ko.applyBindings(viewModel, element);
        }
    }
}
